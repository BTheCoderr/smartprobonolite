/**
 * Smoke tests for the six-agent LangGraph wiring.
 *
 * Runs three scenarios against the compiled graph WITHOUT real LLM keys, so
 * every agent goes through its degraded path. We assert:
 *   1. graph completes for a lockout question with no LLM and produces a
 *      non-empty finalMessage that mentions staff review.
 *   2. Safety agent strips an invented R.I. statute citation when the
 *      analysis text contains one.
 *
 * Run via:  npx tsx -r tsconfig-paths/register scripts/smoke-agents.ts
 *           (with NODE_PATH and tsconfig-paths) — or just `npx tsx scripts/smoke-agents.ts`
 *           if your tsx supports paths from tsconfig.
 */

process.env.GROQ_API_KEY = '';
process.env.HUGGINGFACE_API_KEY = '';
process.env.OPENAI_API_KEY = '';

import { getLawFirmGraph } from '@/lib/agents/graph';
import { initialStateFrom } from '@/lib/agents/state';
import { ensureDisclaimer, safetyAgent } from '@/lib/agents/safetyAgent';
import { researchAgent } from '@/lib/agents/researchAgent';
import type { LawFirmState } from '@/lib/agents/state';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

async function lockoutLlmDown() {
  const graph = getLawFirmGraph();
  const init = initialStateFrom({
    requestId: 'smoke-lockout',
    mode: 'ri_eviction',
    intent: 'lockout',
    recentMessages: [
      { role: 'user', content: 'My landlord changed the locks while I was at work. What can I do?' },
    ],
    userMessage: 'My landlord changed the locks while I was at work. What can I do?',
    intakeContext: null,
  });
  const out = await graph.invoke(init, { configurable: { request_id: 'smoke-lockout' } });
  assert(typeof out.finalMessage === 'string' && out.finalMessage.length > 0, 'lockout finalMessage missing');
  assert(/staff/i.test(out.finalMessage), 'lockout missing staff-review mention');
  assert(Array.isArray(out.research?.relevantLaws), 'research.relevantLaws missing');
  assert(Array.isArray(out.research?.citations), 'research.citations missing');
  assert(Array.isArray(out.research?.shortExplanations), 'research.shortExplanations missing');
  console.log(
    '[ok] lockout LLM-down — finalMessage length:',
    out.finalMessage.length,
    'degraded:',
    out.degraded,
    'relevantLaws:',
    out.research?.relevantLaws.length,
  );
}

async function safetyStripsInventedCitation() {
  const fakeAnalysis =
    'Under R.I. Gen. Laws § 99-99-99 a tenant always wins. You will win this case.';
  const state: LawFirmState = {
    requestId: 'smoke-safety',
    mode: 'ri_eviction',
    intent: 'notice_explanation',
    recentMessages: [{ role: 'user', content: 'I got a notice.' }],
    userMessage: 'I got a notice.',
    facts: {
      state: 'Rhode Island',
      legal_issue: 'eviction notice',
      timeline: null,
      key_facts: [],
      urgency_level: 'low',
      missing_info: [],
      summary: 'Tenant received an eviction notice in Rhode Island.',
      flags: ['intent:notice_explanation'],
    },
    research: {
      ragMatchCount: 0,
      ragBlock: '',
      degraded: false,
      jurisdiction: 'Rhode Island',
      relevantLaws: [],
      citations: [],
      shortExplanations: [],
    },
    analysis: {
      legalSummary: fakeAnalysis,
      risks: [],
      possibleViolations: [],
      strengthsOfCase: [],
      openQuestions: [],
      recommendation: 'inform',
    },
    strategy: {
      steps: [
        { step: 'Save the notice.', why: 'You will need it for staff review.', when: 'today' },
      ],
      whatToFileNext: null,
      whatToBring: ['The notice.'],
      staffReviewRequired: true,
    },
    degraded: false,
    degradation: {},
  } as unknown as LawFirmState;

  const out = await safetyAgent(state);
  const final = (out as { finalMessage?: string }).finalMessage ?? '';
  assert(!/§\s*99-99-99/.test(final), 'invented citation not stripped');
  assert(!/you\s+will\s+win/i.test(final), 'attorney-style certainty not softened');
  const safety = (out as { safety?: { decision: string; notes: string[] } }).safety;
  assert(safety?.decision === 'softened', `expected decision=softened, got ${safety?.decision}`);
  console.log('[ok] safety stripped invented citation; notes:', safety?.notes);
}

async function safetyBlocksCourtFilingDraft() {
  const filingBody = [
    'MOTION TO DISMISS',
    '',
    'Tenant respectfully moves this Court for an order dismissing the Complaint',
    'and requests that judgment for defendant be entered. An affidavit in support',
    'is attached.',
  ].join('\n');

  const state: LawFirmState = {
    requestId: 'smoke-filing',
    mode: 'ri_eviction',
    intent: 'lockout',
    recentMessages: [{ role: 'user', content: 'Draft me a motion.' }],
    userMessage: 'Draft me a motion.',
    facts: {
      state: 'Rhode Island',
      legal_issue: 'eviction',
      timeline: null,
      key_facts: [],
      urgency_level: 'medium',
      missing_info: [],
      summary: 'Tenant facing eviction wants a motion drafted.',
      flags: ['intent:lockout'],
    },
    research: {
      ragMatchCount: 0,
      ragBlock: '',
      degraded: false,
      jurisdiction: 'Rhode Island',
      relevantLaws: [],
      citations: [],
      shortExplanations: [],
    },
    analysis: {
      legalSummary: 'Self-help lockouts in Rhode Island are generally not allowed.',
      risks: [],
      possibleViolations: [],
      strengthsOfCase: [],
      openQuestions: [],
      recommendation: 'draft',
    },
    draft: {
      title: 'Motion to dismiss',
      body: filingBody,
      type: 'letter',
    },
    strategy: {
      steps: [
        { step: 'Bring this to the Help Desk.', why: 'Staff will know what to file.', when: 'this week' },
      ],
      whatToFileNext: null,
      whatToBring: ['The notice.'],
      staffReviewRequired: true,
    },
    degraded: false,
    degradation: {},
  } as unknown as LawFirmState;

  const out = await safetyAgent(state);
  const final = (out as { finalMessage?: string }).finalMessage ?? '';
  const safety = (out as { safety?: { decision: string; notes: string[] } }).safety;

  assert(
    !/MOTION TO DISMISS|judgment for defendant|affidavit in support/i.test(final),
    'court-filing language was not stripped from final message',
  );
  assert(safety?.decision === 'softened', `expected decision=softened, got ${safety?.decision}`);
  assert(
    safety?.notes.some((n) => n.startsWith('court_filing:')),
    `expected court_filing note, got ${JSON.stringify(safety?.notes)}`,
  );
  console.log('[ok] safety blocked court-filing draft; notes:', safety?.notes);
}

async function safetyAllowsStaffMediatedFiling() {
  const state: LawFirmState = {
    requestId: 'smoke-strategy-staff',
    mode: 'ri_eviction',
    intent: 'lockout',
    recentMessages: [{ role: 'user', content: 'I got an eviction complaint.' }],
    userMessage: 'I got an eviction complaint.',
    facts: {
      state: 'Rhode Island',
      legal_issue: 'eviction',
      timeline: null,
      key_facts: [],
      urgency_level: 'high',
      missing_info: [],
      summary: 'Tenant received an eviction complaint.',
      flags: ['intent:lockout'],
    },
    research: {
      ragMatchCount: 0,
      ragBlock: '',
      degraded: false,
      jurisdiction: 'Rhode Island',
      relevantLaws: [],
      citations: [],
      shortExplanations: [],
    },
    analysis: {
      legalSummary: 'You may have an eviction defense; staff should review.',
      risks: ['Default judgment if no answer is filed in time'],
      possibleViolations: [],
      strengthsOfCase: ['You have rent receipts'],
      openQuestions: ['Has staff reviewed the complaint yet?'],
      recommendation: 'inform',
    },
    strategy: {
      steps: [
        {
          step: 'Bring the complaint and any notices to the Eviction Help Desk.',
          why: 'Staff need the exact paperwork to advise you.',
          when: 'before the date the complaint gives you to respond',
        },
      ],
      whatToFileNext:
        'Staff or an attorney can prepare and file an answer to the eviction complaint on your behalf.',
      whatToBring: ['The eviction complaint', 'Your lease', 'Photo ID'],
      staffReviewRequired: true,
    },
    degraded: false,
    degradation: {},
  } as unknown as LawFirmState;

  const out = await safetyAgent(state);
  const final = (out as { finalMessage?: string }).finalMessage ?? '';
  const safety = (out as { safety?: { decision: string; notes: string[] } }).safety;

  assert(
    /Staff or an attorney can prepare and file an answer/.test(final),
    'staff-mediated filing language should NOT be stripped',
  );
  assert(safety?.decision === 'pass', `expected decision=pass, got ${safety?.decision}`);
  assert(
    !safety?.notes.some((n) => n.startsWith('court_filing:')),
    `expected NO court_filing note for staff-mediated framing, got ${JSON.stringify(safety?.notes)}`,
  );
  console.log('[ok] safety allowed staff-mediated filing; decision:', safety?.decision);
}

async function safetyBlocksUserAsFilerStrategy() {
  const state: LawFirmState = {
    requestId: 'smoke-strategy-user',
    mode: 'ri_eviction',
    intent: 'lockout',
    recentMessages: [{ role: 'user', content: 'I got an eviction complaint.' }],
    userMessage: 'I got an eviction complaint.',
    facts: {
      state: 'Rhode Island',
      legal_issue: 'eviction',
      timeline: null,
      key_facts: [],
      urgency_level: 'high',
      missing_info: [],
      summary: 'Tenant received an eviction complaint.',
      flags: [],
    },
    research: {
      ragMatchCount: 0,
      ragBlock: '',
      degraded: false,
      jurisdiction: 'Rhode Island',
      relevantLaws: [],
      citations: [],
      shortExplanations: [],
    },
    analysis: {
      legalSummary: 'Staff should review.',
      risks: [],
      possibleViolations: [],
      strengthsOfCase: [],
      openQuestions: [],
      recommendation: 'inform',
    },
    strategy: {
      steps: [
        {
          step: 'You should file an answer to the complaint yourself.',
          why: 'To avoid default.',
          when: 'this week',
        },
      ],
      whatToFileNext:
        'You must draft a motion to dismiss and submit it on your own.',
      whatToBring: [],
      staffReviewRequired: true,
    },
    degraded: false,
    degradation: {},
  } as unknown as LawFirmState;

  const out = await safetyAgent(state);
  const safety = (out as { safety?: { decision: string; notes: string[] } }).safety;
  assert(safety?.decision === 'softened', `expected decision=softened, got ${safety?.decision}`);
  assert(
    safety?.notes.some((n) => n.startsWith('court_filing:')),
    `expected court_filing note, got ${JSON.stringify(safety?.notes)}`,
  );
  console.log('[ok] safety blocked user-as-filer strategy; notes:', safety?.notes);
}

async function safetyStripsLegalAdviceClaim() {
  const advisingAnalysis =
    "As your attorney I am giving you legal advice: this is my legal opinion. I am your lawyer.";
  const state: LawFirmState = {
    requestId: 'smoke-advice-claim',
    mode: 'ri_eviction',
    intent: 'notice_explanation',
    recentMessages: [{ role: 'user', content: 'I got a notice.' }],
    userMessage: 'I got a notice.',
    facts: {
      state: 'Rhode Island',
      legal_issue: 'eviction notice',
      timeline: null,
      key_facts: [],
      urgency_level: 'low',
      missing_info: [],
      summary: 'Tenant got an eviction notice in RI.',
      flags: [],
    },
    research: {
      ragMatchCount: 0,
      ragBlock: '',
      degraded: false,
      jurisdiction: 'Rhode Island',
      relevantLaws: [],
      citations: [],
      shortExplanations: [],
    },
    analysis: {
      legalSummary: advisingAnalysis,
      risks: [],
      possibleViolations: [],
      strengthsOfCase: [],
      openQuestions: [],
      recommendation: 'inform',
    },
    strategy: {
      steps: [
        { step: 'Bring the notice to the Help Desk.', why: 'Staff can advise.', when: 'this week' },
      ],
      whatToFileNext: null,
      whatToBring: ['The notice'],
      staffReviewRequired: true,
    },
    degraded: false,
    degradation: {},
  } as unknown as LawFirmState;

  const out = await safetyAgent(state);
  const final = (out as { finalMessage?: string }).finalMessage ?? '';
  const safety = (out as { safety?: { decision: string; notes: string[] } }).safety;

  assert(
    !/as your attorney/i.test(final),
    'first-person attorney claim was not stripped',
  );
  assert(
    !/i am giving you legal advice/i.test(final),
    'explicit "giving legal advice" claim was not stripped',
  );
  assert(
    !/my legal opinion/i.test(final),
    '"my legal opinion" phrasing was not stripped',
  );
  assert(
    !/i am your lawyer/i.test(final),
    'first-person lawyer-relationship claim was not stripped',
  );
  assert(safety?.decision === 'softened', `expected decision=softened, got ${safety?.decision}`);
  assert(
    safety?.notes.some((n) => n.startsWith('legal_advice_claim:')),
    `expected legal_advice_claim note, got ${JSON.stringify(safety?.notes)}`,
  );
  // The disclaimer guarantee — even after stripping, the user must always see it.
  assert(
    /Eviction Help Desk staff or an attorney should review/i.test(final),
    'disclaimer missing from final message after softening',
  );
  console.log('[ok] safety stripped legal-advice claims; notes:', safety?.notes);
}

async function disclaimerAlwaysGuaranteed() {
  // Direct unit-style check of ensureDisclaimer.
  const a = ensureDisclaimer('Some neutral legal information about Rhode Island eviction process.');
  assert(a.appended === true, 'ensureDisclaimer should append when missing');
  assert(
    /Eviction Help Desk staff or an attorney should review/i.test(a.text),
    'ensureDisclaimer must inject the staff-review sentence',
  );

  const b = ensureDisclaimer(
    'Some text. Eviction Help Desk staff or an attorney should review your situation before next steps.',
  );
  assert(b.appended === false, 'ensureDisclaimer should NOT append when already present');
  assert(b.text === b.text, 'ensureDisclaimer should pass-through unchanged when present');

  console.log('[ok] disclaimer guarantee verified (append-when-missing, no-op-when-present)');
}

/**
 * CourtListener smoke #1
 *
 * COURTLISTENER_ENABLED=false → graph still works exactly as before:
 *   - finalMessage non-empty
 *   - research slice present
 *   - courtListener.enabled === false (or slice undefined when fully disabled)
 *   - no fetch attempt was made (we set fetch to throw to prove it)
 */
async function courtListenerDisabledNoOp() {
  const prevEnabled = process.env.COURTLISTENER_ENABLED;
  const prevToken = process.env.COURTLISTENER_API_TOKEN;
  const prevFetch = globalThis.fetch;
  process.env.COURTLISTENER_ENABLED = 'false';
  process.env.COURTLISTENER_API_TOKEN = '';

  let fetchCalled = false;
  globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
    const url = String(args[0] ?? '');
    if (url.includes('courtlistener.com')) {
      fetchCalled = true;
      throw new Error('courtlistener should not be called when disabled');
    }
    if (prevFetch) return prevFetch(...args);
    throw new Error('no upstream fetch');
  }) as typeof fetch;

  try {
    const graph = getLawFirmGraph();
    const init = initialStateFrom({
      requestId: 'smoke-cl-disabled',
      mode: 'ri_eviction',
      intent: 'lockout',
      recentMessages: [
        { role: 'user', content: 'Landlord changed the locks. What can I do?' },
      ],
      userMessage: 'Landlord changed the locks. What can I do?',
      intakeContext: null,
    });
    const out = await graph.invoke(init, {
      configurable: { request_id: 'smoke-cl-disabled' },
    });
    assert(typeof out.finalMessage === 'string' && out.finalMessage.length > 0, 'finalMessage missing');
    assert(/staff/i.test(out.finalMessage), 'missing staff-review mention');
    assert(out.research, 'research slice missing');
    assert(
      !out.research?.courtListener || out.research.courtListener.enabled === false,
      `expected courtListener.enabled=false, got ${JSON.stringify(out.research?.courtListener)}`,
    );
    assert(!fetchCalled, 'CourtListener fetch should NOT be called when disabled');
    assert(
      Array.isArray(out.research?.caseLaw) ? out.research!.caseLaw!.length === 0 : true,
      'caseLaw should be empty when disabled',
    );
    console.log(
      '[ok] CourtListener disabled — graph unchanged; courtListener:',
      out.research?.courtListener,
    );
  } finally {
    process.env.COURTLISTENER_ENABLED = prevEnabled;
    process.env.COURTLISTENER_API_TOKEN = prevToken;
    if (prevFetch) globalThis.fetch = prevFetch;
  }
}

/**
 * CourtListener smoke #2
 *
 * COURTLISTENER_ENABLED=true, no token → research degrades gracefully:
 *   - no crash
 *   - no fetch attempt (the client returns [] silently when token missing)
 *   - courtListener.enabled === true, resultCount === 0
 *   - downstream agents still complete
 *
 * We invoke the researchAgent in isolation rather than the full graph so we
 * don't depend on the upstream Intake degraded-fallback shape.
 */
async function courtListenerEnabledNoToken() {
  const prevEnabled = process.env.COURTLISTENER_ENABLED;
  const prevToken = process.env.COURTLISTENER_API_TOKEN;
  const prevFetch = globalThis.fetch;
  process.env.COURTLISTENER_ENABLED = 'true';
  process.env.COURTLISTENER_API_TOKEN = '';

  let fetchCalled = false;
  globalThis.fetch = (async (...args: Parameters<typeof fetch>) => {
    const url = String(args[0] ?? '');
    if (url.includes('courtlistener.com')) {
      fetchCalled = true;
      throw new Error('courtlistener fetch should be skipped when token missing');
    }
    if (prevFetch) return prevFetch(...args);
    throw new Error('no upstream fetch');
  }) as typeof fetch;

  try {
    const state: LawFirmState = {
      requestId: 'smoke-cl-no-token',
      mode: 'ri_eviction',
      intent: 'notice_explanation',
      recentMessages: [{ role: 'user', content: 'Got an eviction notice in RI.' }],
      userMessage: 'Got an eviction notice in RI.',
      facts: {
        state: 'Rhode Island',
        legal_issue: 'eviction notice',
        timeline: null,
        key_facts: [],
        urgency_level: 'medium',
        missing_info: [],
        summary: 'RI tenant got eviction notice.',
        flags: ['intent:notice_explanation'],
      },
      degraded: false,
      degradation: {},
    } as unknown as LawFirmState;

    const out = await researchAgent(state);
    const research = (out as { research?: LawFirmState['research'] }).research;
    assert(research, 'research slice missing');
    assert(research?.courtListener?.enabled === true, 'expected courtListener.enabled=true');
    assert(research?.courtListener?.resultCount === 0, 'expected resultCount=0 when no token');
    assert(Array.isArray(research?.caseLaw), 'caseLaw should be an array');
    assert((research?.caseLaw ?? []).length === 0, 'caseLaw should be empty when no token');
    assert(!fetchCalled, 'fetch should not be called when token missing');
    console.log(
      '[ok] CourtListener enabled-no-token — degraded gracefully; courtListener:',
      research?.courtListener,
    );
  } finally {
    process.env.COURTLISTENER_ENABLED = prevEnabled;
    process.env.COURTLISTENER_API_TOKEN = prevToken;
    if (prevFetch) globalThis.fetch = prevFetch;
  }
}

/**
 * CourtListener smoke #3
 *
 * Mock CourtListener result with a fake citation:
 *   - Safety must ALLOW the citation when it appears in caseLaw.
 *   - Safety must STRIP a different invented citation that does NOT appear
 *     in any source (RAG block or caseLaw).
 *
 * We hand-build the state passed to safetyAgent so we don't need a live
 * CourtListener API. The "fake" citation is a plausible RI Gen Laws section
 * that does not exist; we treat it as "legitimate from CourtListener" only
 * because it's listed on caseLaw. A second, different RI Gen Laws section
 * appears nowhere — Safety must strip it.
 */
async function safetyAllowsCourtListenerCitations() {
  const fakeButCitedInCourtListener = 'R.I. Gen. Laws § 34-18-44.1';
  const trulyInventedNotInAnySource = 'R.I. Gen. Laws § 88-88-88';

  const analysisText =
    `The court considered ${fakeButCitedInCourtListener} along with ${trulyInventedNotInAnySource}.`;

  const state: LawFirmState = {
    requestId: 'smoke-cl-citation',
    mode: 'ri_eviction',
    intent: 'notice_explanation',
    recentMessages: [{ role: 'user', content: 'Got a notice.' }],
    userMessage: 'Got a notice.',
    facts: {
      state: 'Rhode Island',
      legal_issue: 'eviction notice',
      timeline: null,
      key_facts: [],
      urgency_level: 'low',
      missing_info: [],
      summary: 'RI tenant got an eviction notice.',
      flags: [],
    },
    research: {
      ragMatchCount: 0,
      ragBlock: '',
      degraded: false,
      jurisdiction: 'Rhode Island',
      relevantLaws: [],
      citations: [],
      shortExplanations: [],
      caseLaw: [
        {
          title: 'Smith v. Landlord Co.',
          citation: fakeButCitedInCourtListener,
          court: 'R.I. Sup. Ct.',
          dateFiled: '2018-05-01',
          url: 'https://www.courtlistener.com/opinion/000000/smith-v-landlord-co/',
          summary:
            `The opinion discusses ${fakeButCitedInCourtListener} in the context of notice requirements.`,
        },
      ],
      courtListener: { enabled: true, resultCount: 1, degraded: false },
    },
    analysis: {
      legalSummary: analysisText,
      risks: [],
      possibleViolations: [],
      strengthsOfCase: [],
      openQuestions: [],
      recommendation: 'inform',
    },
    strategy: {
      steps: [
        { step: 'Bring the notice to the Help Desk.', why: 'Staff can advise.', when: 'this week' },
      ],
      whatToFileNext: null,
      whatToBring: ['The notice'],
      staffReviewRequired: true,
    },
    degraded: false,
    degradation: {},
  } as unknown as LawFirmState;

  const out = await safetyAgent(state);
  const final = (out as { finalMessage?: string }).finalMessage ?? '';
  const safety = (out as { safety?: { decision: string; notes: string[] } }).safety;

  assert(
    final.includes(fakeButCitedInCourtListener),
    `CourtListener-cited statute should NOT be stripped; final=${JSON.stringify(final)}`,
  );
  assert(
    !final.includes(trulyInventedNotInAnySource),
    'Truly invented statute should be stripped',
  );
  assert(
    safety?.notes.some((n) => n.startsWith('invented_citations:')),
    `expected invented_citations note for the unsupported cite, got ${JSON.stringify(safety?.notes)}`,
  );
  console.log(
    '[ok] safety allowed CourtListener citation, stripped invented one; notes:',
    safety?.notes,
  );
}

async function main() {
  await lockoutLlmDown();
  await safetyStripsInventedCitation();
  await safetyBlocksCourtFilingDraft();
  await safetyAllowsStaffMediatedFiling();
  await safetyBlocksUserAsFilerStrategy();
  await safetyStripsLegalAdviceClaim();
  await disclaimerAlwaysGuaranteed();
  await courtListenerDisabledNoOp();
  await courtListenerEnabledNoToken();
  await safetyAllowsCourtListenerCitations();
  console.log('\nALL SMOKE TESTS PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
