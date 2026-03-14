'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ChatBox, { type RiIntakeContext } from '@/app/dashboard/components/ChatBox';
import { NoticeBox } from '@/components/ri/NoticeBox';
import type { IntakeData } from '@/lib/ri/types';
import { loadIntake } from '@/lib/ri/storage';
import { buildGuidance } from '@/lib/ri/grounding';

function categoryLabel(cat: string): string {
  if (cat === 'nonpayment') return 'Nonpayment / rent arrears';
  if (cat === 'noncompliance') return 'Lease violation / noncompliance';
  if (cat === 'termination_of_tenancy') return 'Termination of tenancy';
  return 'Unclear (needs staff review)';
}

export default function RiAssistantPage() {
  const [intake, setIntake] = useState<IntakeData | null>(null);
  useEffect(() => {
    setIntake(loadIntake());
  }, []);
  const guidance = useMemo(() => (intake ? buildGuidance(intake) : null), [intake]);

  const intakeContext: RiIntakeContext | null = useMemo(() => {
    if (!guidance) return null;
    const flags = Object.entries(guidance.issueFlags)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim());
    return {
      summary: guidance.summaryPlainLanguage,
      category: guidance.likelyCategory,
      categoryLabel: categoryLabel(guidance.likelyCategory),
      flags,
      citations: guidance.citations,
      handoutSections: guidance.handoutSections?.map((s) => ({
        title: s.title,
        summary: s.summary ?? '',
        bullets: s.bullets ?? [],
      })),
    };
  }, [guidance]);

  return (
    <div className="min-h-screen bg-spb-bg">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            SmartProBono Lite
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/ri/eviction/intake" className="text-sm font-medium text-spb-blue hover:underline">
              Start intake
            </Link>
            <Link href="/ri/eviction/results" className="text-sm font-medium text-spb-blue hover:underline">
              Results
            </Link>
            <Link href="/ri/materials" className="text-sm font-medium text-spb-blue hover:underline">
              Materials
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Ermi – Rhode Island Eviction Assistant</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ask questions about eviction notices, tenant rights, and court procedures in Rhode Island.
          </p>
        </div>

        <NoticeBox title="Informational guidance only" tone="warning">
          Ermi provides general information based on Rhode Island materials. Ermi does not give legal advice.
          Legal staff or an attorney should review your situation.
        </NoticeBox>

        {intake && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-gray-800">
            <span className="font-medium">Using your intake:</span> Ermi can tailor answers based on your
            completed intake (e.g., notice type, rent arrears, subsidy).
          </div>
        )}

        <div className="mt-6 min-h-[500px]">
          <ChatBox intakeContext={intakeContext} />
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Answers are grounded in the Rhode Island Landlord-Tenant Handbook and Eviction Help Desk materials.
        </p>
      </main>
    </div>
  );
}
