'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, GhostButton, PrimaryButton } from '@/components/ui';
import { loadIntake } from '@/lib/ri/storage';
import { buildGuidance } from '@/lib/ri/grounding';
import { useRouter } from 'next/navigation';

function line(label: string, value?: string) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="text-sm text-gray-900 text-right break-words max-w-[70%]">{value?.trim() ? value : '—'}</div>
    </div>
  );
}

export default function SummaryPage() {
  const router = useRouter();
  const intake = loadIntake();
  const guidance = useMemo(() => (intake ? buildGuidance(intake) : null), [intake]);

  if (!intake || !guidance) {
    return (
      <div className="min-h-screen bg-spb-bg">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-gray-900">
              SmartProBono Lite
            </Link>
            <Link href="/ri/eviction/intake" className="text-sm font-medium text-spb-blue hover:underline">
              Start intake
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Card>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-gray-900">No intake found</div>
              <div className="text-sm text-gray-700">Please complete the intake first.</div>
              <div className="pt-3">
                <PrimaryButton type="button" onClick={() => router.push('/ri/eviction/intake')}>
                  Go to intake
                </PrimaryButton>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const FLAG_LABELS: Record<string, string> = {
    urgentCourtDate: 'Urgent court date',
    languageAccess: 'Language access',
    possibleSubsidy: 'Subsidy involved',
    unsafeConditions: 'Unsafe conditions',
    dvSafety: 'DV / safety context',
    disabilityAccommodation: 'Disability / accommodation',
    possibleRetaliation: 'Possible retaliation',
    possibleDiscrimination: 'Possible discrimination',
    highArrears: 'Higher arrears',
  };
  const flagBadges = Object.entries(guidance.issueFlags)
    .filter(([, v]) => v)
    .map(([k]) => FLAG_LABELS[k] ?? k);

  return (
    <div className="min-h-screen bg-spb-bg">
      <header className="border-b border-gray-200 bg-white print:hidden">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            SmartProBono Lite
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/ri/eviction/results" className="text-sm font-medium text-spb-blue hover:underline">
              Back to results
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-spb-ink">SmartProBono – Tenant Case Summary</h1>
              <div className="text-sm font-semibold text-gray-700 mt-1">Rhode Island Eviction Help Desk Prototype</div>
              <div className="text-sm text-gray-600 mt-1">For staff review only</div>
              <div className="text-xs text-gray-500 mt-2">Generated {new Date().toLocaleString()}</div>
            </div>
            <div className="print:hidden flex gap-2">
              <GhostButton type="button" onClick={() => router.push('/ri/eviction/intake')}>
                Edit
              </GhostButton>
              <PrimaryButton type="button" onClick={() => window.print()}>
                Print / Save PDF
              </PrimaryButton>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">
            Tenant Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
              <div className="text-sm font-semibold text-gray-900">Contact</div>
              <div className="space-y-2">
                {line('Name', intake.fullName)}
                {line('Phone', intake.phone)}
                {line('Email', intake.email)}
                {line('Language', intake.preferredLanguage)}
                {line('Needs interpreter', intake.needsInterpreter)}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
              <div className="text-sm font-semibold text-gray-900">Household</div>
              <div className="space-y-2">
                {line('Household size', intake.householdSize)}
                {line('Children', intake.childrenInHousehold)}
                {line('Seniors', intake.seniorsInHousehold)}
                {line('Disability', intake.disabilityInHousehold)}
                {line('DV/safety concerns', intake.dvSafetyConcerns)}
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">Housing Information</div>
          <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                {line('Address', [intake.address, intake.city].filter(Boolean).join(', '))}
                {line('Landlord/PM', intake.landlordName)}
                {line('Lease type', intake.leaseType)}
                {line('Subsidy', intake.subsidy)}
              </div>
              <div className="space-y-2">
                {line('Unsafe conditions', intake.unsafeConditions)}
                {line('Conditions notes', intake.conditionsNotes)}
                {line('Code enforcement', intake.codeEnforcementInvolved)}
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">Notice Details & Rent / Arrears</div>
          <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                {line('Notice received', intake.noticeReceived)}
                {line('Notice type', intake.noticeType)}
                {line('Notice date', intake.noticeDate)}
                {line('Case filed', intake.caseFiled)}
                {line('Court date', intake.courtDate)}
              </div>
              <div className="space-y-2">
                {line('Behind on rent', intake.behindOnRent)}
                {line('Monthly rent', intake.rentAmount)}
                {line('Arrears amount', intake.arrearsAmount)}
                {line('Applied for assistance', intake.appliedForAssistance)}
                {line('Assistance notes', intake.assistanceProgramNotes)}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-gray-600 mb-1">Landlord-stated reason (as reported)</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{intake.evictionReason?.trim() ? intake.evictionReason : '—'}</div>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">Tenant Goals</div>
          <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
            <div className="text-sm text-gray-900">{intake.goals.length ? intake.goals.join(', ') : '—'}</div>
            {intake.goals.includes('Other') && intake.goalsOther?.trim() && (
              <div className="text-sm text-gray-700">Other: {intake.goalsOther}</div>
            )}
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">Eviction Category</div>
          <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
            <div className="text-sm text-gray-700">
              Likely category: <span className="font-semibold text-gray-900">{guidance.likelyCategory}</span> · Financial
              eligibility signal: <span className="font-semibold text-gray-900">{guidance.eligibility.possibleFinancialEligibility}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {flagBadges.length ? (
                flagBadges.map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-800">
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-600">No flags triggered.</span>
              )}
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">Staff Follow-Up Questions</div>
          <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
            <ul className="list-disc ml-5 text-sm text-gray-900 space-y-1">
              {guidance.beReadyToAnswer.slice(0, 6).map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          {guidance.handoutSections.length > 0 && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-2">RI Handout Context</div>
              <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
              <div className="text-xs text-gray-500 mb-2">
                Manually transcribed from RILS materials. See full details on results page.
              </div>
              {guidance.handoutSections.slice(0, 2).map((s) => (
                <div key={s.title} className="text-sm">
                  <div className="font-medium text-gray-800">{s.title}</div>
                  <ul className="list-disc ml-5 mt-1 space-y-0.5 text-gray-700">
                    {s.bullets.slice(0, 2).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            </>
          )}

          <div className="text-xs text-gray-600 leading-relaxed pt-4 mt-4 border-t border-gray-200">
            This summary is generated from tenant-provided information and Rhode Island housing materials.
            It is intended to support review by Eviction Help Desk staff or attorneys.
            It is not legal advice.
          </div>
        </Card>
      </main>
    </div>
  );
}

