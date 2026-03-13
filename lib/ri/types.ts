export type EvictionCategory =
  | 'nonpayment'
  | 'noncompliance'
  | 'termination_of_tenancy'
  | 'unknown';

export type YesNo = 'yes' | 'no' | 'unsure';

export type LanguagePreference =
  | 'English'
  | 'Spanish'
  | 'Portuguese'
  | 'Kriolu'
  | 'Other';

export type HouseholdMember = {
  name?: string;
  age?: string;
  relationship?: string;
};

export type SubsidyType =
  | 'Section 8 / Housing Choice Voucher'
  | 'Public housing'
  | 'RI Housing (RIH)'
  | 'Other'
  | 'None'
  | 'Unsure';

export type NoticeType =
  | 'Pay or Quit (nonpayment)'
  | 'Cure or Quit (lease violation)'
  | 'Notice to Quit / Termination'
  | 'Court summons/complaint'
  | 'Other'
  | 'None / Unsure';

export type IntakeData = {
  // Contact
  fullName: string;
  phone: string;
  email?: string;
  preferredContact?: 'phone' | 'email';
  preferredLanguage: LanguagePreference;
  needsInterpreter: YesNo;
  zip?: string;

  // Household
  householdSize?: string;
  childrenInHousehold: YesNo;
  seniorsInHousehold: YesNo;
  disabilityInHousehold: YesNo;
  dvSafetyConcerns: YesNo;
  householdMembers?: HouseholdMember[];

  // Financial eligibility (high-level)
  monthlyHouseholdIncome?: string;
  receivesPublicBenefits: YesNo;
  benefitsNotes?: string;

  // Housing background
  address?: string;
  city?: string;
  landlordName?: string;
  leaseType?: 'month-to-month' | 'fixed-term' | 'unknown';
  subsidy: SubsidyType;

  // Eviction type / notice
  evictionReason?: string;
  noticeReceived: YesNo;
  noticeType: NoticeType;
  noticeDate?: string;
  courtDate?: string;
  caseFiled: YesNo;

  // Rent/payment
  rentAmount?: string;
  behindOnRent: YesNo;
  arrearsAmount?: string;
  appliedForAssistance: YesNo;
  assistanceProgramNotes?: string;

  // Conditions / habitability
  unsafeConditions: YesNo;
  conditionsNotes?: string;
  codeEnforcementInvolved: YesNo;

  // Retaliation / discrimination
  retaliationConcern: YesNo;
  fairHousingConcern: YesNo;

  // Tenant goals
  goals: Array<
    | 'Stay in home'
    | 'More time to move'
    | 'Repair problems'
    | 'Reduce or resolve rent debt'
    | 'Understand court process'
    | 'Other'
  >;
  goalsOther?: string;

  // Consent / disclaimers
  understandsNotLawFirm: boolean;
  agreesInfoOnly: boolean;
};

export type IssueFlags = {
  languageAccess: boolean;
  possibleSubsidy: boolean;
  unsafeConditions: boolean;
  possibleRetaliation: boolean;
  possibleDiscrimination: boolean;
  dvSafety: boolean;
  disabilityAccommodation: boolean;
  urgentCourtDate: boolean;
  highArrears: boolean;
};

export type EligibilitySignals = {
  likelyCategory: EvictionCategory;
  possibleFinancialEligibility: 'likely' | 'unclear' | 'unlikely';
};

export type GuidanceResult = {
  summaryPlainLanguage: string;
  likelyCategory: EvictionCategory;
  immediateNextSteps: string[];
  gatherDocuments: string[];
  beReadyToAnswer: string[];
  /** RILS handout sections (category + trial + appeal). Manually transcribed for demo. */
  handoutSections: Array<{ title: string; summary?: string; bullets: string[]; sourceNote?: string }>;
  issueFlags: IssueFlags;
  eligibility: EligibilitySignals;
  citations: Array<{
    sourceTitle: string;
    quote: string;
  }>;
};

