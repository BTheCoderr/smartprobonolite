/**
 * Strategy Agent.
 *
 * Produces the workflow strategist's Step / Why / When trios + a
 * staff-mediated "what to file next" sentence + items to bring to staff
 * review. Always sets `staffReviewRequired: true`.
 *
 * LLM-unavailable path returns a deterministic, RI-safe set of trios derived
 * from the intent's existing fallback copy so the user still sees a useful
 * structured answer.
 */

import { createLogger } from '@/lib/logger';
import { callGroq } from '@/lib/agents/groqClient';
import {
  STRATEGY_AGENT_OUTPUT_INSTRUCTIONS,
  STRATEGY_AGENT_SCOPE_OVERRIDE,
  STRATEGY_AGENT_SYSTEM_PROMPT,
} from '@/lib/agents/strategyPrompts';
import { RI_EVICTION_SYSTEM_PROMPT } from '@/lib/prompts/riEvictionPrompt';
import { intentFallback } from '@/lib/chat/intentFallbacks';
import type {
  LawFirmState,
  LawFirmUpdate,
  StrategySlice,
  StrategyStep,
} from '@/lib/agents/state';

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

function shortString(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function nullableShortString(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, max) : null;
}

function stringArray(v: unknown, max: number, eachMax = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .slice(0, max)
    .map((s) => s.trim().slice(0, eachMax));
}

function parseSteps(v: unknown): StrategyStep[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const e = entry as Record<string, unknown>;
      const step = shortString(e.step, 240);
      const why = shortString(e.why, 240);
      const when = shortString(e.when, 160);
      if (!step) return null;
      return {
        step,
        why: why || 'Helps staff or attorney review your situation.',
        when: when || 'as soon as possible',
      } satisfies StrategyStep;
    })
    .filter((x): x is StrategyStep => x !== null)
    .slice(0, 6);
}

/**
 * Heuristic split of the intent's deterministic fallback copy into
 * Step / Why / When trios so even an LLM-down user gets the new format.
 */
function fallbackStrategyFromIntent(
  intent: LawFirmState['intent'],
): StrategySlice {
  const fallback = intentFallback(intent, 'llm_unavailable');
  const nextStepsBlock = fallback.split(/Next steps:\s*\n?/i)[1] ?? '';
  const bullets = nextStepsBlock
    .split('\n')
    .map((l) => l.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);

  const steps: StrategyStep[] =
    bullets.length > 0
      ? bullets.map((b) => ({
          step: b.slice(0, 240),
          why: 'From the deterministic Rhode Island fallback for this intent.',
          when: 'as soon as possible',
        }))
      : [
          {
            step: 'Save copies of any notices or letters from your landlord.',
            why: 'Staff and attorneys need the exact paperwork to advise you.',
            when: 'today',
          },
          {
            step: 'Contact the Eviction Help Desk or RI Legal Services.',
            why: 'They can review your situation and tell you the next safe move.',
            when: 'as soon as possible',
          },
        ];

  return {
    steps,
    whatToFileNext: null,
    whatToBring: [
      'Any notice or letter from your landlord (and the envelope, if you have it).',
      'Your lease or rental agreement, if you have one in writing.',
      'Records of rent payments — receipts, bank statements, money order stubs.',
      'A photo ID for yourself.',
    ],
    staffReviewRequired: true,
  };
}

export async function strategyAgent(state: LawFirmState): Promise<LawFirmUpdate> {
  const log = createLogger(state.requestId);
  const startedAt = Date.now();
  log.info('agent.strategy.start', {
    feature: 'agents',
    agent: 'strategy',
    intent: state.intent,
    mode: state.mode,
    has_draft: !!state.draft,
    has_analysis: !!state.analysis,
  });

  const facts = state.facts;
  const analysis = state.analysis;
  const draftSummary = state.draft ? `Draft type prepared by Document agent: ${state.draft.type}` : '';

  const system = `${RI_EVICTION_SYSTEM_PROMPT}\n\n---\n${STRATEGY_AGENT_SYSTEM_PROMPT}\n\n${STRATEGY_AGENT_SCOPE_OVERRIDE}\n\n${STRATEGY_AGENT_OUTPUT_INSTRUCTIONS}`;

  const analysisBlock = analysis
    ? [
        `Legal summary:\n${analysis.legalSummary}`,
        analysis.risks.length > 0
          ? `Risks for the user:\n- ${analysis.risks.join('\n- ')}`
          : '',
        analysis.openQuestions.length > 0
          ? `Open questions for staff:\n- ${analysis.openQuestions.join('\n- ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    : '';

  const user = [
    `Intake summary (already redacted): ${facts?.summary ?? '(none)'}`,
    facts?.legal_issue ? `Legal issue: ${facts.legal_issue}` : '',
    facts?.urgency_level ? `Urgency: ${facts.urgency_level}` : '',
    facts?.timeline ? `Timeline: ${facts.timeline}` : '',
    facts?.state ? `User-stated state: ${facts.state}` : '',
    analysisBlock,
    draftSummary,
    `User original message:\n${state.userMessage}`,
  ]
    .filter(Boolean)
    .join('\n');

  const groq = await callGroq({
    agent: 'strategy',
    requestId: state.requestId,
    intent: state.intent,
    system,
    user,
    temperature: 0.3,
    maxTokens: 800,
  });

  if (!groq.ok) {
    const strategy = fallbackStrategyFromIntent(state.intent);
    log.info('agent.strategy.end', {
      feature: 'agents',
      agent: 'strategy',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      llm_outcome: groq.reason,
      steps_count: strategy.steps.length,
      what_to_bring_count: strategy.whatToBring.length,
      has_what_to_file_next: strategy.whatToFileNext !== null,
    });
    return { strategy, degraded: true, degradation: { llm: true } };
  }

  const parsed = parseJson(groq.text);
  if (!parsed) {
    const strategy = fallbackStrategyFromIntent(state.intent);
    log.warn('agent.strategy.parse_failed', {
      feature: 'agents',
      agent: 'strategy',
      intent: state.intent,
    });
    log.info('agent.strategy.end', {
      feature: 'agents',
      agent: 'strategy',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      steps_count: strategy.steps.length,
    });
    return { strategy };
  }

  const steps = parseSteps(parsed.steps);
  const whatToBring = stringArray(parsed.what_to_bring, 6);
  const whatToFileNext = nullableShortString(parsed.what_to_file_next, 280);

  const fallback = fallbackStrategyFromIntent(state.intent);
  const strategy: StrategySlice = {
    steps: steps.length > 0 ? steps : fallback.steps,
    whatToFileNext,
    whatToBring: whatToBring.length > 0 ? whatToBring : fallback.whatToBring,
    staffReviewRequired: true,
  };

  log.info('agent.strategy.end', {
    feature: 'agents',
    agent: 'strategy',
    intent: state.intent,
    mode: state.mode,
    duration_ms: Date.now() - startedAt,
    outcome: 'ok',
    steps_count: strategy.steps.length,
    what_to_bring_count: strategy.whatToBring.length,
    has_what_to_file_next: strategy.whatToFileNext !== null,
  });
  return { strategy, usedProvider: 'groq' };
}
