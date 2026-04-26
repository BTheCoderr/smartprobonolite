'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';
import { fetchWithTimeout, isTimeoutError } from '@/lib/resilience';
import { StatusMessage } from '@/components/ui/StatusMessage';

type Props = {
  open: boolean;
  onClose: () => void;
  reason?: string;
};

export function UpgradeModal({ open, onClose, reason }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const startCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      void trackEvent(ANALYTICS_EVENTS.upgradeCheckoutStarted, { surface: 'modal', reason: reason || 'unspecified' });
      const session = await supabase?.auth.getSession();
      if (!session?.data.session) {
        window.location.href = '/login?next=/upgrade';
        return;
      }
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
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      throw new Error('No checkout URL');
    } catch (e: unknown) {
      setError(
        isTimeoutError(e)
          ? 'The checkout request took too long. Please try again.'
          : e instanceof Error ? e.message : 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-gray-200">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-gray-900 pr-8">Upgrade to Pro</h2>
        {reason ? (
          <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {reason === 'daily_upload_limit'
              ? 'You have reached the free daily upload limit. Pro includes higher limits and exports.'
              : reason === 'docx_export'
                ? 'Export to Word (DOCX) is a Pro feature. Upgrade to download professional-formatted drafts.'
                : reason}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            Unlock advanced expungement guidance, premium PDF-style output, and deeper document analysis.
          </p>
        )}
        <ul className="mt-4 text-sm text-gray-700 space-y-2 list-disc ml-5">
          <li>Advanced expungement guidance and filing workflows</li>
          <li>Premium PDF / Word output (clean exports without watermarks)</li>
          <li>Deeper structured document analysis and summaries</li>
        </ul>
        {error && (
          <div className="mt-3">
            <StatusMessage variant="error" message={error} onDismiss={() => setError(null)} />
          </div>
        )}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={startCheckout}
            className="flex-1 rounded-xl bg-spb-blue text-white py-2.5 font-medium hover:bg-spb-blueDark disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Upgrade Now'}
          </button>
          <Link
            href="/upgrade"
            className="flex-1 text-center rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            View plans
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Secure payment via Stripe. You will create or sign in to your account at checkout if needed.
        </p>
      </div>
    </div>
  );
}
