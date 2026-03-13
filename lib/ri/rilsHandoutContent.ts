/**
 * RILS Eviction Help Desk Handout – Structured content for demo grounding
 *
 * SOURCE NOTE: The RILS Handout for EHD PDF did not extract text (scanned/image-based).
 * This content was manually transcribed/summarized from the visible handout structure
 * and cross-checked with the RI Landlord-Tenant Handbook (RI Gen. Laws Ch. 34-18).
 * Used for demo grounding only. Do not rely as legal authority.
 */

export type EvictionCategory = 'nonpayment' | 'noncompliance' | 'termination_of_tenancy';

export type RilsHandoutSection = {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  sourceNote?: string;
};

export const RILS_HANDOUT_SECTIONS: Record<EvictionCategory | 'common' | 'trial' | 'appeal', RilsHandoutSection> = {
  common: {
    id: 'common',
    title: 'Common eviction case types in Rhode Island',
    summary:
      'Eviction cases in Rhode Island fall into two main groups: evictions for nonpayment of rent, and evictions for other reasons.',
    keyPoints: [
      'Eviction for non-payment of rent: landlord claims tenant owes rent.',
      'Eviction for other reasons: noncompliance (lease violation) or termination of tenancy (landlord ending the rental, e.g. no-fault).',
      'Each type has different notice requirements and procedures.',
      'Self-help evictions (lockouts, shutting off utilities) are illegal. Only a judge can order you out.',
    ],
  },

  nonpayment: {
    id: 'nonpayment',
    title: 'Eviction for nonpayment of rent',
    summary:
      'The landlord must send a 5-day demand letter before filing in court. If you pay within that window, they must accept. If the case is filed, your right to cure may be limited.',
    keyPoints: [
      'Landlord must send a 5-day demand letter (similar to form in § 34-18-56(a)) once rent is more than 15 days late.',
      'If you pay the full rent (not late fees) within 5 days of when the letter was mailed, the landlord must accept it.',
      'If the landlord files in court before you pay, you lose the right to cure by paying. Exception: if this is the first time you fell behind in the last 6 months, you may still pay at the hearing (rent plus court costs) to avoid eviction.',
      'Eviction cases go to Rhode Island District Court in the county where the rental is located.',
      'Landlords must show compliance with the statewide rental registry (after Oct 2024) to file a nonpayment eviction.',
    ],
    sourceNote: 'RI Gen. Laws § 34-18-56(a); RI Landlord-Tenant Handbook § 12.2',
  },

  noncompliance: {
    id: 'noncompliance',
    title: 'Eviction for noncompliance (lease violation)',
    summary:
      'The landlord must send a Notice of Non-Compliance giving you 20 days to fix the problem. In some cases (drugs, violence, repeat violation) there is no right to cure.',
    keyPoints: [
      'Landlord must send a written Notice of Non-Compliance (similar to form in § 34-18-56(b)) describing the breach and what you must do to fix it.',
      'You have 20 days from the mailing date to cure. If you fix it, the rental agreement continues.',
      'No right to cure: narcotics nuisance, drug manufacturing/sale, or crime of violence at the premises. Also, if you got a noncompliance notice for the same thing in the last 6 months.',
      'If you do not cure and stay past the date in the notice, the landlord may file an eviction in District Court.',
      'Unlike nonpayment cases, you must file an Answer before the hearing.',
    ],
    sourceNote: 'RI Gen. Laws § 34-18-36; RI Landlord-Tenant Handbook § 12.3',
  },

  termination_of_tenancy: {
    id: 'termination_of_tenancy',
    title: 'Eviction after termination of tenancy (no-fault)',
    summary:
      'A landlord can end a month-to-month tenancy for any reason (or no reason) by giving proper written notice. Discriminatory or retaliatory terminations are not allowed.',
    keyPoints: [
      'Month-to-month: at least 30 days written notice before the next rent due date. The notice must specify a termination date that is the day after the end of a rental period.',
      'Week-to-week: at least 10 days notice before the next rent due date.',
      'Landlords must use a statutory form or something substantially similar (§ 34-18-56(c)).',
      'Common defenses: notice too short, wrong termination date, retaliation (e.g. complaint to code enforcement within 6 months), or discrimination.',
      'Section 8 / voucher tenants may have additional protections under federal law.',
    ],
    sourceNote: 'RI Gen. Laws § 34-18-37; RI Landlord-Tenant Handbook § 6.4, § 12.4',
  },

  trial: {
    id: 'trial',
    title: 'Going to the eviction hearing',
    summary:
      'Show up early. If you are not there when the case is called, you may lose by default. You can try to work out an agreement with the landlord before the hearing.',
    keyPoints: [
      'Arrive before the time on your Summons. Cases can be called at the scheduled time.',
      'If you miss the hearing, the judge may enter judgment for the landlord.',
      'You can negotiate a settlement (payment plan, move-out date, etc.) with the landlord or their attorney. Any agreement becomes a court order after the judge approves it.',
      'Bring documents: lease, notices, payment records, photos, texts/emails. Bring witnesses if they have relevant knowledge.',
      'You have 5 days after the judgment to file an appeal.',
    ],
    sourceNote: 'RI Landlord-Tenant Handbook § 12.2, § 12.3',
  },

  appeal: {
    id: 'appeal',
    title: 'Appeal rights',
    summary:
      'You can appeal a District Court eviction judgment to Superior Court. The appeal must be filed within 5 days. If you appeal, you must keep paying rent when it comes due.',
    keyPoints: [
      'Appeal must be filed in person at the District Court Clerk within 5 days of the judgment (counting from the day after).',
      'There are filing fees; you may ask for a fee waiver (Motion to Proceed In Forma Pauperis) if you cannot afford them.',
      'If you appeal, you must pay your full rent on each rental due date while the appeal is pending. If you miss a payment, the landlord can move to dismiss your appeal and get a writ of execution.',
      'A new trial is held in Superior Court. If the landlord wins again, there is a 20-day stay before they can get a writ of execution.',
    ],
    sourceNote: 'RI Gen. Laws § 34-18-52, § 34-18-53; RI Landlord-Tenant Handbook § 14',
  },
};

/** Note for display when using this handout content (PDF did not extract; manually transcribed for demo). */
export const RILS_HANDOUT_SOURCE_NOTE =
  'Handout content was manually transcribed/summarized from the scanned RILS EHD handout and cross-checked with the RI Landlord-Tenant Handbook. For demo grounding only.';

/** Get handout section(s) relevant to the eviction category for display in guidance. */
export function getHandoutSectionsForCategory(
  category: EvictionCategory | 'unknown'
): RilsHandoutSection[] {
  const trialAndAppeal = [RILS_HANDOUT_SECTIONS.trial, RILS_HANDOUT_SECTIONS.appeal];
  if (category === 'nonpayment') {
    return [RILS_HANDOUT_SECTIONS.nonpayment, ...trialAndAppeal];
  }
  if (category === 'noncompliance') {
    return [RILS_HANDOUT_SECTIONS.noncompliance, ...trialAndAppeal];
  }
  if (category === 'termination_of_tenancy') {
    return [RILS_HANDOUT_SECTIONS.termination_of_tenancy, ...trialAndAppeal];
  }
  return [RILS_HANDOUT_SECTIONS.common, ...trialAndAppeal];
}
