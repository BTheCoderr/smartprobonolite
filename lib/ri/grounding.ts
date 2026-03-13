import type { GuidanceResult, IntakeData } from './types';
import { deriveEligibilitySignals, deriveIssueFlags } from './tagging';
import { getMaterialsForGrounding } from './storage';
import { getHandoutSectionsForCategory } from './rilsHandoutContent';

function normalizeText(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function excerptAround(text: string, idx: number, radius = 180) {
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + radius);
  let snippet = text.slice(start, end);
  snippet = snippet.replace(/\s+/g, ' ').trim();
  if (start > 0) snippet = '…' + snippet;
  if (end < text.length) snippet = snippet + '…';
  return snippet;
}

function findGroundingQuotes(queryTerms: string[]): Array<{ sourceTitle: string; quote: string }> {
  const materials = getMaterialsForGrounding();
  if (materials.length === 0) return [];

  const results: Array<{ score: number; sourceTitle: string; quote: string }> = [];
  for (const m of materials) {
    const hay = normalizeText(m.extractedText);
    for (const term of queryTerms) {
      const needle = normalizeText(term);
      const idx = hay.indexOf(needle);
      if (idx >= 0) {
        results.push({
          score: needle.length,
          sourceTitle: m.title,
          quote: excerptAround(m.extractedText, idx),
        });
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ sourceTitle, quote }) => ({ sourceTitle, quote }));
}

export function buildGuidance(intake: IntakeData): GuidanceResult {
  const eligibility = deriveEligibilitySignals(intake);
  const issueFlags = deriveIssueFlags(intake);

  const categoryLabel =
    eligibility.likelyCategory === 'nonpayment'
      ? 'Nonpayment / rent arrears'
      : eligibility.likelyCategory === 'noncompliance'
        ? 'Lease violation / noncompliance'
        : eligibility.likelyCategory === 'termination_of_tenancy'
          ? 'Termination of tenancy'
          : 'Unclear (needs staff review)';

  const immediateNextSteps: string[] = [
    'Bring any eviction notice, payment records, and communication with your landlord when meeting with the Eviction Help Desk or appearing in District Court.',
    'Do not ignore court papers. If you have a court date, plan to attend.',
  ];

  if (issueFlags.urgentCourtDate) {
    immediateNextSteps.unshift('Your court date may be soon. Seek help right away if possible.');
  }
  if (issueFlags.languageAccess) {
    immediateNextSteps.push('If you need an interpreter, ask for language assistance as early as possible.');
  }
  if (issueFlags.possibleSubsidy) {
    immediateNextSteps.push('If you have a housing subsidy, bring any subsidy paperwork and contact info for your worker.');
  }

  const gatherDocuments: string[] = [
    'Any eviction notice or written demand for rent',
    'Court papers or summons from District Court',
    'Rent payment records or receipts',
    'Lease agreement or rental agreement',
    'Photos or documentation of housing conditions (if relevant)',
    'Any written communication with the landlord',
  ];

  const beReadyToAnswer: string[] = [
    'When the eviction notice was received',
    'How much rent is currently owed',
    'Whether rent assistance has been requested',
    'Whether there are housing condition concerns',
    'Whether a court date has already been scheduled',
  ];

  if (issueFlags.possibleRetaliation) {
    beReadyToAnswer.push('Whether anything happened shortly before the notice (complaints, repair requests, organizing, code call)');
  }
  if (issueFlags.dvSafety) {
    beReadyToAnswer.push('Whether there are safety concerns that affect housing or communications');
  }

  const summaryPlainLanguageParts: string[] = [];
  summaryPlainLanguageParts.push(`You reported an eviction-related problem in Rhode Island.`);
  if (intake.address || intake.city) {
    summaryPlainLanguageParts.push(
      `Housing: ${[intake.address, intake.city].filter(Boolean).join(', ')}`.trim()
    );
  }
  summaryPlainLanguageParts.push(`Likely category: ${categoryLabel}.`);
  if (intake.noticeReceived === 'yes') {
    summaryPlainLanguageParts.push(`You said you received a notice (${intake.noticeType}).`);
  } else if (intake.noticeReceived === 'no') {
    summaryPlainLanguageParts.push(`You said you have not received a notice (or you are unsure).`);
  }
  if (intake.behindOnRent === 'yes') {
    summaryPlainLanguageParts.push(`You indicated you may be behind on rent.`);
  }
  if (intake.unsafeConditions === 'yes') {
    summaryPlainLanguageParts.push(`You also reported possible unsafe housing conditions.`);
  }

  const queryTerms = [
    'eviction',
    'notice',
    eligibility.likelyCategory === 'nonpayment' ? 'rent' : '',
    issueFlags.unsafeConditions ? 'repairs' : '',
    issueFlags.possibleSubsidy ? 'voucher' : '',
  ].filter(Boolean);

  const citations = findGroundingQuotes(queryTerms);

  const handoutSections = getHandoutSectionsForCategory(eligibility.likelyCategory).map((s) => ({
    title: s.title,
    summary: s.summary,
    bullets: s.keyPoints,
    sourceNote: s.sourceNote,
  }));

  return {
    summaryPlainLanguage: summaryPlainLanguageParts.join(' '),
    likelyCategory: eligibility.likelyCategory,
    immediateNextSteps,
    gatherDocuments,
    beReadyToAnswer,
    issueFlags,
    eligibility,
    citations,
    handoutSections,
  };
}

