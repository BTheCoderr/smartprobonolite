/**
 * Intent-specific fallback responses for the Rhode Island Eviction Assistant.
 *
 * Used when the LLM is unavailable, missing, or skipped (e.g., greetings).
 * All fallbacks:
 *   - never invent statutes, deadlines, or case outcomes
 *   - cite only Rhode Island materials we actually ship
 *   - end with a staff-review disclaimer
 *   - avoid attorney-style "you should win / you have a case" language
 */

import type { ChatIntent } from '@/lib/chat/intent';

export type FallbackReason =
  | 'llm_unavailable'
  | 'circuit_open'
  | 'no_provider'
  | 'greeting_skipped'
  | 'file_review_skipped'
  | 'capability_skipped';

const STAFF_REVIEW =
  'Eviction Help Desk staff or an attorney should review your situation before you rely on next steps.';

const SOURCE_BASIS_BLOCK = `Source basis:
- Rhode Island Landlord-Tenant Handbook
- Eviction Help Desk Intake Form`;

function structured(parts: {
  explanation: string;
  nextSteps: string[];
  sources?: boolean;
}): string {
  const stepsBlock = parts.nextSteps.map((s) => `- ${s}`).join('\n');
  return [
    'Explanation:',
    parts.explanation,
    '',
    'Next steps:',
    stepsBlock,
    '',
    parts.sources === false ? '' : SOURCE_BASIS_BLOCK,
    parts.sources === false ? '' : '',
    'Staff review note:',
    STAFF_REVIEW,
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n')
    .trim();
}

const GREETING = `Hi, I'm Ermi — SmartProBono's Rhode Island eviction assistant. I can help you with things like:
- Understanding an eviction or demand notice you received
- What landlords can and can't do (for example, lockouts or shut-offs)
- What to bring to the Eviction Help Desk
- Reviewing a file or letter you uploaded

What's going on with your housing situation?

${STAFF_REVIEW}`;

const FILE_REVIEW_NO_UPLOAD = `I can help you walk through a file, but I don't see anything attached yet. To review your document:

- Upload a PDF, image, or text file using the Dashboard upload tool, or paste the relevant text into the chat.
- I can look for: the kind of notice it is, who sent it, what it asks the tenant to do, any deadlines listed, and what information is missing.
- Please don't paste full Social Security numbers, bank account numbers, or other financial account numbers — they aren't needed.

${STAFF_REVIEW}`;

const FILE_REVIEW_LLM_DOWN = structured({
  explanation:
    "I received your document or message, but Ermi's full response service isn't available right now. You can still use the information below while you wait to try again or speak with staff.",
  nextSteps: [
    'Save a copy of what you uploaded or pasted.',
    'Bring the document and any notices to the Eviction Help Desk for staff review.',
    'If something is urgent (for example, a lockout or a court date soon), say so when you call or visit.',
  ],
});

const CAPABILITIES = `I'm Ermi — SmartProBono's Rhode Island eviction assistant. Here's what I can help with in this tool:

- Explain in plain language what a **notice** from a landlord might mean and what to look for on the page (I don't replace staff or an attorney).
- Talk through **lockouts, utility shutoffs, and "self-help"** concerns at a high level and what usually belongs in court.
- Suggest **what to bring to the Eviction Help Desk** so your visit is as useful as possible.
- Walk through a **file or pasted text** if you upload or paste it (please don't paste full SSNs or bank account numbers).

I'm not a lawyer: I don't give legal advice, predict outcomes, or tell you what a judge will do. Use Rhode Island materials we cite as a starting point, then get staff or attorney review.

Try asking something concrete, for example: "What does a 5-day notice mean?" or "Can my landlord change the locks?"

${STAFF_REVIEW}`;

const UNKNOWN = `I need a bit more detail to give a useful answer. I can help with Rhode Island eviction questions like:

- What a notice from your landlord means
- Whether your landlord can change the locks or shut off utilities
- What to bring to the Eviction Help Desk
- Reviewing a document you upload

Could you share one concrete thing — for example, did you get a paper from your landlord, or is something happening with your housing right now?

${STAFF_REVIEW}`;

const LOCKOUT = structured({
  explanation:
    "In Rhode Island, a landlord generally cannot evict a tenant by changing the locks, removing belongings, or shutting off utilities like heat, water, or electricity. To remove a tenant, the landlord usually has to follow the court eviction process and get an order from the court. A landlord doing those things on their own — sometimes called \"self-help\" — is generally not allowed, even if rent is owed.",
  nextSteps: [
    'If you are locked out right now and unsafe, call 911 — police can sometimes help with an immediate safety issue.',
    "Document what happened: take photos, save messages, and write down dates and times.",
    'Contact the Rhode Island Eviction Help Desk or Rhode Island Legal Services as soon as possible.',
    'Bring any lease, notices, payment records, and communications with your landlord to staff review.',
  ],
});

const NOTICE = structured({
  explanation:
    "In Rhode Island, landlords typically have to give a written notice before they can take a tenant to eviction court. The kind of notice and the time it gives you depend on the reason — for example, a demand notice for unpaid rent works differently from a notice based on a lease violation or end of tenancy. Read the notice carefully: the dates, the reason, and exactly what it says you must do are what matter most.",
  nextSteps: [
    'Save the original notice and the envelope it came in if you have it.',
    'Check the date the notice was given, the reason listed, and any deadline it gives you to act.',
    'If the notice is about unpaid rent, gather your rent payment records (receipts, bank statements, money order stubs).',
    'Bring the notice and your records to the Eviction Help Desk or to Rhode Island Legal Services for review before any deadline passes.',
  ],
});

const HELP_DESK = structured({
  explanation:
    "The Eviction Help Desk can review your situation and help you understand your options, but it works best when you bring everything you have. The more complete your paperwork, the more useful the staff review will be.",
  nextSteps: [
    'The eviction or demand notice you received (and the envelope, if you have it).',
    'Your lease or rental agreement, if you have one in writing.',
    'Records of rent payments — receipts, bank statements, money order stubs.',
    'Texts, emails, or letters between you and your landlord about the issue.',
    'Photo ID for yourself.',
    'Any subsidy paperwork (Section 8, RIHousing, etc.) and your housing worker contact, if you have a subsidy.',
    'A short written timeline of what happened and when, in your own words.',
  ],
});

const INTAKE_SUMMARY = structured({
  explanation:
    "I can see the intake you completed earlier in this session. I'll work from that to help you understand your situation, but I won't repeat sensitive details out loud. If anything in your intake has changed (for example, you got a new notice, or you paid some rent), please mention it so I can factor that in.",
  nextSteps: [
    'Tell me one thing you most want help with right now (a notice, a lockout, what to bring, etc.).',
    'Mention any new documents you received since you completed the intake.',
    'Plan to bring your intake answers and any notices to the Eviction Help Desk for staff review.',
  ],
});

export function intentFallback(intent: ChatIntent, reason: FallbackReason): string {
  switch (intent) {
    case 'greeting':
      return GREETING;
    case 'assistant_capabilities':
      return CAPABILITIES;
    case 'file_review':
      if (reason === 'file_review_skipped') return FILE_REVIEW_NO_UPLOAD;
      return FILE_REVIEW_LLM_DOWN;
    case 'lockout':
      return LOCKOUT;
    case 'notice_explanation':
      return NOTICE;
    case 'help_desk_prep':
      return HELP_DESK;
    case 'intake_summary':
      return INTAKE_SUMMARY;
    case 'unknown':
    default:
      return UNKNOWN;
  }
}
