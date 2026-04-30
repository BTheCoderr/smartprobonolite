/**
 * Case Analysis Agent.
 *
 * Applies the operator-supplied analyst contract over (intake facts +
 * structured Research findings + RAG block) and returns a typed
 * AnalysisSlice with:
 *   - legal_summary: plain-language explanation
 *   - risks, possible_violations, strengths_of_case: short bullets
 *   - open_questions: things staff should clarify
 *   - recommendation: graph routing only ('inform' | 'draft' | 'escalate')
 *
 * Parse failures default the recommendation to 'inform' so the graph still
 * advances. Never logs raw user content or LLM output — only counts.
 */

import { createLogger } from '@/lib/logger';
import { callGroq } from '@/lib/agents/groqClient';
import {
  RI_EVICTION_SYSTEM_PROMPT,
  buildRiEvictionContextPayload,
} from '@/lib/prompts/riEvictionPrompt';
import {
  ANALYSIS_AGENT_OUTPUT_INSTRUCTIONS,
  ANALYSIS_AGENT_SYSTEM_PROMPT,
} from '@/lib/agents/analysisPrompts';
import { intentFallback } from '@/lib/chat/intentFallbacks';
import type { AnalysisSlice, LawFirmState, LawFirmUpdate } from '@/lib/agents/state';

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

function asRecommendation(v: unknown): AnalysisSlice['recommendation'] {
  return v === 'draft' || v === 'escalate' ? v : 'inform';
}

function shortString(v: unknown, max = 1500): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function stringArray(v: unknown, max = 5, eachMax = 240): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .slice(0, max)
    .map((s) => s.trim().slice(0, eachMax));
}

function emptyAnalysis(legalSummary: string): AnalysisSlice {
  return {
    legalSummary,
    risks: [],
    possibleViolations: [],
    strengthsOfCase: [],
    openQuestions: ['Confirm details with staff before relying on next steps.'],
    recommendation: 'inform',
  };
}

export async function analysisAgent(state: LawFirmState): Promise<LawFirmUpdate> {
  const log = createLogger(state.requestId);
  const startedAt = Date.now();
  log.info('agent.analysis.start', {
    feature: 'agents',
    agent: 'analysis',
    intent: state.intent,
    mode: state.mode,
    has_research: !!state.research?.ragBlock,
    research_relevant_laws_count: state.research?.relevantLaws?.length ?? 0,
  });

  const facts = state.facts;
  const factSummary = facts?.summary || state.userMessage || '';
  const research = state.research;
  const ragBlock = research?.ragBlock || '';

  const contextPayload = buildRiEvictionContextPayload(
    state.intakeContext ?? null,
    /* riMaterialsExcerpts */ '',
    state.intent,
  );

  const system =
    `${RI_EVICTION_SYSTEM_PROMPT}\n\n${contextPayload}` +
    (ragBlock
      ? `\n\n---\nRetrieved Rhode Island legal guidance (use this to ground your response):\n${ragBlock}`
      : '') +
    `\n\n---\n${ANALYSIS_AGENT_SYSTEM_PROMPT}\n\n${ANALYSIS_AGENT_OUTPUT_INSTRUCTIONS}`;

  const researchSummary =
    research && research.relevantLaws.length > 0
      ? [
          `Research jurisdiction: ${research.jurisdiction ?? 'unknown'}`,
          `Relevant laws (from Research agent):`,
          ...research.relevantLaws
            .slice(0, 6)
            .map((l, i) => `${i + 1}. ${l.title} — ${l.summary}`),
          research.citations.length > 0
            ? `Citations: ${research.citations
                .slice(0, 8)
                .map((c) => (c.locator ? `${c.source} (${c.locator})` : c.source))
                .join('; ')}`
            : '',
          research.shortExplanations.length > 0
            ? `Research short explanations:\n- ${research.shortExplanations.join('\n- ')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : '';

  const user = [
    `Intake summary (already redacted): ${factSummary || '(none)'}`,
    facts?.legal_issue ? `Legal issue: ${facts.legal_issue}` : '',
    facts?.urgency_level ? `Urgency: ${facts.urgency_level}` : '',
    facts?.timeline ? `Timeline: ${facts.timeline}` : '',
    facts?.state ? `User-stated state: ${facts.state}` : '',
    researchSummary,
    `User message: ${state.userMessage}`,
  ]
    .filter(Boolean)
    .join('\n');

  const groq = await callGroq({
    agent: 'analysis',
    requestId: state.requestId,
    intent: state.intent,
    system,
    user,
    temperature: 0.4,
    maxTokens: 1100,
  });

  if (!groq.ok) {
    const fallback = intentFallback(state.intent, 'llm_unavailable');
    const analysis = emptyAnalysis(fallback);
    log.info('agent.analysis.end', {
      feature: 'agents',
      agent: 'analysis',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      recommendation: analysis.recommendation,
      llm_outcome: groq.reason,
      risks_count: 0,
      violations_count: 0,
      strengths_count: 0,
      open_questions_count: analysis.openQuestions.length,
    });
    return {
      analysis,
      degraded: true,
      degradation: { llm: true },
    };
  }

  const parsed = parseJson(groq.text);
  if (!parsed) {
    log.warn('agent.analysis.parse_failed', {
      feature: 'agents',
      agent: 'analysis',
      intent: state.intent,
    });
    const analysis = emptyAnalysis(shortString(groq.text, 1500));
    log.info('agent.analysis.end', {
      feature: 'agents',
      agent: 'analysis',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      recommendation: analysis.recommendation,
      risks_count: 0,
      violations_count: 0,
      strengths_count: 0,
      open_questions_count: analysis.openQuestions.length,
    });
    return { analysis };
  }

  const analysis: AnalysisSlice = {
    legalSummary: shortString(parsed.legal_summary, 1800),
    risks: stringArray(parsed.risks),
    possibleViolations: stringArray(parsed.possible_violations),
    strengthsOfCase: stringArray(parsed.strengths_of_case),
    openQuestions: stringArray(parsed.open_questions),
    recommendation: asRecommendation(parsed.recommendation),
  };

  if (!analysis.legalSummary) {
    analysis.legalSummary = intentFallback(state.intent, 'llm_unavailable');
  }

  log.info('agent.analysis.end', {
    feature: 'agents',
    agent: 'analysis',
    intent: state.intent,
    mode: state.mode,
    duration_ms: Date.now() - startedAt,
    outcome: 'ok',
    recommendation: analysis.recommendation,
    risks_count: analysis.risks.length,
    violations_count: analysis.possibleViolations.length,
    strengths_count: analysis.strengthsOfCase.length,
    open_questions_count: analysis.openQuestions.length,
  });
  return { analysis, usedProvider: 'groq' };
}
