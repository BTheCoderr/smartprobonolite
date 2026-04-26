'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GhostButton, PrimaryButton } from '@/components/ui';
import { useSubscription } from '@/contexts/SubscriptionContext';

const POLL_MS = 2000;
const MAX_POLLS = 15;

/**
 * Shown after Stripe redirects to /success (or legacy /upgrade/success).
 * Pro is applied by webhook — this view polls profile only.
 */
export function CheckoutSuccessView() {
  const params = useSearchParams();
  const sessionId = params?.get('session_id') ?? null;
  const { refreshProfile, isPro } = useSubscription();
  const [polled, setPolled] = useState(false);

  useEffect(() => {
    if (isPro) {
      setPolled(false);
      return;
    }

    let n = 0;
    void refreshProfile();
    const id = setInterval(() => {
      void refreshProfile();
      n += 1;
      if (n >= MAX_POLLS) {
        setPolled(true);
        clearInterval(id);
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [refreshProfile, isPro]);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">You are all set</h1>
      <p className="mt-3 text-gray-600">
        {sessionId
          ? 'Stripe confirmed your checkout. Your account should show Pro shortly after the webhook runs.'
          : 'Thanks for upgrading.'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Status:{' '}
        {isPro ? 'Pro active' : polled ? 'Still updating — refresh or check Stripe webhook logs.' : 'Syncing…'}
      </p>
      {polled && !isPro && (
        <p className="mt-4 text-sm text-gray-600 max-w-md mx-auto">
          If Pro does not appear after a few minutes, open your{' '}
          <Link href="/dashboard" className="text-spb-blue font-medium hover:underline">
            dashboard
          </Link>{' '}
          or contact support — payment is confirmed by Stripe, but account sync depends on the webhook.
        </p>
      )}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/tools">
          <PrimaryButton type="button">Go to tools</PrimaryButton>
        </Link>
        <Link href="/dashboard">
          <GhostButton type="button" className="w-full sm:w-auto">
            Dashboard
          </GhostButton>
        </Link>
      </div>
    </main>
  );
}
