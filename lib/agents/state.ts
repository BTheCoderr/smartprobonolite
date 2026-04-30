/**
 * LangGraph state schema for the six-agent law-firm graph.
 *
 * Each agent writes its own slice (`facts`, `research`, `analysis`, `draft`,
 * `strategy`, `safety`) and the Safety agent always writes `finalMessage`.
 *
 * `degraded` and `degradation` use OR / merge reducers so any agent that hits
 * a degraded path can flag it without later agents accidentally clearing it.
 *
 * --------------------------------------------------------------------------
 * RELATION TO THE CANONICAL LANGGRAPH `LegalState` TYPEDDICT
 * --------------------------------------------------------------------------
 * Tutorials commonly model the law-firm graph state as a flat TypedDict:
 *
 *   class LegalState(TypedDict):
 *       user_input: str
 *       extracted_facts: dict
 *       legal_sources: list
 *       analysis: dict
 *       documents: list
 *       next_steps: list
 *
 * This file is the Zod-hardened analog. Field correspondence:
 *
 *   user_input       → userMessage  (+ recentMessages for chat history)
 *   extracted_facts  → facts         (IntakeFactsZ — typed, with PII rules)
 *   legal_sources    → research      (ResearchZ — relevantLaws, citations,
 *                                    shortExplanations, plus raw ragBlock)
 *   analysis         → analysis      (AnalysisZ — legalSummary, risks,
 *                                    possibleViolations, strengthsOfCase,
 *                                    openQuestions, recommendation)
 *   documents        → draft         (DraftZ — single most-recent draft,
 *                                    type whitelisted to letter | summary |
 *                                    checklist; never a court filing)
 *   next_steps       → strategy      (StrategyZ — steps[{step,why,when}],
 *                                    whatToFileNext, whatToBring)
 *
 * Plus three extras that the canonical TypedDict does NOT model but that we
 * need for safe operation:
 *
 *   safety           → SafetySlice   (decision + risk-flag notes from the
 *                                    Compliance Monitor / Safety agent)
 *   degraded         → boolean       (OR-reduced across all agents)
 *   degradation      → DegradationZ  (per-subsystem failure flags, merged)
 *
 * If you port a tutorial that mutates `LegalState["documents"]` directly,
 * the equivalent here is to return `{ draft: ... }` from your node — the
 * StateGraph applies it as a slice update.
 * --------------------------------------------------------------------------
 */

import { ReducedValue, StateSchema } from '@langchain/langgraph';
import { z } from 'zod';
import type { ChatIntent } from '@/lib/chat/intent';
import type { RiIntakeContext } from '@/lib/prompts/riEvictionPrompt';

const ChatIntentZ = z.enum([
  'greeting',
  'assistant_capabilities',
  'file_review',
  'lockout',
  'notice_explanation',
  'help_desk_prep',
  'intake_summary',
  'unknown',
]);

const ModeZ = z.enum(['chat', 'ri_eviction']);

const MessageZ = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

/** Loose schema — legacy intake context shape is wider than this; we mostly read it. */
const RiIntakeContextZ = z
  .object({
    summary: z.string().optional(),
    category: z.string().optional(),
    categoryLabel: z.string().optional(),
    flags: z.array(z.string()).optional(),
    citations: z
      .array(z.object({ sourceTitle: z.string(), quote: z.string() }))
      .optional(),
    handoutSections: z
      .array(
        z.object({
          title: z.string(),
          summary: z.string(),
          bullets: z.array(z.string()).optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

/**
 * IntakeFacts — the contract the Intake Agent must populate.
 *
 * Mirrors the user-provided system prompt (state, legal_issue, timeline,
 * key_facts, urgency_level) plus a `missing_info` slot for fields the agent
 * could not extract, and `summary`/`flags` slots for downstream RAG/Analysis.
 */
const UrgencyZ = z.enum(['low', 'medium', 'high']);

const IntakeFactsZ = z.object({
  state: z.string().nullable(),
  legal_issue: z.string().nullable(),
  timeline: z.string().nullable(),
  key_facts: z.array(z.string()),
  urgency_level: UrgencyZ.nullable(),
  missing_info: z.array(z.string()),
  /** Short, redacted summary used as the embed query / Analysis input. */
  summary: z.string(),
  /** Routing flags surfaced to later agents (e.g. "lockout", "no_lease"). */
  flags: z.array(z.string()),
});

const RelevantLawZ = z.object({
  title: z.string(),
  summary: z.string(),
});

const CitationZ = z.object({
  source: z.string(),
  locator: z.string().nullable(),
});

/**
 * Case-law results from the SECONDARY source (CourtListener). Only populated
 * when `courtListener.enabled === true` and the API call succeeded with at
 * least one result. Safety reads `title`/`citation`/`url` to keep legitimate
 * CourtListener citations from being stripped as "invented".
 */
const CaseLawEntryZ = z.object({
  title: z.string(),
  citation: z.string().nullable(),
  court: z.string().nullable(),
  dateFiled: z.string().nullable(),
  url: z.string().nullable(),
  summary: z.string(),
});

/**
 * Per-call status of the CourtListener secondary source. Always present on
 * the research slice when the agent ran; lets downstream agents and logs
 * distinguish "disabled" from "enabled but degraded".
 */
const CourtListenerStatusZ = z.object({
  enabled: z.boolean(),
  resultCount: z.number(),
  degraded: z.boolean(),
});

const ResearchZ = z.object({
  ragMatchCount: z.number(),
  /**
   * Combined research grounding block. Always starts with the curated RI
   * Supabase chunks; when CourtListener is enabled and returned results,
   * the merged CourtListener section is appended after a divider. Stored
   * as one field so Safety's invented-citation haystack covers both
   * sources without a schema change.
   */
  ragBlock: z.string(),
  degraded: z.boolean(),
  reason: z.string().optional(),
  /** User's stated jurisdiction; null when unknown. */
  jurisdiction: z.string().nullable(),
  /** Structured findings from the Research agent's LLM pass over the merged block. */
  relevantLaws: z.array(RelevantLawZ),
  citations: z.array(CitationZ),
  shortExplanations: z.array(z.string()),
  /** SECONDARY-source raw rows surfaced for Safety + downstream rendering. */
  caseLaw: z.array(CaseLawEntryZ).optional(),
  /** SECONDARY-source call status for observability and Safety. */
  courtListener: CourtListenerStatusZ.optional(),
});

const AnalysisZ = z.object({
  /** Plain-language "how the law applies" summary; user-visible. */
  legalSummary: z.string(),
  /** Things that could go badly for the user. User-visible. */
  risks: z.array(z.string()),
  /** Things the landlord may have done inconsistent with RI law, framed as possibilities. */
  possibleViolations: z.array(z.string()),
  /** Facts in the user's favor; user-visible. */
  strengthsOfCase: z.array(z.string()),
  /** Open questions staff should clarify before relying on next steps. */
  openQuestions: z.array(z.string()),
  /** Routing-only signal for the conditional edge. Not directly user-visible. */
  recommendation: z.enum(['inform', 'draft', 'escalate']),
});

const DraftZ = z.object({
  title: z.string(),
  body: z.string(),
  type: z.enum(['letter', 'summary', 'checklist']),
});

const StrategyStepZ = z.object({
  step: z.string(),
  why: z.string(),
  when: z.string(),
});

const StrategyZ = z.object({
  /** Step / Why / When trios — the workflow strategist's primary output. */
  steps: z.array(StrategyStepZ),
  /**
   * One-sentence description of what staff or an attorney can prepare and
   * file on the user's behalf, or null when nothing applicable. NEVER a
   * "you-should-file-this" instruction to the user.
   */
  whatToFileNext: z.string().nullable(),
  /** Items the user should bring to the Eviction Help Desk for staff review. */
  whatToBring: z.array(z.string()),
  /** Always true — surfaced in the final composed reply. */
  staffReviewRequired: z.literal(true),
});

const SafetyZ = z.object({
  decision: z.enum(['pass', 'softened', 'replaced']),
  notes: z.array(z.string()),
  redactions: z.number(),
});

const DegradationZ = z.object({
  llm: z.boolean().optional(),
  rag: z.boolean().optional(),
  rag_circuit_open: z.boolean().optional(),
});

const ProviderZ = z.enum(['groq', 'huggingface']).nullable();

/**
 * Single source of truth for the graph's state.
 *
 * - Each slice (`facts`, `research`, …) is LastValue: only one node writes it.
 * - `degraded` is OR-reduced: any agent that flips to degraded sticks.
 * - `degradation` is shallow-merged: each agent contributes its known signal.
 */
export const StateSchemaDef = new StateSchema({
  requestId: z.string(),
  clientTraceId: z.string().optional(),
  mode: ModeZ,
  intent: ChatIntentZ,
  recentMessages: z.array(MessageZ),
  userMessage: z.string(),
  uploadedText: z.string().optional(),
  intakeContext: RiIntakeContextZ.nullable().optional(),
  handoffContext: z.string().optional(),

  facts: IntakeFactsZ.optional(),
  research: ResearchZ.optional(),
  analysis: AnalysisZ.optional(),
  draft: DraftZ.optional(),
  strategy: StrategyZ.optional(),
  safety: SafetyZ.optional(),

  finalMessage: z.string().optional(),

  degraded: new ReducedValue<boolean, boolean>(z.boolean().default(false), {
    inputSchema: z.boolean(),
    reducer: (cur, next) => Boolean(cur) || Boolean(next),
  }),
  degradation: new ReducedValue<z.infer<typeof DegradationZ>, z.infer<typeof DegradationZ>>(
    DegradationZ.default(() => ({})),
    {
      inputSchema: DegradationZ,
      reducer: (cur, next) => ({
        ...(cur ?? {}),
        ...(next ?? {}),
        llm: Boolean(cur?.llm) || Boolean(next?.llm),
        rag: Boolean(cur?.rag) || Boolean(next?.rag),
        ...(cur?.rag_circuit_open || next?.rag_circuit_open
          ? { rag_circuit_open: true }
          : {}),
      }),
    },
  ),
  usedProvider: ProviderZ.optional(),
});

export type LawFirmState = typeof StateSchemaDef.State;
export type LawFirmUpdate = typeof StateSchemaDef.Update;
export type IntakeFacts = z.infer<typeof IntakeFactsZ>;
export type ResearchSlice = z.infer<typeof ResearchZ>;
export type RelevantLaw = z.infer<typeof RelevantLawZ>;
export type Citation = z.infer<typeof CitationZ>;
export type CaseLawEntry = z.infer<typeof CaseLawEntryZ>;
export type CourtListenerStatus = z.infer<typeof CourtListenerStatusZ>;
export type AnalysisSlice = z.infer<typeof AnalysisZ>;
export type DraftSlice = z.infer<typeof DraftZ>;
export type StrategySlice = z.infer<typeof StrategyZ>;
export type StrategyStep = z.infer<typeof StrategyStepZ>;
export type SafetySlice = z.infer<typeof SafetyZ>;
export type Degradation = z.infer<typeof DegradationZ>;

/**
 * Build the initial state to pass to `lawFirmGraph.invoke(...)`.
 *
 * Caller is responsible for resolving `requestId`, classifying `intent`,
 * and trimming `recentMessages`. We coerce mode to a value the graph supports.
 */
export function initialStateFrom(args: {
  requestId: string;
  clientTraceId?: string;
  mode: 'chat' | 'ri_eviction' | 'extract' | undefined;
  intent: ChatIntent;
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
  uploadedText?: string;
  intakeContext?: RiIntakeContext | null;
  handoffContext?: string;
}): LawFirmUpdate {
  const safeMode: 'chat' | 'ri_eviction' = args.mode === 'ri_eviction' ? 'ri_eviction' : 'chat';
  return {
    requestId: args.requestId,
    clientTraceId: args.clientTraceId,
    mode: safeMode,
    intent: args.intent,
    recentMessages: args.recentMessages.map((m) => ({ role: m.role, content: m.content })),
    userMessage: args.userMessage,
    uploadedText: args.uploadedText,
    intakeContext: (args.intakeContext as LawFirmUpdate['intakeContext']) ?? null,
    handoffContext: args.handoffContext,
    degraded: false,
    degradation: {},
  };
}
