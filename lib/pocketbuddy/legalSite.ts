/**
 * PocketBuddy hosted pages — shared constants (App Store listing, support email, legal URLs).
 */
export const POCKETBUDDY_APP_STORE_URL =
  'https://apps.apple.com/us/app/smartprobono/id6759347017';

/** Mobile app support & PocketBuddy legal document inquiries. */
export const POCKETBUDDY_CONTACT_EMAIL = 'bferrell@smartprobono.org';

/** Shown on Privacy, Terms, and Legal pages (update when counsel revises documents). */
export const POCKETBUDDY_LEGAL_LAST_UPDATED_DISPLAY = 'May 9, 2026';

/** ISO date for structured data / consistency with display copy. */
export const POCKETBUDDY_LEGAL_LAST_UPDATED_ISO = '2026-05-09';

/** Third-party resource — SmartProBono does not control ACLU content or availability. */
export const ACLU_KNOW_YOUR_RIGHTS_URL = 'https://www.aclu.org/know-your-rights';

export function pocketBuddyCanonicalUrl(
  path: '/pocketbuddy' | '/pocketbuddy/privacy' | '/pocketbuddy/terms' | '/pocketbuddy/legal',
): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, '');
  if (!base) return undefined;
  return `${base}${path}`;
}
