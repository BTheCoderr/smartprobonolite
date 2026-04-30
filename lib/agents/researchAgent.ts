/**
 * Research Agent.
 *
 * Two-source retrieval:
 *   1. PRIMARY  → Supabase pgvector via `fetchRagContext`. Curated Rhode
 *                 Island handbook / workflow chunks. Always attempted.
 *   2. SECONDARY → CourtListener (Free Law Project) case-law search via
 *                 `searchCourtListenerCases`. Off by default, opt-in via
 *                 `COURTLISTENER_ENABLED=true`. If it fails or returns empty
 *                 the agent degrades gracefully and proceeds with PRIMARY only.
 *
 * Both sources are merged into a single grounding block by
 * `mergeResearchSources` BEFORE the structured Groq pass. The Groq prompt
 * (see `researchPrompts.ts`) tells the model to treat PRIMARY as the only
 * acceptable foundation for user-facing recommendations and SECONDARY as
 * supporting case-law context only.
 *
 * The merged block is also stored on `research.ragBlock` so the Safety
 * agent's invented-citation haystack naturally covers both sources. We
 * additionally surface raw CourtListener rows on `research.caseLaw` so
 * Safety can match titles/citations/URLs explicitly.
 *
 * Never logs the query, retrieved text, snippets, or LLM output — only
 * counts and outcome metadata.
 */

import { createLogger } from '@/lib/logger';
import { callGroq } from '@/lib/agents/groqClient';
import { fetchRagContext } from '@/lib/agents/researchRag';
import {
  isCourtListenerEnabled,
  searchCourtListenerCases,
  type CourtListenerResult,
} from '@/lib/agents/courtListener';
import { mergeResearchSources } from '@/lib/agents/mergeResearchSources';
import {
  RESEARCH_AGENT_OUTPUT_INSTRUCTIONS,
  RESEARCH_AGENT_SYSTEM_PROMPT,
} from '@/lib/agents/researchPrompts';
import type {
  CaseLawEntry,
  Citation,
  CourtListenerStatus,
  LawFirmState,
  LawFirmUpdate,
  RelevantLaw,
  ResearchSlice,
} from '@/lib/agents/state';

/** Materials currently shipped/embedded in PRIMARY. Used for jurisdiction-mismatch logging. */
const RAG_JURISDICTION = 'Rhode Island';

function buildQuery(state: LawFirmState): string {
  const parts: string[] = [];
  if (state.facts?.legal_issue) parts.push(state.facts.legal_issue);
  if (state.facts?.summary) parts.push(state.facts.summary);
  if (parts.length === 0) parts.push(state.userMessage ?? '');
  return parts.join(' — ').slice(0, 1500);
}

/**
 * Build a focused CourtListener query. We deliberately bias toward
 * landlord-tenant / housing terminology so the case-law results stay close
 * to the curated RAG materials. The user's intake `legal_issue` is preferred
 * over their raw message; jurisdiction defaults to Rhode Island when unknown.
 */
function buildCourtListenerQuery(state: LawFirmState): string {
  const issue = state.facts?.legal_issue ?? state.userMessage ?? '';
  const jurisdiction = state.facts?.state ?? 'Rhode Island';
  const trimmedIssue = issue.trim().slice(0, 240);
  const parts = [jurisdiction, trimmedIssue, 'landlord tenant eviction housing']
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.join(' ').slice(0, 500);
}

function tryParseJson(raw: string): Record<string, unknown> | null {
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

function trimString(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function nullableString(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, max) : null;
}

function parseRelevantLaws(v: unknown): RelevantLaw[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const e = entry as Record<string, unknown>;
      const title = trimString(e.title, 200);
      const summary = trimString(e.summary, 600);
      if (!title || !summary) return null;
      return { title, summary } as RelevantLaw;
    })
    .filter((x): x is RelevantLaw => x !== null)
    .slice(0, 6);
}

function parseCitations(v: unknown): Citation[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const e = entry as Record<string, unknown>;
      const source = trimString(e.source, 240);
      if (!source) return null;
      return { source, locator: nullableString(e.locator, 120) } as Citation;
    })
    .filter((x): x is Citation => x !== null)
    .slice(0, 8);
}

function parseShortExplanations(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .slice(0, 5)
    .map((s) => s.trim().slice(0, 600));
}

function emptyStructured(jurisdiction: string | null): {
  jurisdiction: string | null;
  relevantLaws: RelevantLaw[];
  citations: Citation[];
  shortExplanations: string[];
} {
  return { jurisdiction, relevantLaws: [], citations: [], shortExplanations: [] };
}

function userJurisdiction(state: LawFirmState): string | null {
  const v = state.facts?.state;
  if (typeof v !== 'string' || v.trim().length === 0) return null;
  return v.trim().slice(0, 80);
}

/**
 * Project CourtListener API rows into the typed CaseLawEntry shape stored on
 * the state. The `summary` field is just the search snippet trimmed; we do
 * NOT promote snippets to "summaries" semantically — the Research prompt is
 * instructed to treat them as excerpts only.
 */
function projectCaseLaw(rows: CourtListenerResult[]): CaseLawEntry[] {
  return rows.map((r) => ({
    title: r.title,
    citation: r.citation,
    court: r.court,
    dateFiled: r.dateFiled,
    url: r.url,
    summary: r.snippet,
  }));
}

export async function researchAgent(state: LawFirmState): Promise<LawFirmUpdate> {
  const log = createLogger(state.requestId);
  const startedAt = Date.now();
  const stated = userJurisdiction(state);
  log.info('agent.research.start', {
    feature: 'agents',
    agent: 'research',
    intent: state.intent,
    mode: state.mode,
    has_facts: !!state.facts,
    user_jurisdiction: stated ?? 'unknown',
    materials_jurisdiction: RAG_JURISDICTION,
  });

  if (stated && !/rhode\s*island|^ri$/i.test(stated)) {
    log.warn('agent.research.jurisdiction_mismatch', {
      feature: 'agents',
      agent: 'research',
      user_jurisdiction: stated,
      materials_jurisdiction: RAG_JURISDICTION,
    });
  }

  // ---- PRIMARY: Supabase RAG ----
  const query = buildQuery(state);
  const ragOutcome = await fetchRagContext(query, state.requestId);

  const ragBlockRaw = ragOutcome.kind === 'found' ? ragOutcome.block : '';
  const ragMatchCount = ragOutcome.kind === 'found' ? ragOutcome.matchCount : 0;
  const ragDegraded = ragOutcome.kind === 'missing' && ragOutcome.degraded;
  const ragCircuitOpen = ragOutcome.kind === 'missing' && ragOutcome.circuitOpen;
  const ragReason = ragOutcome.kind === 'missing' ? ragOutcome.reason : undefined;

  if (ragOutcome.kind === 'found') {
    log.info('chat.rag_context_found', {
      feature: 'agents',
      intent: state.intent,
      match_count: ragOutcome.matchCount,
    });
  } else {
    log.info('chat.rag_context_missing', {
      feature: 'agents',
      intent: state.intent,
      reason: ragOutcome.reason,
    });
  }

  // ---- SECONDARY: CourtListener (opt-in) ----
  const clEnabled = isCourtListenerEnabled();
  let courtListenerResults: CourtListenerResult[] = [];
  let clDegraded = false;

  if (clEnabled) {
    log.info('agent.research.courtlistener_start', {
      feature: 'agents',
      agent: 'research',
      intent: state.intent,
      jurisdiction: stated ?? 'unknown',
    });
    try {
      courtListenerResults = await searchCourtListenerCases({
        query: buildCourtListenerQuery(state),
        jurisdiction: state.facts?.state ?? null,
        requestId: state.requestId,
      });
    } catch {
      // Network / non-2xx / parse failure. Degrade gracefully — Supabase
      // RAG remains the trusted source; we just won't have case-law context.
      clDegraded = true;
      courtListenerResults = [];
    }
    log.info('agent.research.courtlistener_end', {
      feature: 'agents',
      agent: 'research',
      intent: state.intent,
      enabled: true,
      result_count: courtListenerResults.length,
      degraded: clDegraded,
      jurisdiction: stated ?? 'unknown',
    });
  }

  const courtListenerStatus: CourtListenerStatus = {
    enabled: clEnabled,
    resultCount: courtListenerResults.length,
    degraded: clDegraded,
  };

  // ---- Merge sources for the LLM payload + downstream Safety haystack ----
  const mergedBlock = mergeResearchSources({
    ragBlock: ragBlockRaw,
    courtListenerResults,
  });

  // Structured research pass over the merged block + intake facts.
  const facts = state.facts;
  const factsBlock = [
    `User-stated jurisdiction: ${stated ?? '(unknown)'}`,
    `Materials available: ${RAG_JURISDICTION} curated handbook (PRIMARY)` +
      (clEnabled ? ' + CourtListener case law (SECONDARY)' : ''),
    facts?.legal_issue ? `Legal issue: ${facts.legal_issue}` : '',
    facts?.timeline ? `Timeline: ${facts.timeline}` : '',
    facts?.urgency_level ? `Urgency: ${facts.urgency_level}` : '',
    facts?.summary ? `Intake summary (already redacted): ${facts.summary}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const userPayload =
    `Case facts:\n${factsBlock}\n\n` +
    (mergedBlock
      ? `Retrieved research materials:\n${mergedBlock}`
      : `No retrieved materials available for this query.`);

  const groq = await callGroq({
    agent: 'research',
    requestId: state.requestId,
    intent: state.intent,
    system: `${RESEARCH_AGENT_SYSTEM_PROMPT}\n\n${RESEARCH_AGENT_OUTPUT_INSTRUCTIONS}`,
    user: userPayload,
    temperature: 0.2,
    maxTokens: 900,
  });

  let parsedJurisdiction: string | null = stated;
  let relevantLaws: RelevantLaw[] = [];
  let citations: Citation[] = [];
  let shortExplanations: string[] = [];
  let llmDegraded = false;
  let llmReason: string | undefined;

  if (groq.ok) {
    const parsed = tryParseJson(groq.text);
    if (parsed) {
      parsedJurisdiction =
        nullableString(parsed.jurisdiction, 80) ?? stated;
      relevantLaws = parseRelevantLaws(parsed.relevant_laws);
      citations = parseCitations(parsed.citations);
      shortExplanations = parseShortExplanations(parsed.short_explanations);
    } else {
      log.warn('agent.research.parse_failed', {
        feature: 'agents',
        agent: 'research',
        intent: state.intent,
      });
      llmDegraded = true;
      llmReason = 'parse_failed';
      const empty = emptyStructured(stated);
      relevantLaws = empty.relevantLaws;
      citations = empty.citations;
      shortExplanations = empty.shortExplanations;
    }
  } else {
    llmDegraded = true;
    llmReason = groq.reason;
  }

  const research: ResearchSlice = {
    ragMatchCount,
    ragBlock: mergedBlock,
    degraded: ragDegraded || llmDegraded,
    reason: ragReason ?? llmReason,
    jurisdiction: parsedJurisdiction,
    relevantLaws,
    citations,
    shortExplanations,
    caseLaw: projectCaseLaw(courtListenerResults),
    courtListener: courtListenerStatus,
  };

  const overallOutcome: 'ok' | 'degraded' | 'skipped' =
    ragMatchCount > 0 && !llmDegraded
      ? 'ok'
      : ragDegraded || llmDegraded
        ? 'degraded'
        : 'skipped';

  log.info('agent.research.end', {
    feature: 'agents',
    agent: 'research',
    intent: state.intent,
    mode: state.mode,
    duration_ms: Date.now() - startedAt,
    outcome: overallOutcome,
    supabase_match_count: ragMatchCount,
    courtlistener_enabled: clEnabled,
    courtlistener_result_count: courtListenerResults.length,
    courtlistener_degraded: clDegraded,
    relevant_laws_count: relevantLaws.length,
    citations_count: citations.length,
    short_explanations_count: shortExplanations.length,
    rag_reason: ragReason,
    llm_outcome: groq.ok ? 'ok' : groq.reason,
    jurisdiction: parsedJurisdiction ?? 'unknown',
  });

  const update: LawFirmUpdate = { research };
  if (ragDegraded || ragCircuitOpen || llmDegraded) {
    update.degraded = ragDegraded || llmDegraded;
    update.degradation = {
      rag: ragDegraded,
      llm: llmDegraded,
      ...(ragCircuitOpen ? { rag_circuit_open: true } : {}),
    };
  }
  return update;
}
