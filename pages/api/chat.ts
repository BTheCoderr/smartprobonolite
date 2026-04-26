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
import { embedText } from '@/lib/embeddings/openai';
import { buildRetrievalContextBlock } from '@/lib/rag/buildRetrievalContext';
import { createClient } from '@supabase/supabase-js';
import { fetchWithTimeout, withRetry } from '@/lib/resilience';
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

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function getRiMaterialsExcerpts(): string {
  return EMBEDDED_MATERIALS.filter((m) => m.extractedText && m.extractedText.length > 0)
    .map((m) => `[${m.title}]\n${m.extractedText}`)
    .join('\n\n---\n\n');
}

async function fetchRagContext(
  query: string,
  requestId: string,
): Promise<{ block: string; ragDegraded: boolean; ragCircuitOpen: boolean }> {
  const name = CIRCUIT_NAMES.RAG_PIPELINE;
  const cfg = CIRCUIT_CONFIG[name];

  if (circuitIsOpen(name, cfg)) {
    createLogger(requestId).warn('rag_skipped_circuit_open', { feature: 'chat' });
    return { block: '', ragDegraded: true, ragCircuitOpen: true };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.OPENAI_API_KEY) {
    return { block: '', ragDegraded: false, ragCircuitOpen: false };
  }

  try {
    const block = await withRetry(
      async () => {
        const embedding = await embedText(query, { requestId });
        const sb = createClient(url, key);
        const { data, error } = await sb.rpc('match_legal_chunks', {
          query_embedding: embedding,
          match_count: 5,
          filter_jurisdiction: 'RI',
        });
        if (error) throw new Error(error.message || 'match_legal_chunks');
        if (!data?.length) return '';
        return buildRetrievalContextBlock(data);
      },
      { maxAttempts: 2 },
    );
    circuitRecordSuccess(name, requestId);
    return { block: block || '', ragDegraded: false, ragCircuitOpen: false };
  } catch {
    circuitRecordFailure(name, cfg, requestId);
    return { block: '', ragDegraded: true, ragCircuitOpen: false };
  }
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
    const { messages, uploadedText, mode, intakeContext, handoffContext } = req.body as {
      messages: Message[];
      uploadedText?: string;
      mode?: 'chat' | 'extract' | 'ri_eviction';
      intakeContext?: RiIntakeContext | null;
      /** Optional context from another tool (document prep, expungement summary, etc.). */
      handoffContext?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      flow({ outcome: 'client_error', status_code: 400, user_id: userId });
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Build context from last 5 messages (or 6 for ri_eviction to keep more context)
    const recentMessages = messages.slice(-(mode === 'ri_eviction' ? 6 : 5));
    const context = recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // Determine system prompt based on mode
    let systemPrompt: string;
    let ragDegraded = false;
    let ragCircuitOpen = false;
    if (mode === 'ri_eviction') {
      const riExcerpts = getRiMaterialsExcerpts();
      const contextPayload = buildRiEvictionContextPayload(intakeContext ?? null, riExcerpts);
      systemPrompt = `${RI_EVICTION_SYSTEM_PROMPT}\n\n${contextPayload}`;
    } else if (mode === 'extract' && uploadedText) {
      systemPrompt = extractionPrompt(uploadedText);
    } else {
      systemPrompt = intakePrompt(context, uploadedText);

      const lastUserContent = messages[messages.length - 1]?.content ?? '';
      const rag = await fetchRagContext(lastUserContent, requestId);
      ragDegraded = rag.ragDegraded;
      ragCircuitOpen = rag.ragCircuitOpen;
      if (rag.block) {
        systemPrompt += `\n\n---\nRetrieved legal guidance (use this to ground your response):\n${rag.block}`;
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

    // Get the latest user message
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

    const aiProvider = process.env.AI_PROVIDER || 'huggingface';

    let responseText: string;
    let llmDegraded = false;

    if (aiProvider === 'huggingface') {
      const hfName = CIRCUIT_NAMES.HUGGINGFACE_LLM;
      const hfCfg = CIRCUIT_CONFIG[hfName];
      try {
        if (circuitIsOpen(hfName, hfCfg)) {
          responseText = generateFallbackResponse(userMessage.content, mode);
          llmDegraded = true;
        } else {
          const hfResponse = await fetchWithTimeout(
            'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            {
              headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo_token'}`,
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
            responseText = generateFallbackResponse(userMessage.content, mode);
            llmDegraded = true;
          } else {
            const hfData = await hfResponse.json();
            responseText =
              hfData[0]?.generated_text ||
              'I apologize, but I need a moment to process that. Could you try rephrasing your question?';
            if (!hfData[0]?.generated_text) llmDegraded = true;
            else circuitRecordSuccess(hfName, requestId);
          }
        }
      } catch {
        circuitRecordFailure(hfName, hfCfg, requestId);
        responseText = generateFallbackResponse(userMessage.content, mode);
        llmDegraded = true;
      }
    } else if (aiProvider === 'groq') {
      const gqName = CIRCUIT_NAMES.GROQ_LLM;
      const gqCfg = CIRCUIT_CONFIG[gqName];
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.trim() === '') {
        responseText = generateFallbackResponse(userMessage.content, mode);
        llmDegraded = true;
      } else {
        try {
          if (circuitIsOpen(gqName, gqCfg)) {
            responseText = generateFallbackResponse(userMessage.content, mode);
            llmDegraded = true;
          } else {
            const groqResponse = await fetchWithTimeout(
              'https://api.groq.com/openai/v1/chat/completions',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    { role: 'system', content: systemPrompt },
                    ...recentMessages.slice(0, -1).map((msg) => ({ role: msg.role, content: msg.content })),
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
              responseText = generateFallbackResponse(userMessage.content, mode);
              llmDegraded = true;
            } else {
              const groqData = await groqResponse.json();
              const aiResponse = groqData.choices?.[0]?.message?.content;

              if (!aiResponse || aiResponse.trim().length === 0) {
                responseText = generateFallbackResponse(userMessage.content, mode);
                llmDegraded = true;
              } else {
                responseText = aiResponse;
                circuitRecordSuccess(gqName, requestId);
              }
            }
          }
        } catch {
          circuitRecordFailure(gqName, gqCfg, requestId);
          responseText = generateFallbackResponse(userMessage.content, mode);
          llmDegraded = true;
        }
      }
    } else {
      responseText = generateFallbackResponse(userMessage.content, mode);
      llmDegraded = true;
    }

    const degraded = llmDegraded || ragDegraded;

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
      ai_provider: aiProvider,
    });

    const degradation =
      llmDegraded || ragDegraded
        ? {
            llm: llmDegraded,
            rag: ragDegraded,
            ...(ragCircuitOpen && { rag_circuit_open: true }),
          }
        : undefined;

    return res.status(200).json({
      message: responseText,
      success: true,
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

// Simple fallback responses when AI isn't available
function generateFallbackResponse(userMessage: string, mode?: string): string {

  if (mode === 'ri_eviction') {
    return `Explanation:
Based on Rhode Island landlord-tenant law, eviction-related questions depend on your specific situation. The Rhode Island Landlord-Tenant Handbook and Eviction Help Desk materials provide guidance on notices, court process, and tenant rights.

Next steps:
- Bring any eviction notice, payment records, and communication with your landlord to the Eviction Help Desk
- Do not ignore court papers; plan to attend any scheduled hearing
- If you have a housing subsidy, bring subsidy paperwork and contact info

Source basis:
- Rhode Island Landlord-Tenant Handbook 2024
- Eviction Help Desk Intake Form

Staff review note:
This is informational guidance only. Eviction Help Desk staff or an attorney should review your situation before you rely on next steps.`;
  }
  
  if (mode === 'extract') {
    return "I've reviewed your document. Here are the key details I've identified:\n\n• Client information\n• Case type\n• Important dates\n\nWould you like me to generate a draft document based on this information?";
  }
  
  if (userMessage.toLowerCase().includes('letter') || userMessage.toLowerCase().includes('draft')) {
    return "I'd be happy to help draft a letter! Please provide the key details like client name, case type, and any specific instructions you have.";
  }
  
  if (userMessage.toLowerCase().includes('intake') || userMessage.toLowerCase().includes('form')) {
    return "I can help process intake forms. Please share the information, and I'll extract the key facts and organize them for you.";
  }
  
  if (userMessage.toLowerCase().includes('nda') || userMessage.toLowerCase().includes('agreement')) {
    return "I can help draft an NDA or agreement. Please provide the key details like parties involved, confidential information scope, and duration.";
  }
  
  if (userMessage.toLowerCase().includes('review') || userMessage.toLowerCase().includes('look')) {
    return "I'd be happy to review your document. Please share the content or upload the file, and I'll extract the key legal facts and organize them for you.";
  }
  
  // Default responses
  const responses = [
    "I'm here to help with your legal document needs! What specific type of document are you working on?",
    "I can help with intake forms, letters, agreements, and other legal documents. What would you like me to assist with?",
    "Let me know what you're working on - whether it's reviewing an intake, drafting a letter, or organizing case information.",
    "I'm ready to help! Tell me about your case or document needs, and I'll provide specific assistance.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

