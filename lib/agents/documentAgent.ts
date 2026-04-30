/**
 * Document Agent.
 *
 * Drafts a plain-language artifact (letter / summary / checklist) using the
 * operator-supplied document-generator persona, narrowed by an explicit scope
 * override. NEVER drafts a court filing — the Safety agent also enforces this
 * with a regex pack.
 *
 * Skipped by the graph unless `analysis.recommendation === 'draft'`.
 */

import { createLogger } from '@/lib/logger';
import { callGroq } from '@/lib/agents/groqClient';
import { RI_EVICTION_SYSTEM_PROMPT } from '@/lib/prompts/riEvictionPrompt';
import {
  DOCUMENT_AGENT_OUTPUT_INSTRUCTIONS,
  DOCUMENT_AGENT_SCOPE_OVERRIDE,
  DOCUMENT_AGENT_SYSTEM_PROMPT,
} from '@/lib/agents/documentPrompts';
import { intentFallback } from '@/lib/chat/intentFallbacks';
import type { DraftSlice, LawFirmState, LawFirmUpdate } from '@/lib/agents/state';

function parseJson(raw: string): Record<string, unknown> | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced ?? raw).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asDraftType(v: unknown): DraftSlice['type'] {
  return v === 'letter' || v === 'summary' || v === 'checklist' ? v : 'letter';
}

function shortString(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

export async function documentAgent(state: LawFirmState): Promise<LawFirmUpdate> {
  const log = createLogger(state.requestId);
  const startedAt = Date.now();
  log.info('agent.document.start', {
    feature: 'agents',
    agent: 'document',
    intent: state.intent,
    mode: state.mode,
    recommendation: state.analysis?.recommendation ?? 'unknown',
  });

  const facts = state.facts;
  const analysis = state.analysis;
  const ragBlock = state.research?.ragBlock || '';

  const system =
    `${RI_EVICTION_SYSTEM_PROMPT}\n\n` +
    (ragBlock
      ? `Retrieved Rhode Island legal guidance (do not deviate):\n${ragBlock}\n\n---\n`
      : '') +
    `${DOCUMENT_AGENT_SYSTEM_PROMPT}\n\n${DOCUMENT_AGENT_SCOPE_OVERRIDE}\n\n${DOCUMENT_AGENT_OUTPUT_INSTRUCTIONS}`;

  const analysisBlock = analysis
    ? [
        `Legal summary:\n${analysis.legalSummary}`,
        analysis.strengthsOfCase.length > 0
          ? `Strengths of case:\n- ${analysis.strengthsOfCase.join('\n- ')}`
          : '',
        analysis.possibleViolations.length > 0
          ? `Possible violations (treat as POSSIBILITIES, not findings):\n- ${analysis.possibleViolations.join('\n- ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    : '';

  const user = [
    `Intake summary (already redacted): ${facts?.summary ?? '(none)'}`,
    facts?.legal_issue ? `Legal issue: ${facts.legal_issue}` : '',
    facts?.timeline ? `Timeline: ${facts.timeline}` : '',
    facts?.state ? `State: ${facts.state}` : '',
    analysisBlock,
    `User original message:\n${state.userMessage}`,
  ]
    .filter(Boolean)
    .join('\n');

  const groq = await callGroq({
    agent: 'document',
    requestId: state.requestId,
    intent: state.intent,
    system,
    user,
    temperature: 0.4,
    maxTokens: 1200,
  });

  if (!groq.ok) {
    const draft: DraftSlice = {
      title: 'Draft unavailable',
      body: intentFallback(state.intent, 'llm_unavailable'),
      type: 'summary',
    };
    log.info('agent.document.end', {
      feature: 'agents',
      agent: 'document',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      llm_outcome: groq.reason,
      type: draft.type,
    });
    return { draft, degraded: true, degradation: { llm: true } };
  }

  const parsed = parseJson(groq.text);
  if (!parsed || typeof parsed.body !== 'string' || parsed.body.trim().length === 0) {
    const draft: DraftSlice = {
      title: 'Draft (unstructured)',
      body: shortString(groq.text, 6000),
      type: 'letter',
    };
    log.warn('agent.document.parse_failed', {
      feature: 'agents',
      agent: 'document',
      intent: state.intent,
    });
    log.info('agent.document.end', {
      feature: 'agents',
      agent: 'document',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      type: draft.type,
    });
    return { draft };
  }

  const draft: DraftSlice = {
    title: shortString(parsed.title, 200) || 'Draft',
    body: shortString(parsed.body, 6000),
    type: asDraftType(parsed.type),
  };
  log.info('agent.document.end', {
    feature: 'agents',
    agent: 'document',
    intent: state.intent,
    mode: state.mode,
    duration_ms: Date.now() - startedAt,
    outcome: 'ok',
    type: draft.type,
    body_chars: draft.body.length,
  });
  return { draft, usedProvider: 'groq' };
}
