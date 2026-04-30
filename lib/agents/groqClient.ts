/**
 * Shared Groq client used by every agent in `lib/agents/*`.
 *
 * Wraps the existing `lib/circuitBreaker` + `lib/resilience` primitives so each
 * agent gets the same retry/circuit semantics that `pages/api/chat.ts`'s
 * legacy `tryGroq` provided. Logs use the `agent.*` event family so they sort
 * separately from legacy `chat.llm_called` events.
 *
 * Never logs prompts or responses — only metadata.
 */

import { fetchWithTimeout } from '@/lib/resilience';
import {
  CIRCUIT_CONFIG,
  CIRCUIT_NAMES,
  circuitIsOpen,
  circuitRecordFailure,
  circuitRecordSuccess,
  isRetryableUpstreamStatus,
} from '@/lib/circuitBreaker';
import { createLogger } from '@/lib/logger';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_TIMEOUT_MS = 30_000;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export type GroqMessage = { role: 'user' | 'assistant'; content: string };

export type CallGroqArgs = {
  agent: string;
  system: string;
  user: string;
  recentMessages?: GroqMessage[];
  requestId: string;
  intent?: string;
  temperature?: number;
  maxTokens?: number;
};

export type CallGroqResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'no_key' | 'circuit_open' | 'http_error' | 'empty' | 'exception' };

export function isGroqAvailable(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export async function callGroq(args: CallGroqArgs): Promise<CallGroqResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'no_key' };

  const name = CIRCUIT_NAMES.GROQ_LLM;
  const cfg = CIRCUIT_CONFIG[name];
  const log = createLogger(args.requestId);

  if (circuitIsOpen(name, cfg)) {
    log.warn('agent.llm_skipped', {
      feature: 'agents',
      agent: args.agent,
      intent: args.intent,
      provider: 'groq',
      reason: 'circuit_open',
    });
    return { ok: false, reason: 'circuit_open' };
  }

  log.info('agent.llm_called', {
    feature: 'agents',
    agent: args.agent,
    intent: args.intent,
    provider: 'groq',
  });

  try {
    const res = await fetchWithTimeout(
      GROQ_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: args.system },
            ...(args.recentMessages ?? []).map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: args.user },
          ],
          temperature: args.temperature ?? 0.7,
          max_tokens: args.maxTokens ?? 2000,
        }),
      },
      GROQ_TIMEOUT_MS,
    );
    if (!res.ok) {
      if (isRetryableUpstreamStatus(res.status)) {
        circuitRecordFailure(name, cfg, args.requestId);
      }
      return { ok: false, reason: 'http_error' };
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;
    if (!text || text.trim().length === 0) {
      return { ok: false, reason: 'empty' };
    }
    circuitRecordSuccess(name, args.requestId);
    return { ok: true, text };
  } catch {
    circuitRecordFailure(name, cfg, args.requestId);
    return { ok: false, reason: 'exception' };
  }
}
