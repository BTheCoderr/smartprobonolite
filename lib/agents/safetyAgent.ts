/**
 * Safety Agent — compliance monitor (graph chokepoint).
 *
 * Implements the operator-supplied compliance contract in
 * `lib/agents/safetyPrompts.ts`. Pure rule-based gate — NEVER calls an LLM
 * — so it has no "Groq is down" failure mode at the graph's most
 * safety-critical step.
 *
 * Combines the upstream slices into a single `finalMessage` string, then
 * enforces:
 *   - "no legal advice claims"        → strips first-person advice claims
 *                                       ("I am your attorney", "this is legal advice")
 *   - "all responses are              → strips attorney-style certainty / outcome
 *      informational"                   predictions ("you will win", "guaranteed")
 *   - "disclaimers are included"      → guarantees STAFF_REVIEW disclaimer is
 *                                       present at the end of every final message
 *   - no court-filing verbs in        → strips Document agent court-filing language;
 *     draft body or strategy            allows staff-mediated framing in Strategy
 *   - no invented Rhode Island        → strips citations not present in the
 *     citations                         retrieved RAG block or Research findings
 *   - no raw PII                      → scrubs emails / phone numbers /
 *                                       9+ digit account-shaped runs
 *
 * Risk-flag surface (the "Flag risky outputs" requirement):
 *   - safety.notes ⊂ {
 *       'certainty:N', 'court_filing:N', 'invented_citations:N',
 *       'legal_advice_claim:N', 'disclaimer_appended:1', 'compose_failed',
 *     }
 *   - safety.decision ∈ { 'pass' | 'softened' | 'replaced' }
 *
 * Decision values:
 *   - 'pass'     — no rule fired; final message returned as composed
 *   - 'softened' — at least one rule fired; offending paragraphs replaced
 *                  with deterministic safe text + STAFF_REVIEW marker
 *   - 'replaced' — composition itself failed; full reply replaced with fallback
 */

import { createLogger } from '@/lib/logger';
import { intentFallback } from '@/lib/chat/intentFallbacks';
import { SAFETY_AGENT_POLICY_SPEC } from '@/lib/agents/safetyPrompts';
import type { LawFirmState, LawFirmUpdate, SafetySlice } from '@/lib/agents/state';

// Re-export the policy spec so external callers (tests, docs, dashboards) can
// reference the operator-supplied compliance contract that this agent enforces.
export { SAFETY_AGENT_POLICY_SPEC };

const STAFF_REVIEW =
  'Eviction Help Desk staff or an attorney should review your situation before you rely on next steps.';

const STAFF_REVIEW_MARKER = '\n\n[STAFF_REVIEW] ';

const CERTAINTY_PATTERNS: RegExp[] = [
  /\byou\s+(will|are\s+going\s+to)\s+(win|lose|prevail|be\s+evicted|be\s+kicked\s+out)\b/i,
  /\byou\s+(should|must)\s+(sue|countersue|prevail|win)\b/i,
  /\byou\s+have\s+a\s+(strong|winning|guaranteed|solid)\s+case\b/i,
  /\bguaranteed\s+to\s+(win|prevail|succeed)\b/i,
  /\b(you|the\s+tenant)\s+(definitely|certainly)\s+(will|won't)\b/i,
];

const COURT_FILING_VERBS: RegExp[] =
  // Document agent must never produce court filings; Safety enforces it on draft.body.
  [
    /\b(motion\s+to\s+(dismiss|strike|set\s+aside|compel)|answer\s+to\s+(the\s+)?complaint|notice\s+of\s+motion|memorandum\s+of\s+(law|points)|complaint|affidavit\s+in\s+support|opposition\s+to|reply\s+brief|subpoena|order\s+to\s+show\s+cause|judgment\s+for\s+(plaintiff|defendant)|writ\s+of\s+(execution|possession))\b/i,
  ];

const PII_EMAIL = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
/**
 * Phone-shaped digit runs. Negative lookbehind on `§` (with optional
 * whitespace) prevents false positives on statute section numbers like
 * "§ 34-18-44.1", which CourtListener case-law results commonly contain
 * and which would otherwise be mangled into "[redacted-phone]".
 */
const PII_PHONE = /(?<!§\s?)\+?\d[\d\s().-]{8,}\d/g;
const PII_ACCOUNT = /\b\d{9,}\b/g;

const STATUTE_PATTERN = /R\.?\s?I\.?\s+Gen(?:eral)?\.?\s+Laws?\s*§\s*[\d.\-]+/gi;

function scrubPii(value: string): { text: string; redactions: number } {
  let count = 0;
  const scrubbed = value
    .replace(PII_EMAIL, () => {
      count += 1;
      return '[redacted-email]';
    })
    .replace(PII_PHONE, () => {
      count += 1;
      return '[redacted-phone]';
    })
    .replace(PII_ACCOUNT, () => {
      count += 1;
      return '[redacted-number]';
    });
  return { text: scrubbed, redactions: count };
}

function findCertaintyHits(text: string): string[] {
  return CERTAINTY_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}

function findFilingHits(text: string): string[] {
  return COURT_FILING_VERBS.filter((re) => re.test(text)).map((re) => re.source);
}

/**
 * Second-person directives that instruct the user themselves to file/draft/sign
 * a court document. Allows third-person framings like "Staff can file..." used
 * legitimately by the Strategy agent.
 */
const USER_AS_FILER_PATTERNS: RegExp[] = [
  /\byou\s+(should|must|need\s+to|can|could|will)\s+(file|draft|sign|submit|serve)\s+(a|an|the|your)?\s*(answer|motion|complaint|opposition|reply|affidavit|declaration|subpoena|notice|memorandum|order|writ)\b/i,
  /\b(file|draft|sign|submit|serve)\s+(your\s+own\s+)?(answer|motion|complaint|opposition|reply|affidavit|declaration|subpoena|memorandum|writ)\b\s+(yourself|on\s+your\s+own)\b/i,
];

function findUserAsFilerHits(text: string): string[] {
  return USER_AS_FILER_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}

/**
 * "No legal advice claims" enforcement.
 *
 * Catches first-person attorney claims and explicit "this is legal advice"
 * assertions. Crafted to NOT match the legitimate disclaimer copy we always
 * append ("Eviction Help Desk staff or an attorney should review your
 * situation...") — that copy is third-person prescriptive, not first-person
 * claim-of-relationship.
 */
const LEGAL_ADVICE_CLAIM_PATTERNS: RegExp[] = [
  /\bthis\s+is\s+(my\s+)?legal\s+advice\b/i,
  /\bi(?:'m|\s+am)\s+giving\s+you\s+legal\s+advice\b/i,
  /\bi(?:'m|\s+am)\s+(your|a)\s+(attorney|lawyer|legal\s+counsel)\b/i,
  /\bas\s+your\s+(attorney|lawyer|legal\s+counsel)\b/i,
  /\bmy\s+legal\s+(opinion|advice|recommendation)(?:\s+is\b)?/i,
  /\bi\s+(advise|recommend)\s+you\s+to\s+(sue|countersue|file|plead)\b/i,
];

function findLegalAdviceClaimHits(text: string): string[] {
  return LEGAL_ADVICE_CLAIM_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}

function stripLegalAdviceClaims(text: string): string {
  let out = text;
  for (const re of LEGAL_ADVICE_CLAIM_PATTERNS) {
    out = out.replace(
      re,
      '[Removed: this tool is informational only. Please ask staff or an attorney for legal advice.]',
    );
  }
  return out;
}

/**
 * "Disclaimers are included" enforcement.
 *
 * The compose() helper always appends `STAFF_REVIEW`, but if a future
 * refactor regresses or an upstream slice produces a non-composed message,
 * we re-check at the chokepoint and append if missing.
 *
 * Returns { text, appended } where appended === true when we had to add it.
 *
 * Exported for direct unit/smoke testing of the disclaimer guarantee.
 */
export function ensureDisclaimer(text: string): { text: string; appended: boolean } {
  // Match the STAFF_REVIEW sentence loosely so a paraphrase would still count,
  // but be strict enough that random words don't satisfy it.
  const present = /\bEviction\s+Help\s+Desk\s+staff\s+or\s+an\s+attorney\s+should\s+review\b/i.test(
    text,
  );
  if (present) return { text, appended: false };
  return {
    text: `${text}\n\nStaff review note:\n${STAFF_REVIEW}`,
    appended: true,
  };
}

/**
 * Citations are "invented" when they don't appear in any of the trusted
 * research surfaces. We check the union of:
 *   - the raw RAG block (curated RI handbook chunks; also contains the
 *     merged CourtListener section when SECONDARY is enabled)
 *   - the Research agent's structured `citations[]` (sources + locators)
 *   - CourtListener case-law extras (titles, citations, URLs)
 *
 * Including the CourtListener extras explicitly is belt-and-suspenders: the
 * merged ragBlock already contains them, but matching directly against the
 * structured `caseLaw` rows means a CourtListener citation that the LLM
 * cited in `relevantLaws[].summary` (rather than `citations[]`) still passes.
 */
function findInventedCitations(
  text: string,
  ragBlock: string,
  citationLocators: string[],
  courtListenerExtras: string[] = [],
): string[] {
  const matches = text.match(STATUTE_PATTERN);
  if (!matches) return [];
  const haystack = (
    ragBlock +
    '\n' +
    citationLocators.join('\n') +
    '\n' +
    courtListenerExtras.join('\n')
  ).toLowerCase();
  return matches
    .map((m) => m.trim())
    .filter((m) => !haystack.includes(m.toLowerCase()))
    .slice(0, 5);
}

/**
 * Replace only the specific invented citations (not every statute citation
 * in the text). Necessary now that legitimate RI Gen Laws sections quoted
 * in CourtListener opinions can legally appear in a final message — we
 * must not strip them just because some other citation in the same message
 * was invented.
 */
function stripInventedCitations(text: string, invented: string[]): string {
  if (invented.length === 0) return text;
  let out = text;
  for (const cite of invented) {
    // Escape regex metacharacters so each invented cite is matched as a literal.
    const literal = cite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(literal, 'gi'), '[citation removed pending staff review]');
  }
  return out;
}

function compose(state: LawFirmState): string {
  const sections: string[] = [];

  const facts = state.facts;
  if (facts && (facts.legal_issue || facts.urgency_level || facts.state)) {
    const bits: string[] = [];
    if (facts.legal_issue) bits.push(`Issue: ${facts.legal_issue}`);
    if (facts.state) bits.push(`State: ${facts.state}`);
    if (facts.urgency_level) bits.push(`Urgency: ${facts.urgency_level}`);
    if (bits.length > 0) sections.push(`Intake snapshot:\n- ${bits.join('\n- ')}`);
  }

  if (state.analysis?.legalSummary) {
    sections.push(`Explanation:\n${state.analysis.legalSummary}`);
  }

  if (state.analysis?.strengthsOfCase?.length) {
    sections.push(
      `Things that may help (staff should verify):\n- ${state.analysis.strengthsOfCase.join('\n- ')}`,
    );
  }

  if (state.analysis?.risks?.length) {
    sections.push(`Risks to be aware of:\n- ${state.analysis.risks.join('\n- ')}`);
  }

  if (state.analysis?.possibleViolations?.length) {
    sections.push(
      `Possible issues to flag for staff (not findings):\n- ${state.analysis.possibleViolations.join('\n- ')}`,
    );
  }

  if (state.research?.relevantLaws?.length) {
    sections.push(
      `Relevant Rhode Island law:\n${state.research.relevantLaws
        .slice(0, 5)
        .map((l) => `- ${l.title} — ${l.summary}`)
        .join('\n')}`,
    );
  }

  if (state.draft?.body) {
    sections.push(`Draft (${state.draft.type}) — ${state.draft.title}\n\n${state.draft.body}`);
  }

  if (state.strategy?.steps?.length) {
    const numbered = state.strategy.steps
      .map(
        (s, i) =>
          `${i + 1}. ${s.step}\n   Why it matters: ${s.why}\n   When to do it: ${s.when}`,
      )
      .join('\n\n');
    sections.push(`Next steps:\n${numbered}`);
  }
  if (state.strategy?.whatToFileNext) {
    sections.push(
      `What staff or an attorney can file next on your behalf:\n- ${state.strategy.whatToFileNext}`,
    );
  }
  if (state.strategy?.whatToBring?.length) {
    sections.push(`What to bring to the Eviction Help Desk:\n- ${state.strategy.whatToBring.join('\n- ')}`);
  }

  const citationLines = (state.research?.citations ?? []).slice(0, 6).map((c) =>
    c.locator ? `- ${c.source} (${c.locator})` : `- ${c.source}`,
  );
  if (citationLines.length > 0) {
    sections.push(`Source basis:\n- Rhode Island Landlord-Tenant Handbook\n${citationLines.join('\n')}`);
  } else if (state.research?.ragMatchCount) {
    sections.push(
      `Source basis:\n- Rhode Island Landlord-Tenant Handbook\n- Retrieved Rhode Island materials (${state.research.ragMatchCount} match${state.research.ragMatchCount === 1 ? '' : 'es'})`,
    );
  } else {
    sections.push(`Source basis:\n- Rhode Island Landlord-Tenant Handbook\n- Eviction Help Desk Intake Form`);
  }

  if (state.analysis?.openQuestions?.length) {
    sections.push(`Open questions for staff:\n- ${state.analysis.openQuestions.join('\n- ')}`);
  }

  sections.push(`Staff review note:\n${STAFF_REVIEW}`);

  return sections.join('\n\n').trim();
}

export async function safetyAgent(state: LawFirmState): Promise<LawFirmUpdate> {
  const log = createLogger(state.requestId);
  const startedAt = Date.now();
  log.info('agent.safety.start', {
    feature: 'agents',
    agent: 'safety',
    intent: state.intent,
    mode: state.mode,
    has_draft: !!state.draft,
    has_strategy: !!state.strategy,
    has_analysis: !!state.analysis,
  });

  let composed: string;
  try {
    composed = compose(state);
    if (!composed || composed.trim().length === 0) {
      throw new Error('empty_compose');
    }
  } catch {
    const safety: SafetySlice = {
      decision: 'replaced',
      notes: ['compose_failed'],
      redactions: 0,
    };
    const finalMessage = intentFallback(state.intent, 'llm_unavailable');
    log.warn('agent.safety.decision', {
      feature: 'agents',
      agent: 'safety',
      intent: state.intent,
      decision: safety.decision,
      notes_count: safety.notes.length,
      redactions: safety.redactions,
    });
    log.info('agent.safety.end', {
      feature: 'agents',
      agent: 'safety',
      intent: state.intent,
      mode: state.mode,
      duration_ms: Date.now() - startedAt,
      outcome: 'degraded',
      decision: safety.decision,
    });
    return { safety, finalMessage, degraded: true, degradation: { llm: true } };
  }

  const ragBlock = state.research?.ragBlock || '';
  const citationLocators = (state.research?.citations ?? []).flatMap((c) =>
    [c.source, c.locator ?? ''].filter(Boolean),
  );
  /**
   * Pull every text surface from CourtListener results into the
   * invented-citation haystack so legitimate case-law citations (e.g. the
   * RI Gen Laws section quoted in a CourtListener opinion) are NOT
   * stripped. Mirrors the Research agent's `caseLaw` projection.
   */
  const courtListenerExtras = (state.research?.caseLaw ?? []).flatMap((c) =>
    [c.title, c.citation ?? '', c.url ?? '', c.summary ?? '', c.court ?? ''].filter(Boolean),
  );
  const notes: string[] = [];

  const certaintyHits = findCertaintyHits(composed);
  if (certaintyHits.length > 0) notes.push(`certainty:${certaintyHits.length}`);

  const adviceClaimHits = findLegalAdviceClaimHits(composed);
  if (adviceClaimHits.length > 0) notes.push(`legal_advice_claim:${adviceClaimHits.length}`);

  /**
   * Court-filing detection runs on TWO different surfaces with different
   * sensitivities:
   *
   * 1. Document body: strict — any court-filing verb is a violation, since
   *    the Document agent must never produce a filing.
   *
   * 2. Strategy outputs: looser — the strategist is intentionally allowed to
   *    mention filings as STAFF actions ("Staff can prepare and file an
   *    answer to the eviction complaint"). We only flag the unsafe pattern:
   *    second-person directives that tell the user to file/draft/sign a
   *    court document themselves ("you should file...", "you must draft...").
   */
  const draftFilingHits = state.draft ? findFilingHits(state.draft.body) : [];
  const strategyText = [
    state.strategy?.whatToFileNext ?? '',
    ...(state.strategy?.steps?.map((s) => `${s.step} ${s.why} ${s.when}`) ?? []),
  ].join('\n');
  const strategyUserFilingHits =
    strategyText.trim().length > 0 ? findUserAsFilerHits(strategyText) : [];
  const filingHits = [...draftFilingHits, ...strategyUserFilingHits];
  if (filingHits.length > 0) notes.push(`court_filing:${filingHits.length}`);

  const invented = findInventedCitations(
    composed,
    ragBlock,
    citationLocators,
    courtListenerExtras,
  );
  if (invented.length > 0) notes.push(`invented_citations:${invented.length}`);

  let finalMessage = composed;

  if (filingHits.length > 0) {
    finalMessage = finalMessage.replace(
      /Draft \([^)]*\)[^\n]*\n\n[\s\S]*?(?=\n\nNext steps:|\n\nSource basis:|\n\nStaff review note:|$)/,
      `Draft skipped:\nThe assistant detected language that looks like a court filing. SmartProBono Lite never drafts court filings. Please bring your situation to the Eviction Help Desk for staff or attorney review.${STAFF_REVIEW_MARKER}\n\n`,
    );
  }

  if (invented.length > 0) {
    finalMessage = stripInventedCitations(finalMessage, invented);
  }

  if (certaintyHits.length > 0) {
    for (const re of CERTAINTY_PATTERNS) {
      finalMessage = finalMessage.replace(
        re,
        '[Removed: this tool cannot predict legal outcomes. Please ask staff.]',
      );
    }
  }

  if (adviceClaimHits.length > 0) {
    finalMessage = stripLegalAdviceClaims(finalMessage);
  }

  const { text: scrubbed, redactions } = scrubPii(finalMessage);
  finalMessage = scrubbed;

  // "Disclaimers are included" — final guarantee, regardless of decision.
  const ensured = ensureDisclaimer(finalMessage);
  finalMessage = ensured.text;
  if (ensured.appended) notes.push('disclaimer_appended:1');

  let decision: SafetySlice['decision'] = 'pass';
  if (notes.length > 0 || redactions > 0) {
    decision = 'softened';
    if (!finalMessage.includes('[STAFF_REVIEW]')) {
      finalMessage = `${finalMessage}${STAFF_REVIEW_MARKER}${STAFF_REVIEW}`;
    }
  }

  const safety: SafetySlice = {
    decision,
    notes,
    redactions,
  };

  log.warn('agent.safety.decision', {
    feature: 'agents',
    agent: 'safety',
    intent: state.intent,
    decision,
    notes_count: notes.length,
    redactions,
  });
  log.info('agent.safety.end', {
    feature: 'agents',
    agent: 'safety',
    intent: state.intent,
    mode: state.mode,
    duration_ms: Date.now() - startedAt,
    outcome: decision === 'pass' ? 'ok' : 'degraded',
    decision,
  });

  return { safety, finalMessage };
}
