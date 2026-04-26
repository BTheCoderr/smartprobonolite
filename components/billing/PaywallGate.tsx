'use client';

import type { ReactNode } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';

type PaywallGateProps = {
  children: ReactNode;
  /** Shown when not Pro instead of default locked card (e.g. teaser content). */
  fallback?: ReactNode;
  /** Passed to upgrade analytics / modal copy. */
  reason?: string;
};

/**
 * Renders children only when the user has Pro. Otherwise shows upgrade UI.
 * Must be used under SubscriptionProvider (see AppProviders).
 */
export function PaywallGate({ children, fallback, reason = 'paywall' }: PaywallGateProps) {
  const { isPro, openUpgrade } = useSubscription();

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
      <p className="font-medium text-amber-900">Pro feature</p>
      <p className="mt-1 text-amber-900/90">Upgrade to unlock this content and exports.</p>
      <button
        type="button"
        onClick={() => openUpgrade(reason)}
        className="mt-3 rounded-lg bg-spb-blue px-4 py-2 text-sm font-medium text-white hover:bg-spb-blueDark"
      >
        Upgrade to Pro
      </button>
    </div>
  );
}
