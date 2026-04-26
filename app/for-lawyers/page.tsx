'use client';

import { useState } from 'react';
import { PublicHeader } from '@/components/PublicHeader';
import { PrimaryButton } from '@/components/ui';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';
import { fetchWithTimeout } from '@/lib/resilience';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function ForLawyersPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [firmSize, setFirmSize] = useState('');
  const [useCase, setUseCase] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetchWithTimeout(
        '/api/lawyer-lead',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            full_name: fullName,
            firm_name: firmName,
            firm_size: firmSize,
            use_case: useCase,
            message,
          }),
        },
        10_000,
      );
      if (!res.ok) throw new Error('Request failed');
      setStatus('done');
      void trackEvent(ANALYTICS_EVENTS.lawyerLeadSubmit, { firm: !!firmName });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-spb-bg">
      <PublicHeader />
      <main className="mx-auto max-w-xl px-4 py-12 md:py-16">
        <h1 className="text-3xl font-bold text-spb-ink">For legal professionals</h1>
        <p className="mt-3 text-gray-700">
          SmartProBono is building tools for intake, document understanding, and guided workflows. Leave your details to hear about
          pilots, integrations, and team plans.
        </p>
        <NoticeBox title="No attorney–client relationship" tone="warning">
          This form is for business interest only. It does not create a lawyer–client relationship.
        </NoticeBox>

        {status === 'done' ? (
          <p className="mt-8 text-lg text-gray-800">Thanks — we will be in touch.</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Work email *</span>
              <input
                required
                type="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Firm / organization</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Firm size (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={firmSize}
                onChange={(e) => setFirmSize(e.target.value)}
                placeholder="e.g. solo, 2–10 attorneys"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Primary use case (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="e.g. housing intake, expungement clinic"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">What are you interested in?</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[100px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            {status === 'error' && (
              <StatusMessage variant="error" message="Something went wrong. Please try again." />
            )}
            <PrimaryButton type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Request information'}
            </PrimaryButton>
          </form>
        )}
      </main>
    </div>
  );
}
