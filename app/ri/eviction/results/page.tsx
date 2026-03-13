'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, GhostButton, PrimaryButton } from '@/components/ui';
import { buildGuidance } from '@/lib/ri/grounding';
import { loadIntake } from '@/lib/ri/storage';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { RILS_HANDOUT_SOURCE_NOTE } from '@/lib/ri/rilsHandoutContent';
import { useRouter } from 'next/navigation';

function categoryLabel(cat: string) {
  if (cat === 'nonpayment') return 'Nonpayment / rent arrears';
  if (cat === 'noncompliance') return 'Lease violation / noncompliance';
  if (cat === 'termination_of_tenancy') return 'Termination of tenancy';
  return 'Unclear (needs staff review)';
}

export default function ResultsPage() {
  const router = useRouter();
  const intake = loadIntake();

  const guidance = useMemo(() => {
    if (!intake) return null;
    return buildGuidance(intake);
  }, [intake]);

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

  const flags = guidance.issueFlags;
  const flagBadges: Array<{ label: string; on: boolean }> = [
    { label: 'Urgent court date', on: flags.urgentCourtDate },
    { label: 'Language access', on: flags.languageAccess },
    { label: 'Subsidy involved', on: flags.possibleSubsidy },
    { label: 'Unsafe conditions', on: flags.unsafeConditions },
    { label: 'DV / safety context', on: flags.dvSafety },
    { label: 'Disability / accommodation', on: flags.disabilityAccommodation },
    { label: 'Possible retaliation', on: flags.possibleRetaliation },
    { label: 'Possible discrimination', on: flags.possibleDiscrimination },
    { label: 'Higher arrears', on: flags.highArrears },
  ].filter((b) => b.on);

  return (
    <div className="min-h-screen bg-spb-bg">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            SmartProBono Lite
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/ri/eviction/intake" className="text-sm font-medium text-spb-blue hover:underline">
              Edit intake
            </Link>
            <Link href="/ri/eviction/summary" className="text-sm font-medium text-spb-blue hover:underline">
              Case summary
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Rhode Island · Eviction Help Desk (prototype)</div>
          <h1 className="text-2xl md:text-3xl font-bold text-spb-ink">Next-step guidance</h1>
          <p className="text-gray-700">
            This is a conservative, staff-reviewed summary based on your intake and any uploaded RI materials.
          </p>
        </div>

        <NoticeBox title="Staff review required" tone="warning">
          This is not legal advice. A legal aid attorney/advocate should review the facts, documents, and deadlines before
          relying on this.
        </NoticeBox>

        <Card className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Plain-language summary</div>
            <div className="text-gray-900 leading-relaxed">{guidance.summaryPlainLanguage}</div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Likely issue category</div>
            <div className="text-gray-900 font-semibold">{categoryLabel(guidance.likelyCategory)}</div>
            <div className="text-sm text-gray-600 mt-1">
              Financial eligibility signal: <span className="font-medium">{guidance.eligibility.possibleFinancialEligibility}</span>
            </div>
          </div>

          {flagBadges.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">Issue flags</div>
              <div className="flex flex-wrap gap-2">
                {flagBadges.map((b) => (
                  <span key={b.label} className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-800">
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Documents that may help staff review your situation</div>
            <ul className="list-disc ml-5 space-y-1 text-gray-900">
              {guidance.immediateNextSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Documents that may help staff review your situation</div>
            <ul className="list-disc ml-5 space-y-1 text-gray-900">
              {guidance.gatherDocuments.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Staff may ask questions about</div>
            <ul className="list-disc ml-5 space-y-1 text-gray-900">
              {guidance.beReadyToAnswer.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </Card>

        {guidance.handoutSections.length > 0 && (
          <Card className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-gray-700">From RILS Eviction Help Desk handout</div>
              <div className="text-xs text-gray-500 mt-1">
                Manually transcribed from the handout for demo grounding. Cross-checked with RI Landlord-Tenant Handbook.
              </div>
            </div>
            {guidance.handoutSections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                <div className="font-semibold text-gray-900">{section.title}</div>
                {section.summary && (
                  <div className="text-sm text-gray-700 leading-relaxed">{section.summary}</div>
                )}
                <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                {section.sourceNote && (
                  <div className="text-xs text-gray-500 mt-2">{section.sourceNote}</div>
                )}
              </div>
            ))}
          </Card>
        )}

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-700">Grounding (RI materials excerpts)</div>
              <div className="text-sm text-gray-600">
                {guidance.citations.length
                  ? 'Short excerpts from Rhode Island source materials (Handbook, Intake Form).'
                  : 'No matching excerpts found. The app uses embedded RI materials by default; upload more at /ri/materials if needed.'}
              </div>
            </div>
            <Link href="/ri/materials" className="text-sm font-medium text-spb-blue hover:underline">
              Upload materials
            </Link>
          </div>

          {guidance.citations.length > 0 ? (
            <div className="space-y-3">
              {guidance.citations.map((c, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-600">{c.sourceTitle}</div>
                  <div className="text-sm text-gray-900 mt-2 leading-relaxed">“{c.quote}”</div>
                </div>
              ))}
            </div>
          ) : (
            <NoticeBox title="Demo note" tone="info">
              For the RWU/RILS meeting, upload the three RI documents once in this browser (PDF/DOCX/TXT). The results
              page will then attach conservative excerpts as citations.
            </NoticeBox>
          )}
        </Card>

        <div className="flex items-center justify-between gap-3">
          <GhostButton type="button" onClick={() => router.push('/ri/eviction/intake')}>
            Back to intake
          </GhostButton>
          <PrimaryButton type="button" onClick={() => router.push('/ri/eviction/summary')}>
            View tenant case summary
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}

