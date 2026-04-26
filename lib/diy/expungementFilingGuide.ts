/**
 * Generic, jurisdiction-agnostic filing-prep bullets for Pro expungement UX.
 * Not legal advice — users must verify with local court or legal aid.
 */
export const EXPUNGEMENT_FILING_GUIDE_SECTIONS = [
  {
    title: 'Confirm where to file',
    bullets: [
      'Identify the court or agency that handles record clearance or sealing in your state (often state court or a central repository).',
      'Ask whether your situation is called expungement, sealing, set-aside, or another term.',
    ],
  },
  {
    title: 'Gather core documents',
    bullets: [
      'Government-issued ID',
      'Docket or case numbers if you have them',
      'Disposition records or certificates when available',
    ],
  },
  {
    title: 'Before you go',
    bullets: [
      'Write down deadlines or hearing dates from any paperwork you received.',
      'Bring a list of questions for the clerk or legal aid (fees, timelines, forms).',
    ],
  },
] as const;

export function formatExpungementFilingGuide(): string {
  const lines = [
    'Step-by-step filing prep (informational only — verify locally)',
    '',
    ...EXPUNGEMENT_FILING_GUIDE_SECTIONS.flatMap((s) => [`## ${s.title}`, ...s.bullets.map((b) => `• ${b}`), '']),
  ];
  return lines.join('\n').trim();
}
