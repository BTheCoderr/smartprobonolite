'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { PrimaryButton, GhostButton } from '@/components/ui';
import { NoticeBox } from '@/components/ri/NoticeBox';
import type { ExpungementData } from '@/lib/diy/expungementTypes';
import { DEFAULT_EXPUNGEMENT } from '@/lib/diy/expungementTypes';
import { loadExpungement, saveExpungement, clearExpungement } from '@/lib/diy/expungementStorage';
import { buildExpungementPrepSummary } from '@/lib/diy/expungementCopy';
import { formatExpungementFilingGuide } from '@/lib/diy/expungementFilingGuide';
import { setErmiHandoff } from '@/lib/ermiHandoff';
import { PaywallGate } from '@/components/billing/PaywallGate';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';
import { StatusMessage } from '@/components/ui/StatusMessage';

const STEPS = ['Basics', 'Record', 'Outcome', 'Documents & goals', 'Summary'];

export default function DiyExpungementPage() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ExpungementData>(DEFAULT_EXPUNGEMENT);
  const [printWarning, setPrintWarning] = useState(false);
  const expungementStartedLogged = useRef(false);

  useEffect(() => {
    setData(loadExpungement());
  }, []);

  useEffect(() => {
    if (expungementStartedLogged.current) return;
    expungementStartedLogged.current = true;
    void trackEvent(ANALYTICS_EVENTS.expungementStarted, { source: 'diy_expungement_page' });
  }, []);

  useEffect(() => {
    saveExpungement(data);
  }, [data]);

  const update = <K extends keyof ExpungementData>(key: K, value: ExpungementData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const summaryText = buildExpungementPrepSummary(data);

  const goAskErmi = () => {
    setErmiHandoff({
      source: 'expungement',
      text: summaryText.slice(0, 12000),
    });
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-spb-bg">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-600">DIY legal help · Alpha</p>
          <h1 className="text-2xl md:text-3xl font-bold text-spb-ink mt-1">Record-clearing prep (expungement / sealing)</h1>
          <p className="text-gray-700 mt-2">
            Answer a few questions to build a preparation summary and checklist. This does not decide eligibility—that depends on
            state law and your specific record.
          </p>
        </div>

        <NoticeBox title="Not legal advice" tone="warning">
          SmartProBono provides educational preparation support only. Courts and legal aid offices give authoritative answers about
          forms, fees, and eligibility.
        </NoticeBox>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full px-3 py-1 border ${
                step === i ? 'border-spb-blue bg-blue-50 text-spb-blue font-medium' : 'border-gray-200 bg-white'
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          {step === 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Where and what</h2>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">What state is the record in? (U.S.)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  value={data.state}
                  onChange={(e) => update('state', e.target.value)}
                  placeholder="e.g. Rhode Island"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">In plain language, what are you trying to clear or seal?</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 min-h-[100px]"
                  value={data.recordDescription}
                  onChange={(e) => update('recordDescription', e.target.value)}
                  placeholder="e.g. A shoplifting charge from 2018 that was dismissed after community service."
                />
              </label>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Type of record</h2>
              <p className="text-sm text-gray-600">Pick the closest fit — you can refine with Ermi later.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  [
                    ['unsure', 'Not sure'],
                    ['misdemeanor', 'Misdemeanor'],
                    ['felony', 'Felony'],
                    ['dismissed', 'Dismissed / dropped'],
                    ['acquitted', 'Acquitted'],
                    ['other', 'Other / civil or juvenile'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('recordKind', value)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm ${
                      data.recordKind === value
                        ? 'border-spb-blue bg-blue-50 text-spb-blue font-medium'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Outcome and timing</h2>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  How was the case resolved, as far as you know? (conviction, dismissal, probation completed, etc.)
                </span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 min-h-[88px]"
                  value={data.disposition}
                  onChange={(e) => update('disposition', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Rough year of the case or arrest (if known)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  value={data.yearRough}
                  onChange={(e) => update('yearRough', e.target.value)}
                  placeholder="e.g. 2018"
                />
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Documents and goals</h2>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  What documents do you already have? (docket, disposition, ID, etc.)
                </span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 min-h-[88px]"
                  value={data.documentsHave}
                  onChange={(e) => update('documentsHave', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">What outcome are you hoping for?</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 min-h-[88px]"
                  value={data.goals}
                  onChange={(e) => update('goals', e.target.value)}
                  placeholder="e.g. Clean up my record for job applications."
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Anything else we should know?</span>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 min-h-[72px]"
                  value={data.notes}
                  onChange={(e) => update('notes', e.target.value)}
                />
              </label>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Your prep summary</h2>
              <p className="text-sm text-gray-600 mb-3">
                Copy or print this for your records. Use &quot;Ask Ermi&quot; to talk through wording or next questions—not for a
                final eligibility decision.
              </p>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 max-h-[420px] overflow-y-auto">
                {summaryText}
              </pre>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Step-by-step filing guide</h3>
                <p className="text-xs text-gray-600 mb-3">
                  General preparation steps—not a substitute for state-specific legal advice.
                </p>
                <PaywallGate reason="expungement_filing_guide">
                  <pre className="whitespace-pre-wrap text-sm bg-white border border-gray-200 rounded-xl p-4 text-gray-800 max-h-[320px] overflow-y-auto">
                    {formatExpungementFilingGuide()}
                  </pre>
                </PaywallGate>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <PrimaryButton type="button" onClick={goAskErmi}>
                  Ask Ermi about this prep
                </PrimaryButton>
                <GhostButton
                  type="button"
                  onClick={() => {
                    setPrintWarning(false);
                    const w = window.open('', '_blank');
                    if (!w) {
                      setPrintWarning(true);
                      return;
                    }
                    const wm = !isPro
                      ? `<div style="border:2px dashed #b45309;background:#fffbeb;padding:12px;margin-bottom:12px;font-size:12px;color:#78350f;">SmartProBono — Free tier print preview. Upgrade for a clean PDF.</div>`
                      : '';
                    w.document.write(
                      `<!DOCTYPE html><html><head><title>Expungement prep</title><style>body{font-family:system-ui;padding:1.5rem;max-width:40rem;margin:auto;white-space:pre-wrap;}</style></head><body>${wm}<pre>${summaryText.replace(/</g, '&lt;')}</pre></body></html>`
                    );
                    w.document.close();
                    w.print();
                  }}
                >
                  Print / Save as PDF
                </GhostButton>
                <button
                  type="button"
                  className="text-sm text-gray-600 underline"
                  onClick={() => {
                    clearExpungement();
                    setData({ ...DEFAULT_EXPUNGEMENT });
                    setStep(0);
                  }}
                >
                  Clear saved answers
                </button>
              </div>

              {printWarning && (
                <StatusMessage
                  variant="warning"
                  message="Pop-up blocked. Please allow pop-ups for this site to print your filing guide."
                  onDismiss={() => setPrintWarning(false)}
                />
              )}
            </>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="text-sm font-medium text-gray-600 disabled:opacity-40"
            >
              Back
            </button>
            {step < 4 ? (
              <PrimaryButton type="button" onClick={() => setStep((s) => Math.min(4, s + 1))}>
                Continue
              </PrimaryButton>
            ) : (
              <Link href="/tools" className="inline-flex items-center text-sm font-medium text-spb-blue hover:underline">
                Open full tools workspace →
              </Link>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="text-spb-blue hover:underline">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
