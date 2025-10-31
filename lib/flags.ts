'use client';

import { posthog } from './posthogClient';

export function isFlagOnClient(key: string) {
  try {
    return posthog.isFeatureEnabled(key);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`PostHog feature flag check failed: ${key}`, error);
    }
    return false;
  }
}


