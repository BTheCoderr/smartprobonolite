import type { Profile } from '@/lib/supabaseClient';

/**
 * Mirrors client `isPro` in SubscriptionProvider: Pro tier and not canceled.
 * Use for any server route that must not rely on client-side paywalls alone.
 */
export function isProFromProfile(profile: Pick<Profile, 'plan_tier' | 'subscription_status'> | null): boolean {
  if (!profile) return false;
  if (profile.plan_tier !== 'pro') return false;
  if (profile.subscription_status === 'canceled') return false;
  return true;
}
