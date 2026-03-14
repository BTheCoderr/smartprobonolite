'use client';

import Link from 'next/link';
import { GhostButton, PrimaryButton } from '@/components/ui';
import { NoticeBox } from '@/components/ri/NoticeBox';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-spb-bg">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold text-gray-900">SmartProBono Lite</div>
          <Link href="/ri/materials" className="text-sm font-medium text-spb-blue hover:underline">
            Materials
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-5">
            <div className="text-sm font-semibold text-gray-600">Rhode Island · Eviction Help Desk (prototype)</div>
            <h1 className="text-3xl md:text-4xl font-bold text-spb-ink leading-tight">
              A simple intake tool for Rhode Island tenants facing eviction
            </h1>
            <p className="text-gray-700 leading-relaxed">
              This prototype helps self-represented tenants organize key facts, understand likely issue categories, and generate a
              clear case summary for legal aid staff review.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/ri/eviction/intake" className="inline-flex">
                <PrimaryButton type="button">Start Intake</PrimaryButton>
              </Link>
              <Link href="/ri/assistant" className="inline-flex">
                <GhostButton type="button" className="w-full sm:w-auto">
                  Ask Ermi
                </GhostButton>
              </Link>
              <Link href="/ri/eviction/summary" className="inline-flex">
                <GhostButton type="button" className="w-full sm:w-auto">
                  View Case Summary (if started)
                </GhostButton>
              </Link>
            </div>

            <div className="text-xs text-gray-500">
              Rhode Island eviction and landlord–tenant issues only.
            </div>
          </div>

          <div className="space-y-4">
            <NoticeBox title="Not a law firm" tone="warning">
              This tool provides general informational support and preparation help. It does not provide legal advice and does not
              create an attorney–client relationship.
            </NoticeBox>
            <NoticeBox title="Grounded in RI materials" tone="info">
              Guidance is designed to attach excerpts from the Rhode Island materials you upload (RILS handout + handbook), rather
              than acting like a generic chatbot.
            </NoticeBox>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm font-semibold text-gray-900 mb-2">What you’ll get</div>
              <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
                <li>A structured multi-step intake</li>
                <li>Eligibility and issue-flag tagging for staff triage</li>
                <li>A plain-language results screen with next-step checklist</li>
                <li>Ermi — ask questions, get RI-grounded answers</li>
                <li>A printable Tenant Case Summary for RILS/RWU review</li>
              </ul>
              <div className="mt-4 text-sm">
                <Link href="/ri/materials" className="font-medium text-spb-blue hover:underline">
                  Upload RI materials for citations →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <Link
          href="/ri/assistant"
          className="text-[10px] text-gray-400 hover:text-gray-600"
          title="Ermi – Rhode Island Eviction Assistant"
        >
          ·
        </Link>
      </footer>
    </div>
  );
}