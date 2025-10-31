import { captureServer } from './posthogServer';
import { supabaseAdmin } from './supabaseClient';

export type AnalyticsProperties = Record<string, any>;

export async function trackAndStore(
  userId: string,
  event: string,
  props: AnalyticsProperties,
  organizationId?: string
) {
  captureServer(event, userId, { ...props, organization_id: organizationId });

  if (!supabaseAdmin) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase service role key missing; analytics event not stored.');
    }
    return;
  }

  const { error } = await supabaseAdmin
    .from('analytics_events')
    .insert({
      user_id: userId,
      organization_id: organizationId ?? null,
      event,
      properties: props,
    });

  if (error && process.env.NODE_ENV === 'development') {
    console.error('Failed to store analytics event:', error);
  }
}


