import { getAuthHeaders } from '@/lib/auth/getAuthHeaders';
import { fetchWithTimeout } from '@/lib/resilience';

export { ANALYTICS_EVENTS, type AnalyticsEventName } from '@/lib/analytics/eventNames';

/**
 * Product analytics → Supabase via POST /api/events (App Router).
 * Prefer names from ANALYTICS_EVENTS.
 */
export async function trackEvent(eventType: string, metadata: Record<string, unknown> = {}) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetchWithTimeout(
      '/api/events',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_name: eventType,
          properties: metadata,
        }),
      },
      5_000,
    );
    if (!res.ok) {
      const snippet = await res.text().catch(() => '');
      console.warn('[trackEvent]', eventType, 'HTTP', res.status, snippet.slice(0, 200));
    }
  } catch (e) {
    console.warn('[trackEvent]', eventType, 'failed', e instanceof Error ? e.message : e);
  }
}

/** Alias for legacy imports — prefer `trackEvent`. */
export const trackClientEvent = trackEvent;
