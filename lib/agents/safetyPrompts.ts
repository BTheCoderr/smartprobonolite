/**
 * Compliance contract for the Safety Agent.
 *
 * The Safety Agent is the graph's chokepoint. We deliberately implement it as
 * a deterministic rule pack (no LLM call) so it never has a "Groq is down"
 * failure mode at the most safety-critical step. The verbatim
 * operator-supplied prompt below is the POLICY SPEC; the rule pack in
 * `safetyAgent.ts` is its OPERATIONAL ENFORCEMENT.
 *
 * Policy → rule mapping:
 *
 *   "no legal advice claims"      → LEGAL_ADVICE_CLAIM_PATTERNS strips first-person
 *                                   advice claims ("I am your attorney",
 *                                   "this is legal advice", etc.).
 *   "all responses are            → CERTAINTY_PATTERNS strips attorney-style
 *    informational"                 outcome predictions ("you will win",
 *                                   "guaranteed", "you have a strong case").
 *   "disclaimers are included"    → ensureDisclaimer() guarantees the
 *                                   STAFF_REVIEW disclaimer appears in every
 *                                   final message; appends it if missing.
 *   "flag risky outputs"          → safety.notes[] is the structured flag
 *                                   surface (`certainty:N`, `court_filing:N`,
 *                                   `invented_citations:N`, `legal_advice_claim:N`,
 *                                   `disclaimer_appended:1`, `compose_failed`)
 *                                   plus safety.decision ∈ pass|softened|replaced.
 *
 * If a future product decision wants an additional LLM-based compliance pass,
 * gate it behind an env flag (e.g. `AGENTS_SAFETY_LLM_REVIEW=true`) and run
 * it AFTER the rule pack — never as a replacement.
 */

export const SAFETY_AGENT_POLICY_SPEC = `You are a compliance monitor.

Ensure:
- no legal advice claims
- all responses are informational
- disclaimers are included

Flag risky outputs.`;
