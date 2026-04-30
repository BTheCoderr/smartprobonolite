/**
 * Six-agent law-firm graph (LangGraph v1).
 *
 * Flow:
 *   START → intake → research → analysis → (document?) → strategy → safety → END
 *
 * --------------------------------------------------------------------------
 * INTENTIONAL DIVERGENCE FROM THE CANONICAL LANGGRAPH LAW-FIRM PATTERN
 * --------------------------------------------------------------------------
 * The canonical pattern (e.g. tutorial videos, blog posts) is strictly linear
 * with five nodes:
 *
 *   START → intake → research → analysis → document → strategy → END
 *
 * We deliberately diverge in two places:
 *
 *  1. Conditional edge after `analysis_agent` skips `document_agent` when
 *     the analysis recommendation is NOT `'draft'`. Most lockout / notice
 *     turns shouldn't produce a draft, and running the Document agent anyway
 *     burns a Groq call AND increases the surface area for forbidden
 *     court-filing language. The Document agent already has a hard
 *     "letters / summaries / checklists only" scope override; the conditional
 *     edge is the second, cheaper guardrail.
 *
 *  2. A 6th `safety_agent` node is appended after `strategy_agent` and is
 *     the SOLE writer of `finalMessage`. It is purely rule-based (no LLM
 *     call, see `lib/agents/safetyAgent.ts`) so the chokepoint never has a
 *     "Groq is down" failure mode at the most safety-critical step. It
 *     enforces the operator-supplied compliance contract in
 *     `lib/agents/safetyPrompts.ts`.
 *
 * If you ever port a tutorial/example that uses the canonical 5-node flow,
 * route it through this graph anyway — don't edit it back to linear.
 * --------------------------------------------------------------------------
 *
 * Compiled at module load. Each `invoke()` is a fresh single-turn run; no
 * persistence layer is attached (multi-turn memory is the client's `messages[]`).
 */

import { END, START, StateGraph } from '@langchain/langgraph';

import { StateSchemaDef, type LawFirmState, type LawFirmUpdate } from '@/lib/agents/state';
import { intakeAgent } from '@/lib/agents/intakeAgent';
import { researchAgent } from '@/lib/agents/researchAgent';
import { analysisAgent } from '@/lib/agents/analysisAgent';
import { documentAgent } from '@/lib/agents/documentAgent';
import { strategyAgent } from '@/lib/agents/strategyAgent';
import { safetyAgent } from '@/lib/agents/safetyAgent';

/**
 * Node names are suffixed with `_agent` so they don't collide with state-channel
 * names (LangGraph rejects same-named channels and nodes).
 */
function routeAfterAnalysis(state: LawFirmState): 'document_agent' | 'strategy_agent' {
  return state.analysis?.recommendation === 'draft' ? 'document_agent' : 'strategy_agent';
}

function build() {
  return new StateGraph(StateSchemaDef)
    .addNode('intake_agent', intakeAgent)
    .addNode('research_agent', researchAgent)
    .addNode('analysis_agent', analysisAgent)
    .addNode('document_agent', documentAgent)
    .addNode('strategy_agent', strategyAgent)
    .addNode('safety_agent', safetyAgent)
    .addEdge(START, 'intake_agent')
    .addEdge('intake_agent', 'research_agent')
    .addEdge('research_agent', 'analysis_agent')
    .addConditionalEdges('analysis_agent', routeAfterAnalysis, {
      document_agent: 'document_agent',
      strategy_agent: 'strategy_agent',
    })
    .addEdge('document_agent', 'strategy_agent')
    .addEdge('strategy_agent', 'safety_agent')
    .addEdge('safety_agent', END)
    .compile();
}

let cached: ReturnType<typeof build> | null = null;

/** Compile lazily so importing this module doesn't run StateGraph.compile() in cold-start sensitive code paths. */
export function getLawFirmGraph(): ReturnType<typeof build> {
  if (!cached) cached = build();
  return cached;
}

export type { LawFirmState, LawFirmUpdate };
