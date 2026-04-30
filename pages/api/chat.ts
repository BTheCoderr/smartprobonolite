import type { NextApiRequest, NextApiResponse } from 'next';
import { intakePrompt, extractionPrompt } from '@/lib/prompts/intakePrompt';
import {
  RI_EVICTION_SYSTEM_PROMPT,
  buildRiEvictionContextPayload,
  type RiIntakeContext,
} from '@/lib/prompts/riEvictionPrompt';
import { EMBEDDED_MATERIALS } from '@/lib/ri/embeddedMaterials';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { checkRateLimit, ipFromRequest } from '@/lib/rateLimit';
import { fetchWithTimeout } from '@/lib/resilience';
import {
  createLogger,
  getClientTraceIdFromPagesApi,
  getRequestIdFromPagesApi,
  logApiFlow,
  resolveSupabaseUserIdFromRequest,
  serializeErrorSafe,
} from '@/lib/logger';
import {
  CIRCUIT_CONFIG,
  CIRCUIT_NAMES,
  circuitIsOpen,
  circuitRecordFailure,
  circuitRecordSuccess,
  isRetryableUpstreamStatus,
} from '@/lib/circuitBreaker';
import { classifyIntent, type ChatIntent } from '@/lib/chat/intent';
import { intentFallback, type FallbackReason } from '@/lib/chat/intentFallbacks';
import { fetchRagContext } from '@/lib/agents/researchRag';
import { getLawFirmGraph } from '@/lib/agents/graph';
import { initialStateFrom, type LawFirmState } from '@/lib/agents/state';
import {
  AGENT_ORDER,
  nodeNameToAgent,
  serializeSseEvent,
  type AgentName,
  type StreamEvent,
} from '@/lib/agents/streaming';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function getRiMaterialsExcerpts(): string {
  return EMBEDDED_MATERIALS.filter((m) => m.extractedText && m.extractedText.length > 0)
    .map((m) => `[${m.title}]\n${m.extractedText}`)
    .join('\n\n---\n\n');
}

// RAG context is fetched via the shared helper in `lib/agents/researchRag.ts`
// so the legacy path and the LangGraph Research agent stay in lockstep.

/**
 * Pulls structured citation rows back out of the formatted RAG block so the
 * internal Agent Case Review panel can render them without re-querying.
 * Mirrors the layout produced by `buildRetrievalContextBlock`.
 */
function parseAgentCitations(
  block: string,
): Array<{ index: number; title: string; source: string; topic?: string }> {
  if (!block || typeof block !== 'string') return [];
  return block.split(/\n\n---\n\n/).flatMap((sec, i) => {
    const titleMatch = sec.match(/^Title:\s*(.+)$/m);
    const topicMatch = sec.match(/^Topic:\s*(.+)$/m);
    const sourceMatch = sec.match(/^Source:\s*(.+)$/m);
    if (!titleMatch && !sourceMatch) return [];
    return [
      {
        index: i + 1,
        title: titleMatch?.[1].trim() ?? 'Untitled',
        source: sourceMatch?.[1].trim() ?? 'Unknown source',
        ...(topicMatch ? { topic: topicMatch[1].trim() } : {}),
      },
    ];
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const started = Date.now();
  const requestId = getRequestIdFromPagesApi(req);
  const clientTraceId = getClientTraceIdFromPagesApi(req);

  const flow = (args: {
    outcome: 'success' | 'client_error' | 'rate_limited' | 'server_error';
    status_code: number;
    user_id?: string | null;
    error?: unknown;
    degraded_mode?: boolean;
    chat_mode?: string;
    message_count?: number;
    ai_provider?: string;
  }) => {
    const user_id = args.user_id ?? null;
    const base = {
      kind: 'api_flow' as const,
      request_id: requestId,
      route: '/api/chat',
      feature: 'chat',
      user_id,
      outcome: args.outcome,
      status_code: args.status_code,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
      degraded_mode: args.degraded_mode,
      chat_mode: args.chat_mode,
      message_count: args.message_count,
      ai_provider: args.ai_provider,
    };
    if (args.error) {
      const s = serializeErrorSafe(args.error);
      logApiFlow({
        ...base,
        error_type: s.error_type,
        error_code: s.error_code,
        error_message_safe: s.error_message_safe,
      });
    } else {
      logApiFlow(base);
    }
  };

  if (req.method !== 'POST') {
    flow({ outcome: 'client_error', status_code: 405 });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await resolveSupabaseUserIdFromRequest(req);

  const rl = checkRateLimit(`chat:${ipFromRequest(req)}`, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    flow({ outcome: 'rate_limited', status_code: 429, user_id: userId });
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  try {
    const { messages, uploadedText, mode, intakeContext, handoffContext, use_agents, stream } =
      req.body as {
        messages: Message[];
        uploadedText?: string;
        mode?: 'chat' | 'extract' | 'ri_eviction';
        intakeContext?: RiIntakeContext | null;
        /** Optional context from another tool (document prep, expungement summary, etc.). */
        handoffContext?: string;
        /** Per-request override for the LangGraph law-firm path (env: AGENTS_DEFAULT_ON). */
        use_agents?: boolean;
        /**
         * When true AND the agents path is engaged, the response is streamed as
         * Server-Sent Events (`text/event-stream`) with per-agent progress.
         * Otherwise the normal JSON response is returned. See
         * `lib/agents/streaming.ts` for the wire format.
         */
        stream?: boolean;
      };

    if (!messages || !Array.isArray(messages)) {
      flow({ outcome: 'client_error', status_code: 400, user_id: userId });
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const recentMessages = messages.slice(-(mode === 'ri_eviction' ? 6 : 5));
    const context = recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== 'user') {
      flow({
        outcome: 'client_error',
        status_code: 400,
        user_id: userId,
        chat_mode: mode,
        message_count: recentMessages.length,
      });
      return res.status(400).json({ error: 'Last message must be from user' });
    }

    const log = createLogger(requestId);

    const intentResult = classifyIntent(userMessage.content, {
      hasIntake: !!intakeContext,
    });
    const intent: ChatIntent = intentResult.intent;
    log.info('chat.intent_detected', {
      feature: 'chat',
      intent,
      matched_pattern: intentResult.matchedPattern,
      mode: mode ?? 'chat',
      has_intake: !!intakeContext,
    });

    const respondWithFallback = async (
      reason: FallbackReason,
      opts?: { ragDegraded?: boolean; ragCircuitOpen?: boolean; aiProvider?: string },
    ) => {
      const text =
        mode === 'extract'
          ? "I'm in limited mode right now and can't fully process the uploaded document. Please try again in a moment, or paste the most important section into the chat and I'll do my best."
          : intentFallback(intent, reason);
      log.info('chat.fallback_used', { feature: 'chat', intent, reason });
      const intentional =
        reason === 'greeting_skipped' ||
        reason === 'file_review_skipped' ||
        reason === 'capability_skipped';
      const degraded = !intentional;
      flow({
        outcome: 'success',
        status_code: 200,
        user_id: userId,
        degraded_mode: degraded,
        chat_mode: mode,
        message_count: recentMessages.length,
        ai_provider: opts?.aiProvider,
      });
      const degradation =
        degraded || opts?.ragDegraded || opts?.ragCircuitOpen
          ? {
              llm: degraded,
              rag: !!opts?.ragDegraded,
              ...(opts?.ragCircuitOpen && { rag_circuit_open: true }),
            }
          : undefined;
      return res.status(200).json({
        message: text,
        success: true,
        intent,
        ...(degraded && { degraded: true }),
        ...(degradation && { degradation }),
      });
    };

    if (
      (mode === 'ri_eviction' || mode === 'chat') &&
      intent === 'greeting'
    ) {
      return respondWithFallback('greeting_skipped');
    }

    if (
      (mode === 'ri_eviction' || mode === 'chat') &&
      intent === 'assistant_capabilities'
    ) {
      return respondWithFallback('capability_skipped');
    }

    if (
      (mode === 'ri_eviction' || mode === 'chat') &&
      intent === 'file_review' &&
      !uploadedText
    ) {
      return respondWithFallback('file_review_skipped');
    }

    /**
     * Feature-flagged six-agent LangGraph path. Runs only after the deterministic
     * short-circuits (greeting / capability / file-review-no-upload) so those stay
     * cheap and predictable. When this branch returns, the legacy linear path is
     * skipped entirely. Set `AGENTS_DEFAULT_ON=true` for global rollout, or pass
     * `use_agents: true` in the request body for per-call testing.
     */
    const useAgents =
      use_agents === true || process.env.AGENTS_DEFAULT_ON === 'true';
    if (useAgents && (mode === 'ri_eviction' || mode === 'chat')) {
      log.info('chat.agents_path_entered', {
        feature: 'agents',
        intent,
        mode: mode ?? 'chat',
        stream: stream === true,
      });
      const initial = initialStateFrom({
        requestId,
        clientTraceId,
        mode,
        intent,
        recentMessages: recentMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        userMessage: userMessage.content,
        uploadedText,
        intakeContext: intakeContext ?? null,
        handoffContext,
      });

      /**
       * Build the same `agentReview` payload shape that the JSON path returns,
       * so streaming clients get the same forensic detail in the `final` event
       * as non-streaming clients get in the JSON body.
       */
      const buildAgentReview = (out: Partial<LawFirmState>) => {
        const ragBlock = out.research?.ragBlock ?? '';
        return {
          intent,
          mode: (mode === 'ri_eviction' ? 'ri_eviction' : 'chat') as 'ri_eviction' | 'chat',
          usedProvider: out.usedProvider ?? null,
          degraded: out.degraded === true,
          degradation:
            out.degradation && Object.keys(out.degradation).length > 0
              ? out.degradation
              : undefined,
          facts: out.facts,
          research: out.research
            ? {
                ragMatchCount: out.research.ragMatchCount,
                degraded: out.research.degraded,
                reason: out.research.reason,
                citations: parseAgentCitations(ragBlock),
                ragBlockExcerpt: ragBlock ? ragBlock.slice(0, 600) : undefined,
              }
            : undefined,
          analysis: out.analysis,
          draft: out.draft,
          strategy: out.strategy,
          safety: out.safety,
        };
      };

      // ----- streaming branch (SSE) -----
      if (stream === true) {
        try {
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          // Disable proxy buffering (nginx in front of Vercel respects this).
          res.setHeader('X-Accel-Buffering', 'no');
          res.flushHeaders?.();

          const send = (event: StreamEvent) => {
            res.write(serializeSseEvent(event));
          };

          /**
           * Track per-agent timing. We approximate "started" as "the previous
           * agent in the canonical order finished" because LangGraph only
           * emits node-end events. For the first agent, started = stream open.
           */
          const agentStartTs = new Map<AgentName, number>();
          let lastFinishedTs = Date.now();

          /**
           * Manually accumulate state from `streamMode: 'updates'` so we can
           * build the final payload without a second graph invocation. This
           * works because no agent's update writes `undefined` for a field
           * that a previous agent set.
           */
          const accumulated: Record<string, unknown> = {
            ...(initial as Record<string, unknown>),
          };
          const seenAgents = new Set<AgentName>();

          const lawGraph = getLawFirmGraph();
          const updates = await lawGraph.stream(initial, {
            configurable: { request_id: requestId },
            streamMode: 'updates',
          });

          for await (const chunk of updates) {
            // chunk is { nodeName: partialUpdate }
            for (const [nodeName, partialUnknown] of Object.entries(
              chunk as Record<string, Record<string, unknown>>,
            )) {
              const agent = nodeNameToAgent(nodeName);
              if (!agent) continue;
              const partial = partialUnknown ?? {};
              for (const [k, v] of Object.entries(partial)) {
                if (v !== undefined) accumulated[k] = v;
              }
              const now = Date.now();
              const startedAt = agentStartTs.get(agent) ?? lastFinishedTs;
              const outcome =
                (accumulated.degraded === true && !seenAgents.has(agent)) ||
                ('degraded' in partial && partial.degraded === true)
                  ? 'degraded'
                  : 'ok';
              send({
                type: 'agent_finished',
                agent,
                outcome,
                duration_ms: Math.max(0, now - startedAt),
              });
              seenAgents.add(agent);
              lastFinishedTs = now;
            }
          }

          // If Document was skipped via the conditional edge (recommendation
          // !== 'draft'), tell the client explicitly so the stepper can mark
          // it gray instead of leaving it spinning forever.
          if (!seenAgents.has('document')) {
            send({
              type: 'agent_skipped',
              agent: 'document',
              reason: 'analysis_recommendation_not_draft',
            });
          }

          const finalState = accumulated as Partial<LawFirmState>;
          const finalMessage =
            finalState.finalMessage && finalState.finalMessage.trim().length > 0
              ? finalState.finalMessage
              : intentFallback(intent, 'llm_unavailable');
          const degradation =
            finalState.degradation && Object.keys(finalState.degradation).length > 0
              ? finalState.degradation
              : undefined;

          send({
            type: 'final',
            message: finalMessage,
            intent,
            ...(finalState.degraded === true && { degraded: true }),
            ...(degradation && { degradation }),
            agentReview: buildAgentReview(finalState),
          });
          res.end();

          flow({
            outcome: 'success',
            status_code: 200,
            user_id: userId,
            degraded_mode: finalState.degraded === true,
            chat_mode: mode,
            message_count: recentMessages.length,
            ai_provider: finalState.usedProvider ?? undefined,
          });
          return;
        } catch (graphErr) {
          log.error('chat.agents_stream_failed', {
            feature: 'agents',
            intent,
            ...serializeErrorSafe(graphErr),
          });
          // Headers may already be sent; emit a terminal SSE error event if
          // the response is still writable, otherwise fall through to the
          // legacy fallback (which can't write JSON over an SSE response).
          if (!res.writableEnded) {
            try {
              res.write(
                serializeSseEvent({
                  type: 'error',
                  reason: 'graph_failed',
                  fallbackMessage: intentFallback(intent, 'llm_unavailable'),
                }),
              );
              res.end();
              flow({
                outcome: 'success',
                status_code: 200,
                user_id: userId,
                degraded_mode: true,
                chat_mode: mode,
                message_count: recentMessages.length,
              });
              return;
            } catch {
              // headers/body already torn down; nothing more to do
              return;
            }
          }
          return;
        }
      }

      // ----- non-streaming branch (existing JSON behavior) -----
      try {
        const out = await getLawFirmGraph().invoke(initial, {
          configurable: { request_id: requestId },
        });
        const finalMessage =
          out.finalMessage && out.finalMessage.trim().length > 0
            ? out.finalMessage
            : intentFallback(intent, 'llm_unavailable');
        const degradation =
          out.degradation && Object.keys(out.degradation).length > 0
            ? out.degradation
            : undefined;
        const agentReview = buildAgentReview(out);

        flow({
          outcome: 'success',
          status_code: 200,
          user_id: userId,
          degraded_mode: out.degraded === true,
          chat_mode: mode,
          message_count: recentMessages.length,
          ai_provider: out.usedProvider ?? undefined,
        });
        return res.status(200).json({
          message: finalMessage,
          success: true,
          intent,
          ...(out.degraded === true && { degraded: true }),
          ...(degradation && { degradation }),
          agentReview,
        });
      } catch (graphErr) {
        log.error('chat.agents_path_failed', {
          feature: 'agents',
          intent,
          ...serializeErrorSafe(graphErr),
        });
        return respondWithFallback('llm_unavailable');
      }
    }

    /** Use RI eviction system prompt + materials for dedicated mode or legacy chat on substantive RI intents. */
    const useRiEvictionPrompt =
      mode === 'ri_eviction' ||
      (mode === 'chat' &&
        (intent === 'lockout' ||
          intent === 'notice_explanation' ||
          intent === 'help_desk_prep' ||
          intent === 'intake_summary'));

    let systemPrompt: string;
    let ragDegraded = false;
    let ragCircuitOpen = false;

    const useRag =
      mode !== 'extract' &&
      intent !== 'greeting' &&
      intent !== 'file_review' &&
      intent !== 'assistant_capabilities';

    let ragBlock = '';
    if (useRag) {
      const ragOutcome = await fetchRagContext(userMessage.content, requestId);
      if (ragOutcome.kind === 'found') {
        ragBlock = ragOutcome.block;
        log.info('chat.rag_context_found', {
          feature: 'chat',
          intent,
          match_count: ragOutcome.matchCount,
        });
      } else {
        ragDegraded = ragOutcome.degraded;
        ragCircuitOpen = ragOutcome.circuitOpen;
        log.info('chat.rag_context_missing', {
          feature: 'chat',
          intent,
          reason: ragOutcome.reason,
        });
      }
    }

    if (useRiEvictionPrompt) {
      const riExcerpts = getRiMaterialsExcerpts();
      const contextPayload = buildRiEvictionContextPayload(
        intakeContext ?? null,
        riExcerpts,
        intent,
      );
      systemPrompt = `${RI_EVICTION_SYSTEM_PROMPT}\n\n${contextPayload}`;
      if (ragBlock) {
        systemPrompt += `\n\n---\nRetrieved Rhode Island legal guidance (use this to ground your response):\n${ragBlock}`;
      }
    } else if (mode === 'extract' && uploadedText) {
      systemPrompt = extractionPrompt(uploadedText);
    } else {
      systemPrompt = intakePrompt(context, uploadedText);
      if (ragBlock) {
        systemPrompt += `\n\n---\nRetrieved legal guidance (use this to ground your response):\n${ragBlock}`;
      }
    }

    if (
      handoffContext &&
      typeof handoffContext === 'string' &&
      handoffContext.trim().length > 0 &&
      mode !== 'ri_eviction'
    ) {
      const capped = handoffContext.slice(0, 12000);
      systemPrompt += `\n\n---\nContext the user brought from another SmartProBono screen (they may refer to this):\n${capped}`;
    }

    const tryGroq = async (): Promise<string | null> => {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey || apiKey.trim() === '') return null;
      const gqName = CIRCUIT_NAMES.GROQ_LLM;
      const gqCfg = CIRCUIT_CONFIG[gqName];
      if (circuitIsOpen(gqName, gqCfg)) {
        log.warn('chat.llm_skipped', {
          feature: 'chat',
          intent,
          provider: 'groq',
          reason: 'circuit_open',
        });
        return null;
      }
      log.info('chat.llm_called', { feature: 'chat', provider: 'groq', attempt: 1, intent });
      try {
        const groqResponse = await fetchWithTimeout(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...recentMessages
                  .slice(0, -1)
                  .map((msg) => ({ role: msg.role, content: msg.content })),
                { role: 'user', content: userMessage.content },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          },
          30_000,
        );
        if (!groqResponse.ok) {
          if (isRetryableUpstreamStatus(groqResponse.status)) {
            circuitRecordFailure(gqName, gqCfg, requestId);
          }
          return null;
        }
        const groqData = await groqResponse.json();
        const aiResponse = groqData.choices?.[0]?.message?.content;
        if (!aiResponse || aiResponse.trim().length === 0) return null;
        circuitRecordSuccess(gqName, requestId);
        return aiResponse;
      } catch {
        circuitRecordFailure(gqName, gqCfg, requestId);
        return null;
      }
    };

    const tryHuggingFace = async (): Promise<string | null> => {
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      if (!apiKey || apiKey.trim() === '' || apiKey === 'hf_demo_token') return null;
      const hfName = CIRCUIT_NAMES.HUGGINGFACE_LLM;
      const hfCfg = CIRCUIT_CONFIG[hfName];
      if (circuitIsOpen(hfName, hfCfg)) {
        log.warn('chat.llm_skipped', {
          feature: 'chat',
          intent,
          provider: 'huggingface',
          reason: 'circuit_open',
        });
        return null;
      }
      log.info('chat.llm_called', { feature: 'chat', provider: 'huggingface', attempt: 1, intent });
      try {
        const hfResponse = await fetchWithTimeout(
          'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              inputs: `${systemPrompt}\n\nUser: ${userMessage.content}\nErmi:`,
              parameters: {
                max_new_tokens: 200,
                temperature: 0.7,
                return_full_text: false,
              },
            }),
          },
          15_000,
        );
        if (!hfResponse.ok) {
          if (isRetryableUpstreamStatus(hfResponse.status)) {
            circuitRecordFailure(hfName, hfCfg, requestId);
          }
          return null;
        }
        const hfData = await hfResponse.json();
        const text = hfData[0]?.generated_text;
        if (!text || (typeof text === 'string' && text.trim().length === 0)) return null;
        circuitRecordSuccess(hfName, requestId);
        return text;
      } catch {
        circuitRecordFailure(hfName, hfCfg, requestId);
        return null;
      }
    };

    const envProvider = (process.env.AI_PROVIDER || '').toLowerCase();
    const order: Array<'groq' | 'huggingface'> =
      envProvider === 'huggingface' ? ['huggingface', 'groq'] : ['groq', 'huggingface'];

    let responseText: string | null = null;
    let usedProvider: 'groq' | 'huggingface' | null = null;
    for (const provider of order) {
      const text = provider === 'groq' ? await tryGroq() : await tryHuggingFace();
      if (text && text.trim().length > 0) {
        responseText = text;
        usedProvider = provider;
        break;
      }
    }

    if (!responseText) {
      const hasGroq = !!process.env.GROQ_API_KEY?.trim();
      const hasHf =
        !!process.env.HUGGINGFACE_API_KEY?.trim() &&
        process.env.HUGGINGFACE_API_KEY !== 'hf_demo_token';
      const gqCfg = CIRCUIT_CONFIG[CIRCUIT_NAMES.GROQ_LLM];
      const hfCfg = CIRCUIT_CONFIG[CIRCUIT_NAMES.HUGGINGFACE_LLM];
      const bothCircuitsOpen =
        hasGroq &&
        hasHf &&
        circuitIsOpen(CIRCUIT_NAMES.GROQ_LLM, gqCfg) &&
        circuitIsOpen(CIRCUIT_NAMES.HUGGINGFACE_LLM, hfCfg);
      let reason: FallbackReason;
      if (!hasGroq && !hasHf) reason = 'no_provider';
      else if (bothCircuitsOpen) reason = 'circuit_open';
      else reason = 'llm_unavailable';
      return respondWithFallback(reason, { ragDegraded, ragCircuitOpen });
    }

    const degraded = ragDegraded;

    // Save conversation to Supabase ONLY if user is authenticated with valid token
    // Demo mode (no auth) should NEVER save to database
    if (supabaseAdmin && req.headers.authorization) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          /* demo mode */
        } else {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
          
          if (authError || !user) {
            /* demo mode */
          } else if (user) {
            // Valid authenticated user - save to their isolated chat
            const newMessages = [...recentMessages, { role: 'assistant', content: responseText }];
            
            // Check if there's an existing chat for THIS SPECIFIC USER
            const { data: existingChat } = await supabaseAdmin
              .from('chats')
              .select('id')
              .eq('user_id', user.id) // Critical: filter by user_id to ensure isolation
              .order('updated_at', { ascending: false })
              .limit(1)
              .single();

            if (existingChat) {
              // Update existing chat for THIS user only
              await supabaseAdmin
                .from('chats')
                .update({
                  messages: newMessages,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingChat.id)
                .eq('user_id', user.id); // Double-check user_id for security
            } else {
              // Create new chat for THIS user
              await supabaseAdmin.from('chats').insert({
                user_id: user.id,
                messages: newMessages,
                title: `Chat ${new Date().toLocaleDateString()}`,
              });
            }

            // If this looks like a generated document, save it too (for THIS user only)
            if (responseText.length > 200 && (responseText.includes('DRAFT') || responseText.includes('letter') || responseText.includes('motion') || responseText.includes('agreement'))) {
              await supabaseAdmin.from('documents').insert({
                user_id: user.id, // Critical: associate with specific user
                title: 'Generated Document',
                content: responseText,
                document_type: 'draft',
              });
            }
          }
        }
      } catch (dbError) {
        createLogger(requestId).warn('chat_db_save_failed', {
          feature: 'chat',
          user_id: userId,
          ...serializeErrorSafe(dbError),
        });
      }
    }

    flow({
      outcome: 'success',
      status_code: 200,
      user_id: userId,
      degraded_mode: degraded,
      chat_mode: mode,
      message_count: recentMessages.length,
      ai_provider: usedProvider ?? undefined,
    });

    const degradation = ragDegraded
      ? {
          llm: false,
          rag: true,
          ...(ragCircuitOpen && { rag_circuit_open: true }),
        }
      : undefined;

    return res.status(200).json({
      message: responseText,
      success: true,
      intent,
      ...(degraded && { degraded: true }),
      ...(degradation && { degradation }),
    });
  } catch (error: any) {
    flow({ outcome: 'server_error', status_code: 500, user_id: userId, error });

    return res.status(500).json({
      error: 'An error occurred while processing your request. Please try again.',
      success: false,
    });
  }
}
