'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card, GhostButton, PrimaryButton } from '@/components/ui';
import type { IntakeData, NoticeType, SubsidyType } from '@/lib/ri/types';
import { clearIntake, loadIntake, saveIntake } from '@/lib/ri/storage';
import { Stepper } from '@/components/ri/Stepper';
import { Field, Select, TextArea, TextInput, YesNoButtons } from '@/components/ri/Fields';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { useRouter } from 'next/navigation';

const STEPS = ['Basics', 'Household', 'Housing', 'Notice & rent', 'Goals', 'Review'];

const DEFAULT_INTAKE: IntakeData = {
  fullName: '',
  phone: '',
  email: '',
  preferredContact: 'phone',
  preferredLanguage: 'English',
  needsInterpreter: 'no',
  zip: '',

  householdSize: '',
  childrenInHousehold: 'unsure',
  seniorsInHousehold: 'unsure',
  disabilityInHousehold: 'unsure',
  dvSafetyConcerns: 'unsure',
  householdMembers: [],

  monthlyHouseholdIncome: '',
  receivesPublicBenefits: 'unsure',
  benefitsNotes: '',

  address: '',
  city: '',
  landlordName: '',
  leaseType: 'unknown',
  subsidy: 'Unsure',

  evictionReason: '',
  noticeReceived: 'unsure',
  noticeType: 'None / Unsure',
  noticeDate: '',
  courtDate: '',
  caseFiled: 'unsure',

  rentAmount: '',
  behindOnRent: 'unsure',
  arrearsAmount: '',
  appliedForAssistance: 'unsure',
  assistanceProgramNotes: '',

  unsafeConditions: 'unsure',
  conditionsNotes: '',
  codeEnforcementInvolved: 'unsure',

  retaliationConcern: 'unsure',
  fairHousingConcern: 'unsure',

  goals: [],
  goalsOther: '',

  understandsNotLawFirm: false,
  agreesInfoOnly: false,
};

const SAMPLE_INTAKE: IntakeData = {
  ...DEFAULT_INTAKE,
  fullName: 'Jordan R.',
  phone: '(401) 555-0183',
  preferredLanguage: 'English',
  needsInterpreter: 'no',
  zip: '02908',
  householdSize: '2',
  childrenInHousehold: 'no',
  seniorsInHousehold: 'no',
  disabilityInHousehold: 'unsure',
  dvSafetyConcerns: 'no',
  monthlyHouseholdIncome: '2200',
  receivesPublicBenefits: 'yes',
  benefitsNotes: 'SNAP (food assistance).',
  address: '123 Example St, Apt 2',
  city: 'Providence',
  landlordName: 'Example Property Mgmt',
  leaseType: 'month-to-month',
  subsidy: 'None',
  noticeReceived: 'yes',
  noticeType: 'Pay or Quit (nonpayment)',
  noticeDate: '',
  caseFiled: 'unsure',
  courtDate: '',
  rentAmount: '1350',
  behindOnRent: 'yes',
  arrearsAmount: '2700',
  appliedForAssistance: 'yes',
  assistanceProgramNotes: 'Applied for rental assistance; pending.',
  unsafeConditions: 'yes',
  conditionsNotes: 'No heat for several days this winter. Texted landlord multiple times.',
  codeEnforcementInvolved: 'no',
  retaliationConcern: 'unsure',
  fairHousingConcern: 'no',
  goals: ['Stay in home', 'Reduce or resolve rent debt', 'Understand court process'],
  understandsNotLawFirm: true,
  agreesInfoOnly: true,
};

function requiredIfEmpty(value: string, label: string) {
  return value.trim() ? null : `${label} is required.`;
}

export default function RIEvictionIntakePage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<IntakeData>(() => loadIntake() || DEFAULT_INTAKE);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    saveIntake(data);
  }, [data]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (stepIndex >= 0) {
      const nameErr = requiredIfEmpty(data.fullName, 'Full name');
      if (nameErr) e.fullName = nameErr;
      const phoneErr = requiredIfEmpty(data.phone, 'Phone');
      if (phoneErr) e.phone = phoneErr;
    }
    if (stepIndex >= 5) {
      if (!data.understandsNotLawFirm) e.understandsNotLawFirm = 'Please confirm you understand this is not a law firm.';
      if (!data.agreesInfoOnly) e.agreesInfoOnly = 'Please confirm you understand this is informational support.';
    }
    return e;
  }, [data, stepIndex]);

  const canContinue = Object.keys(errors).length === 0;

  function next() {
    if (!canContinue) {
      setTouched((t) => ({ ...t, fullName: true, phone: true, understandsNotLawFirm: true, agreesInfoOnly: true }));
      return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function onSubmit() {
    if (!canContinue) return;
    router.push('/ri/eviction/results');
  }

  const noticeTypes: NoticeType[] = [
    'Pay or Quit (nonpayment)',
    'Cure or Quit (lease violation)',
    'Notice to Quit / Termination',
    'Court summons/complaint',
    'Other',
    'None / Unsure',
  ];

  const subsidyTypes: SubsidyType[] = [
    'Section 8 / Housing Choice Voucher',
    'Public housing',
    'RI Housing (RIH)',
    'Other',
    'None',
    'Unsure',
  ];

  return (
    <div className="min-h-screen bg-spb-bg">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            SmartProBono Lite
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/ri/materials" className="text-sm font-medium text-spb-blue hover:underline">
              Materials
            </Link>
            <GhostButton
              type="button"
              onClick={() => {
                setData(SAMPLE_INTAKE);
                setTouched({});
                setStepIndex(0);
              }}
            >
              Load sample
            </GhostButton>
            <GhostButton
              type="button"
              onClick={() => {
                clearIntake();
                setData(DEFAULT_INTAKE);
                setTouched({});
                setStepIndex(0);
              }}
            >
              Reset
            </GhostButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Rhode Island · Eviction Help Desk Intake (prototype)</div>
          <h1 className="text-2xl md:text-3xl font-bold text-spb-ink">Digital intake</h1>
          <p className="text-gray-700">
            Answer a few questions so legal aid staff can quickly understand what’s happening and what to ask next.
          </p>
        </div>

        <NoticeBox title="Important" tone="warning">
          This is <strong>informational support</strong> and not a law firm. It does not create an attorney–client relationship.
          Legal staff should review everything before relying on it.
        </NoticeBox>

        <Card className="space-y-6">
          <Stepper steps={STEPS} currentIndex={stepIndex} />

          {stepIndex === 0 && (
            <div className="space-y-5">
              <Field label="Full name" error={touched.fullName ? errors.fullName : undefined}>
                <TextInput
                  value={data.fullName}
                  onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                  onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
                  placeholder="First and last name"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Phone" hint="Best number to reach you" error={touched.phone ? errors.phone : undefined}>
                  <TextInput
                    value={data.phone}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="(401) 555-1234"
                  />
                </Field>

                <Field label="Email (optional)">
                  <TextInput
                    value={data.email || ''}
                    onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Preferred language">
                  <Select
                    value={data.preferredLanguage}
                    onChange={(e) => setData((d) => ({ ...d, preferredLanguage: e.target.value as any }))}
                  >
                    {['English', 'Spanish', 'Portuguese', 'Kriolu', 'Other'].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Do you need an interpreter?">
                  <YesNoButtons
                    name="Needs interpreter"
                    value={data.needsInterpreter}
                    onChange={(v) => setData((d) => ({ ...d, needsInterpreter: v }))}
                  />
                </Field>
              </div>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Household size (optional)">
                  <TextInput
                    inputMode="numeric"
                    value={data.householdSize || ''}
                    onChange={(e) => setData((d) => ({ ...d, householdSize: e.target.value }))}
                    placeholder="e.g., 3"
                  />
                </Field>
                <Field label="ZIP (optional)">
                  <TextInput value={data.zip || ''} onChange={(e) => setData((d) => ({ ...d, zip: e.target.value }))} />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Children in household?">
                  <YesNoButtons
                    name="Children"
                    value={data.childrenInHousehold}
                    onChange={(v) => setData((d) => ({ ...d, childrenInHousehold: v }))}
                  />
                </Field>
                <Field label="Seniors (60+) in household?">
                  <YesNoButtons
                    name="Seniors"
                    value={data.seniorsInHousehold}
                    onChange={(v) => setData((d) => ({ ...d, seniorsInHousehold: v }))}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Disability or accommodation needs?">
                  <YesNoButtons
                    name="Disability"
                    value={data.disabilityInHousehold}
                    onChange={(v) => setData((d) => ({ ...d, disabilityInHousehold: v }))}
                  />
                </Field>
                <Field label="Safety concerns (including domestic violence context)?">
                  <YesNoButtons
                    name="DV/Safety"
                    value={data.dvSafetyConcerns}
                    onChange={(v) => setData((d) => ({ ...d, dvSafetyConcerns: v }))}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Monthly household income (optional)" hint="Rough estimate is OK">
                  <TextInput
                    inputMode="decimal"
                    value={data.monthlyHouseholdIncome || ''}
                    onChange={(e) => setData((d) => ({ ...d, monthlyHouseholdIncome: e.target.value }))}
                    placeholder="e.g., 2200"
                  />
                </Field>
                <Field label="Receives public benefits?">
                  <YesNoButtons
                    name="Benefits"
                    value={data.receivesPublicBenefits}
                    onChange={(v) => setData((d) => ({ ...d, receivesPublicBenefits: v }))}
                  />
                </Field>
              </div>

              <Field label="Benefits notes (optional)" hint="Examples: SNAP, SSI, TANF, unemployment">
                <TextArea
                  rows={3}
                  value={data.benefitsNotes || ''}
                  onChange={(e) => setData((d) => ({ ...d, benefitsNotes: e.target.value }))}
                  placeholder="Any relevant details"
                />
              </Field>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-5">
              <Field label="Rental address (optional)">
                <TextInput
                  value={data.address || ''}
                  onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))}
                  placeholder="Street address"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="City (optional)">
                  <TextInput value={data.city || ''} onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))} />
                </Field>
                <Field label="Landlord / property manager (optional)">
                  <TextInput
                    value={data.landlordName || ''}
                    onChange={(e) => setData((d) => ({ ...d, landlordName: e.target.value }))}
                    placeholder="Name if known"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Lease type (optional)">
                  <Select value={data.leaseType} onChange={(e) => setData((d) => ({ ...d, leaseType: e.target.value as any }))}>
                    <option value="unknown">Not sure</option>
                    <option value="month-to-month">Month-to-month</option>
                    <option value="fixed-term">Fixed term</option>
                  </Select>
                </Field>
                <Field label="Housing subsidy?">
                  <Select value={data.subsidy} onChange={(e) => setData((d) => ({ ...d, subsidy: e.target.value as SubsidyType }))}>
                    {subsidyTypes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Unsafe conditions (mold, pests, no heat, leaks, etc.)?">
                <YesNoButtons
                  name="Conditions"
                  value={data.unsafeConditions}
                  onChange={(v) => setData((d) => ({ ...d, unsafeConditions: v }))}
                />
              </Field>

              <Field label="Conditions notes (optional)">
                <TextArea
                  rows={3}
                  value={data.conditionsNotes || ''}
                  onChange={(e) => setData((d) => ({ ...d, conditionsNotes: e.target.value }))}
                  placeholder="What’s wrong, how long, and what you told the landlord"
                />
              </Field>

              <Field label="Has code enforcement/inspection been involved?">
                <YesNoButtons
                  name="Code enforcement"
                  value={data.codeEnforcementInvolved}
                  onChange={(v) => setData((d) => ({ ...d, codeEnforcementInvolved: v }))}
                />
              </Field>
            </div>
          )}

          {stepIndex === 3 && (
            <div className="space-y-5">
              <Field label="Have you received an eviction notice or court papers?">
                <YesNoButtons
                  name="Notice received"
                  value={data.noticeReceived}
                  onChange={(v) => setData((d) => ({ ...d, noticeReceived: v }))}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Notice type">
                  <Select value={data.noticeType} onChange={(e) => setData((d) => ({ ...d, noticeType: e.target.value as NoticeType }))}>
                    {noticeTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Notice date (optional)" hint="If known">
                  <TextInput
                    type="date"
                    value={data.noticeDate || ''}
                    onChange={(e) => setData((d) => ({ ...d, noticeDate: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Has a case been filed in court?">
                  <YesNoButtons name="Case filed" value={data.caseFiled} onChange={(v) => setData((d) => ({ ...d, caseFiled: v }))} />
                </Field>
                <Field label="Court date (optional)" hint="If you have one">
                  <TextInput type="date" value={data.courtDate || ''} onChange={(e) => setData((d) => ({ ...d, courtDate: e.target.value }))} />
                </Field>
              </div>

              <Field label="Are you behind on rent?">
                <YesNoButtons name="Behind on rent" value={data.behindOnRent} onChange={(v) => setData((d) => ({ ...d, behindOnRent: v }))} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Monthly rent (optional)">
                  <TextInput
                    inputMode="decimal"
                    value={data.rentAmount || ''}
                    onChange={(e) => setData((d) => ({ ...d, rentAmount: e.target.value }))}
                    placeholder="e.g., 1350"
                  />
                </Field>
                <Field label="Amount behind (optional)" hint="If known">
                  <TextInput
                    inputMode="decimal"
                    value={data.arrearsAmount || ''}
                    onChange={(e) => setData((d) => ({ ...d, arrearsAmount: e.target.value }))}
                    placeholder="e.g., 2700"
                  />
                </Field>
              </div>

              <Field label="Have you applied for rental assistance?">
                <YesNoButtons
                  name="Assistance"
                  value={data.appliedForAssistance}
                  onChange={(v) => setData((d) => ({ ...d, appliedForAssistance: v }))}
                />
              </Field>

              <Field label="Assistance notes (optional)" hint="Program name, status, dates">
                <TextArea
                  rows={3}
                  value={data.assistanceProgramNotes || ''}
                  onChange={(e) => setData((d) => ({ ...d, assistanceProgramNotes: e.target.value }))}
                />
              </Field>

              <Field label="What is the landlord saying is the reason? (optional)">
                <TextArea
                  rows={3}
                  value={data.evictionReason || ''}
                  onChange={(e) => setData((d) => ({ ...d, evictionReason: e.target.value }))}
                  placeholder="e.g., nonpayment, lease violation, month-to-month termination, other"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Do you think this might be retaliation?">
                  <YesNoButtons
                    name="Retaliation"
                    value={data.retaliationConcern}
                    onChange={(v) => setData((d) => ({ ...d, retaliationConcern: v }))}
                  />
                </Field>
                <Field label="Fair housing / discrimination concern?">
                  <YesNoButtons
                    name="Fair housing"
                    value={data.fairHousingConcern}
                    onChange={(v) => setData((d) => ({ ...d, fairHousingConcern: v }))}
                  />
                </Field>
              </div>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="space-y-5">
              <Field label="What do you want help with? (choose all that apply)" hint="This helps staff triage">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(
                    [
                      'Stay in home',
                      'More time to move',
                      'Repair problems',
                      'Reduce or resolve rent debt',
                      'Understand court process',
                      'Other',
                    ] as const
                  ).map((g) => {
                    const checked = data.goals.includes(g);
                    return (
                      <label
                        key={g}
                        className={[
                          'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium cursor-pointer',
                          checked ? 'border-spb-blue bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const nextGoals = e.target.checked ? [...data.goals, g] : data.goals.filter((x) => x !== g);
                            setData((d) => ({ ...d, goals: nextGoals }));
                          }}
                        />
                        <span className="text-gray-800">{g}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>

              {data.goals.includes('Other') && (
                <Field label="Other goal (optional)">
                  <TextInput value={data.goalsOther || ''} onChange={(e) => setData((d) => ({ ...d, goalsOther: e.target.value }))} />
                </Field>
              )}
            </div>
          )}

          {stepIndex === 5 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="font-semibold text-gray-900 mb-2">Quick review</div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">Name:</span> {data.fullName || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {data.phone || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> {[data.address, data.city].filter(Boolean).join(', ') || '—'}
                  </div>
                  <div>
                    <span className="font-medium">Notice:</span> {data.noticeReceived} · {data.noticeType}
                  </div>
                  <div>
                    <span className="font-medium">Behind on rent:</span> {data.behindOnRent}
                  </div>
                  <div>
                    <span className="font-medium">Goals:</span> {data.goals.length ? data.goals.join(', ') : '—'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={data.understandsNotLawFirm}
                    onChange={(e) => setData((d) => ({ ...d, understandsNotLawFirm: e.target.checked }))}
                  />
                  <span>
                    I understand this is <strong>not a law firm</strong> and does not create an attorney–client relationship.
                  </span>
                </label>
                {touched.understandsNotLawFirm && errors.understandsNotLawFirm && (
                  <div className="text-xs text-red-600 font-medium">{errors.understandsNotLawFirm}</div>
                )}

                <label className="flex items-start gap-3 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={data.agreesInfoOnly}
                    onChange={(e) => setData((d) => ({ ...d, agreesInfoOnly: e.target.checked }))}
                  />
                  <span>
                    I understand the information here is <strong>general and educational</strong>, and legal staff should review it.
                  </span>
                </label>
                {touched.agreesInfoOnly && errors.agreesInfoOnly && (
                  <div className="text-xs text-red-600 font-medium">{errors.agreesInfoOnly}</div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <GhostButton type="button" onClick={back} disabled={stepIndex === 0}>
              Back
            </GhostButton>

            {stepIndex < STEPS.length - 1 ? (
              <PrimaryButton type="button" onClick={next}>
                Continue
              </PrimaryButton>
            ) : (
              <PrimaryButton type="button" onClick={onSubmit} disabled={!canContinue}>
                See results
              </PrimaryButton>
            )}
          </div>
        </Card>

        <div className="text-xs text-gray-500 leading-relaxed">
          Note: answers are stored only in this browser. No account required.
        </div>
      </main>
    </div>
  );
}

