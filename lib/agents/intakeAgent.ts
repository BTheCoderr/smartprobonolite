/**
 * Intake Agent.
 *
 * Extracts structured legal facts (state, legal_issue, timeline, key_facts,
 * urgency_level, missing_info) from the user's most recent message and any
 * pre-existing intake context. Calls Groq for extraction; falls back to a
 * deterministic pass over `intakeContext` when the LLM is unavailable.
 *
 * Never logs raw user content or facts — only counts and outcome.
 */

import { createLogger } from '@/lib/logger';
import { callGroq } from '@/lib/agents/groqClient';
import {
  INTAKE_AGENT_OUTPUT_INSTRUCTIONS,
  INTAKE_AGENT_SYSTEM_PROMPT,
} from '@/lib/agents/intakePrompts';
import type { IntakeFacts, LawFirmState, LawFirmUpdate } from '@/lib/agents/state';

const URGENCY_VALUES = ['low', 'medium', 'high'] as const;
type Urgency = (typeof URGENCY_VALUES)[number];

const PII_EMAIL = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const PII_PHONE = /\+?\d[\d\s().-]{8,}\d/g;
/** Account-number-shaped: 9+ digit run that isn't already redacted. */
const PII_ACCOUNT = /\b\d{9,}\b/g;

function scrubPii(value: string): string {
  return value
    .replace(PII_EMAIL, '[redacted-email]')
    .replace(PII_PHONE, '[redacted-phone]')
    .replace(PII_ACCOUNT, '[redacted-number]');
}

function nullableString(v: unknown, max = 200): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return scrubPii(t).slice(0, max);
}

function urgencyOrNull(v: unknown): Urgency | null {
  if (typeof v !== 'string') return null;
  const lower = v.trim().toLowerCase();
  return (URGENCY_VALUES as readonly string[]).includes(lower) ? (lower as Urgency) : null;
}

function stringArray(v: unknown, max = 12, eachMax = 240): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .slice(0, max)
    .map((s) => scrubPii(s.trim()).slice(0, eachMax));
}

/** Pulls the first JSON object out of a Groq response (handles fenced output). */
function tryParseJson(raw: string): Record<string, unknown> | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced?.trim() ?? raw.trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function summarize(facts: IntakeFacts, fallbackUtterance: string): string {
  const bits: string[] = [];
  if (facts.legal_issue) bits.push(`Issue: ${facts.legal_issue}`);
  if (facts.state) bits.push(`State: ${facts.state}`);
  if (facts.timeline) bits.push(`Timeline: ${facts.timeline}`);
  if (facts.urgency_level) bits.push(`Urgency: ${facts.urgency_level}`);
  if (facts.key_facts.length > 0) {
    bits.push(`Key facts: ${facts.key_facts.slice(0, 3).join('; ')}`);
  }
  if (bits.length === 0 && fallbackUtterance) {
    return scrubPii(fallbackUtterance).slice(0, 240);
  }
  return bits.join('. ');
}

function flagsFor(facts: IntakeFacts, intent: LawFirmState['intent']): string[] {
  const flags = new Set<string>();
  if (intent && intent !== 'unknown') flags.add(`intent:${intent}`);
  if (facts.urgency_level === 'high') flags.add('urgency:high');
  if (facts.state) flags.add(`state:${facts.state.toLowerCase()}`);
  if (facts.missing_info.length > 0) flags.add('intake:incomplete');
  return Array.from(flags);
}

function emptyFacts(missing: string[] = []): IntakeFacts {
  return {
    state: null,
    legal_issue: null,
    timeline: null,
    key_facts: [],
    urgency_level: null,
    missing_info: missing,
    summary: '',
    flags: [],
  };
}

function factsFromIntakeContext(state: LawFirmState): IntakeFacts | null {
  const ctx = state.intakeContext;
  if (!ctx) return null;
  const summary = (ctx as { summary?: string }).summary;
  const category = (ctx as { categoryLabel?: string; category?: string });
  if (!summary && !category.categoryLabel && !category.category) return null;
  const facts = emptyFacts(['state', 'timeline', 'urgency_level']);
  facts.legal_issue = nullableString(category.categoryLabel || category.category) ?? null;
  if (summary) facts.key_facts = stringArray([summary]);
  return facts;
}

export async function intakeAgent(state: LawFirmState): Promise<LawFirmUpdate> {
  const log = createLogger(state.requestId);
  const startedAt = Date.now();
  log.info('agent.intake.start', {
    feature: 'agents',
    agent: 'intake',
    intent: state.intent,
    mode: state.mode,
    has_intake_context: !!state.intakeContext,
    has_uploaded_text: !!state.uploadedText,
  });

  const userText = (state.userMessage ?? '').slice(0, 4000);

  const groq = await callGroq({
    agent: 'intake',
    requestId: state.requestId,
    intent: state.intent,
    system: `${INTAKE_AGENT_SYSTEM_PROMPT}\n\n${INTAKE_AGENT_OUTPUT_INSTRUCTIONS}`,
    user: userText,
    temperature: 0.1,
    maxTokens: 600,
  });

  let facts: IntakeFacts;
  let outcome: 'ok' | 'degraded' | 'skipped';
  let degraded = false;

  if (groq.ok) {
    const parsed = tryParseJson(groq.text);
    if (parsed) {
      facts = {
        state: nullableString(parsed.state, 80),
        legal_issue: nullableString(parsed.legal_issue, 160),
        timeline: nullableString(parsed.timeline, 240),
        key_facts: stringArray(parsed.key_facts),
        urgency_level: urgencyOrNull(parsed.urgency_level),
        missing_info: stringArray(parsed.missing_info, 8, 60),
        summary: '',
        flags: [],
      };
      outcome = 'ok';
    } else {
      log.warn('agent.intake.parse_failed', {
        feature: 'agents',
        agent: 'intake',
        intent: state.intent,
      });
      facts = factsFromIntakeContext(state) ?? emptyFacts(['parse_failed']);
      outcome = 'degraded';
      degraded = true;
    }
  } else {
    facts = factsFromIntakeContext(state) ?? emptyFacts(['llm_unavailable']);
    outcome = groq.reason === 'no_key' || groq.reason === 'circuit_open' ? 'degraded' : 'degraded';
    degraded = true;
  }

  facts.summary = summarize(facts, userText);
  facts.flags = flagsFor(facts, state.intent);

  log.info('agent.intake.end', {
    feature: 'agents',
    agent: 'intake',
    intent: state.intent,
    mode: state.mode,
    duration_ms: Date.now() - startedAt,
    outcome,
    has_state: !!facts.state,
    has_issue: !!facts.legal_issue,
    has_timeline: !!facts.timeline,
    key_facts_count: facts.key_facts.length,
    urgency: facts.urgency_level ?? 'unknown',
    missing_info_count: facts.missing_info.length,
    llm_outcome: groq.ok ? 'ok' : groq.reason,
  });

  return degraded
    ? { facts, degraded: true, degradation: { llm: true } }
    : { facts };
}
