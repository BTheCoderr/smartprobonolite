'use client';

import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog environment variables are not set. Analytics disabled.');
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    autocapture: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    disable_session_recording: true,
    persistence: 'memory',
  });

  initialized = true;
}

export { posthog };

export function captureEvent(event: string, properties?: Record<string, any>) {
  try {
    if (!initialized) {
      // Attempt to lazily init if possible
      initPostHog();
    }
    if (!initialized) return;
    posthog.capture(event, properties);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`PostHog capture failed for ${event}`, error);
    }
  }
}


