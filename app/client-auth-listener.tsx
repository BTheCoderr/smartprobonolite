'use client';

import { useEffect } from 'react';
import { posthog } from '@/lib/posthogClient';
import { supabase } from '@/lib/supabaseClient';

export default function ClientAuthListener() {
  useEffect(() => {
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;

      if (!user) {
        posthog.reset();
        return;
      }

      const metadata = (user.user_metadata || {}) as Record<string, any>;
      const firmId = metadata.firmId ?? metadata.organizationId ?? null;
      const role = metadata.role ?? metadata.title ?? null;
      const plan = metadata.plan ?? metadata.subscription ?? 'Free';

      posthog.identify(user.id, {
        email: user.email,
        role,
        firmId,
      });

      if (firmId) {
        posthog.group('organization', firmId);
        (posthog as unknown as { groupIdentify?: (groupType: string, groupKey: string, properties?: Record<string, any>) => void }).groupIdentify?.(
          'organization',
          firmId,
          { plan }
        );
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}


