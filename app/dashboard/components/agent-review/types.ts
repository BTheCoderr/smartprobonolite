/**
 * Wire types for the Agent Case Review panel.
 *
 * Mirrors the `agentReview` payload that `pages/api/chat.ts` attaches when the
 * six-agent LangGraph path runs (gated by `AGENTS_DEFAULT_ON` env or
 * `use_agents: true` per-request). All fields are optional because the API
 * only fills slices the corresponding agent actually wrote.
 */

export type AgentUrgency = 'low' | 'medium' | 'high';

export type AgentReviewFacts = {
  state: string | null;
  legal_issue: string | null;
  timeline: string | null;
  key_facts: string[];
  urgency_level: AgentUrgency | null;
  missing_info: string[];
  summary: string;
  flags: string[];
};

export type AgentReviewCitation = {
  index: number;
  title: string;
  source: string;
  topic?: string;
};

export type AgentReviewResearch = {
  ragMatchCount: number;
  degraded: boolean;
  reason?: string;
  citations?: AgentReviewCitation[];
  ragBlockExcerpt?: string;
};

export type AgentReviewAnalysis = {
  applicability: string;
  openQuestions: string[];
  recommendation: 'inform' | 'draft' | 'escalate';
};

export type AgentReviewDraft = {
  title: string;
  body: string;
  type: 'letter' | 'summary' | 'checklist';
};

export type AgentReviewStrategy = {
  nextSteps: string[];
  whatToBring: string[];
  staffReviewRequired: boolean;
};

export type AgentReviewSafety = {
  decision: 'pass' | 'softened' | 'replaced';
  notes: string[];
  redactions: number;
};

export type AgentReviewDegradation = {
  llm?: boolean;
  rag?: boolean;
  rag_circuit_open?: boolean;
};

export type AgentReview = {
  intent?: string;
  mode?: 'chat' | 'ri_eviction';
  usedProvider?: 'groq' | 'huggingface' | null;
  degraded?: boolean;
  degradation?: AgentReviewDegradation;
  facts?: AgentReviewFacts;
  research?: AgentReviewResearch;
  analysis?: AgentReviewAnalysis;
  draft?: AgentReviewDraft;
  strategy?: AgentReviewStrategy;
  safety?: AgentReviewSafety;
};
