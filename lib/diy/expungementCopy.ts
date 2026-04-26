/** Static, non-jurisdictional prep guidance — always pair with UI disclaimers. */

export const GENERAL_NEXT_STEPS = [
  'Confirm the correct court or agency that holds your records (state court, municipal, or a central repository).',
  'Gather identifiers: full legal name at the time of the case, date of birth, and case numbers if you have them.',
  'Obtain certified copies of disposition or docket sheets if your court or legal aid asks for them.',
  'Ask whether your state uses terms like expungement, sealing, set-aside, or pardon — procedures differ.',
];

export const QUESTIONS_FOR_CLERK_OR_AID = [
  'Which forms does this court accept for clearing or sealing a record?',
  'Are there filing fees, and is there a fee waiver for low-income filers?',
  'How long does the process usually take, and will a hearing be required?',
  'If I am not eligible now, when might I become eligible?',
];

export function buildExpungementPrepSummary(data: {
  state: string;
  recordDescription: string;
  recordKind: string;
  disposition: string;
  yearRough: string;
  documentsHave: string;
  goals: string;
  notes: string;
}): string {
  const lines = [
    '--- Expungement / record-clearing prep summary (informational) ---',
    `State or area of focus: ${data.state || 'Not specified'}`,
    `What the user describes: ${data.recordDescription || '—'}`,
    `Rough category: ${data.recordKind}`,
    `Disposition / outcome (as user understands it): ${data.disposition || '—'}`,
    `Approximate timing: ${data.yearRough || '—'}`,
    `Documents the user believes they have: ${data.documentsHave || '—'}`,
    `Goals: ${data.goals || '—'}`,
    `Other notes: ${data.notes || '—'}`,
    '',
    'Likely next steps (general — verify locally):',
    ...GENERAL_NEXT_STEPS.map((s, i) => `${i + 1}. ${s}`),
    '',
    'Questions to ask a clerk or legal aid:',
    ...QUESTIONS_FOR_CLERK_OR_AID.map((s, i) => `${i + 1}. ${s}`),
    '',
    'Disclaimer: This summary is for preparation only. Eligibility depends on state law and the facts of each case.',
  ];
  return lines.join('\n');
}
