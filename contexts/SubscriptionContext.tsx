'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';
import { isProFromProfile } from '@/lib/billing/isProFromProfile';

type SubscriptionContextValue = ReturnType<typeof useProfile> & {
  isPro: boolean;
  planTier: 'free' | 'pro';
  openUpgrade: (reason?: string) => void;
  upgradeOpen: boolean;
  upgradeReason: string;
  closeUpgrade: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function tierFromProfile(plan?: string | null): 'free' | 'pro' {
  return plan === 'pro' ? 'pro' : 'free';
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const profileApi = useProfile();
  const { profile } = profileApi;
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const planTier = tierFromProfile(profile?.plan_tier);
  const isPro = isProFromProfile(profile ?? null);

  const openUpgrade = useCallback((reason?: string) => {
    setUpgradeReason(reason || '');
    setUpgradeOpen(true);
    void trackEvent(ANALYTICS_EVENTS.upgradePromptOpened, { reason: reason || 'unspecified' });
  }, []);

  const closeUpgrade = useCallback(() => setUpgradeOpen(false), []);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      ...profileApi,
      isPro,
      planTier,
      openUpgrade,
      upgradeOpen,
      upgradeReason,
      closeUpgrade,
    }),
    [profileApi, isPro, planTier, openUpgrade, upgradeOpen, upgradeReason, closeUpgrade]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} reason={upgradeReason} />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return ctx;
}
