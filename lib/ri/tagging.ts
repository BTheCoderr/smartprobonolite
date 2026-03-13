import type { EligibilitySignals, IntakeData, IssueFlags } from './types';

function isLikelyUrgentCourtDate(courtDate?: string): boolean {
  if (!courtDate) return false;
  const dt = new Date(courtDate);
  if (Number.isNaN(dt.getTime())) return false;
  const now = new Date();
  const diffDays = (dt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

function toNumberLike(value?: string): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function deriveEligibilitySignals(intake: IntakeData): EligibilitySignals {
  const reason = `${intake.evictionReason || ''} ${intake.noticeType || ''}`.toLowerCase();

  let likelyCategory: EligibilitySignals['likelyCategory'] = 'unknown';
  if (intake.behindOnRent === 'yes' || reason.includes('nonpayment') || reason.includes('pay or quit')) {
    likelyCategory = 'nonpayment';
  } else if (reason.includes('violation') || reason.includes('noncompliance') || reason.includes('cure or quit')) {
    likelyCategory = 'noncompliance';
  } else if (reason.includes('termination') || reason.includes('notice to quit')) {
    likelyCategory = 'termination_of_tenancy';
  }

  const income = toNumberLike(intake.monthlyHouseholdIncome);
  const householdSize = toNumberLike(intake.householdSize);
  const possibleFinancialEligibility: EligibilitySignals['possibleFinancialEligibility'] =
    intake.receivesPublicBenefits === 'yes'
      ? 'likely'
      : income == null || householdSize == null
        ? 'unclear'
        : income <= 3000
          ? 'likely'
          : 'unclear';

  return { likelyCategory, possibleFinancialEligibility };
}

export function deriveIssueFlags(intake: IntakeData): IssueFlags {
  const arrears = toNumberLike(intake.arrearsAmount);
  return {
    languageAccess: intake.needsInterpreter === 'yes' || intake.preferredLanguage !== 'English',
    possibleSubsidy: intake.subsidy !== 'None' && intake.subsidy !== 'Unsure',
    unsafeConditions: intake.unsafeConditions === 'yes',
    possibleRetaliation: intake.retaliationConcern === 'yes',
    possibleDiscrimination: intake.fairHousingConcern === 'yes',
    dvSafety: intake.dvSafetyConcerns === 'yes',
    disabilityAccommodation: intake.disabilityInHousehold === 'yes',
    urgentCourtDate: isLikelyUrgentCourtDate(intake.courtDate),
    highArrears: arrears != null && arrears >= 2000,
  };
}

