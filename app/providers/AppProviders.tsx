'use client';

import ClientAuthListener from '@/app/client-auth-listener';
import PostHogProvider from '@/app/providers/PostHogProvider';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ProfileProvider } from '@/lib/hooks/useProfile';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ProfileProvider>
        <SubscriptionProvider>
          <ClientAuthListener />
          {children}
        </SubscriptionProvider>
      </ProfileProvider>
    </PostHogProvider>
  );
}
