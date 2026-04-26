'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicHeader } from '@/components/PublicHeader';
import { PrimaryButton, GhostButton } from '@/components/ui';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';
import { fetchWithTimeout, isTimeoutError } from '@/lib/resilience';
import { StatusMessage } from '@/components/ui/StatusMessage';

function UpgradePageInner() {
  const searchParams = useSearchParams();
  const canceled = searchParams?.get('canceled') === '1';
  const { isPro, openUpgrade } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const checkout = async () => {
    setErr(null);
    const session = await supabase?.auth.getSession();
    if (!session?.data.session) {
      window.location.href = '/login?next=/upgrade';
      return;
    }
    setLoading(true);
    try {
      void trackEvent(ANALYTICS_EVENTS.upgradeCheckoutStarted, { surface: 'upgrade_page', action: 'start_checkout' });
      const res = await fetchWithTimeout(
        '/api/stripe/create-checkout-session',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
        15_000,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url as string;
    } catch (e: unknown) {
      setErr(
        isTimeoutError(e)
          ? 'The checkout request took too long. Please try again.'
          : e instanceof Error ? e.message : 'Error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spb-bg">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-3xl font-bold text-spb-ink">SmartProBono Pro</h1>
        <p className="mt-2 text-gray-700">
          Support development and unlock advanced expungement guidance, premium PDF and Word output, and deeper document analysis.
        </p>

        {canceled && (
          <div className="mt-6">
            <NoticeBox title="Checkout canceled" tone="info">
              You can try again anytime when you are ready.
            </NoticeBox>
          </div>
        )}

        {isPro ? (
          <div className="mt-6">
            <NoticeBox title="You are on Pro" tone="info">
            Thank you for subscribing. Manage billing in your{' '}
            <Link href="/dashboard" className="font-medium text-spb-blue hover:underline">
              dashboard
            </Link>
            .
            </NoticeBox>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold text-spb-blue uppercase tracking-wide">Pro</div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                $19<span className="text-lg font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">Price ID configured in Stripe — adjust env to match your product.</p>
              <ul className="mt-6 space-y-2 text-gray-800 text-sm list-disc ml-5">
                <li>Advanced expungement guidance and step-by-step filing support</li>
                <li>Premium PDF and Word (DOCX) output — clean exports without watermarks</li>
                <li>Deeper structured document analysis and summaries</li>
                <li>Higher usage limits for serious self-help workflows</li>
              </ul>
              {err && (
                <div className="mt-4">
                  <StatusMessage variant="error" message={err} onDismiss={() => setErr(null)} />
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton type="button" disabled={loading} onClick={() => void checkout()}>
                  {loading ? 'Redirecting…' : 'Upgrade Now'}
                </PrimaryButton>
                <Link href="/login?next=/upgrade">
                  <GhostButton type="button">Sign in first</GhostButton>
                </Link>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-600">
              Prefer a modal? Use{' '}
              <button type="button" className="text-spb-blue underline" onClick={() => openUpgrade()}>
                Open upgrade prompt
              </button>{' '}
              from any gated action.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-spb-bg">
          <PublicHeader />
          <main className="mx-auto max-w-3xl px-4 py-12 text-gray-500">Loading…</main>
        </div>
      }
    >
      <UpgradePageInner />
    </Suspense>
  );
}
