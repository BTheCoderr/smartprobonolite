export type ExpungementData = {
  state: string;
  /** What the user is dealing with (free text + structured hints). */
  recordDescription: string;
  recordKind: 'unsure' | 'misdemeanor' | 'felony' | 'dismissed' | 'acquitted' | 'other';
  disposition: string;
  yearRough: string;
  documentsHave: string;
  goals: string;
  notes: string;
};

export const DEFAULT_EXPUNGEMENT: ExpungementData = {
  state: '',
  recordDescription: '',
  recordKind: 'unsure',
  disposition: '',
  yearRough: '',
  documentsHave: '',
  goals: '',
  notes: '',
};
