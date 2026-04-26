/**
 * Stripe — use `getStripe()` from here or `@/lib/stripe/server` (singleton).
 * Checkout session creation: `@/lib/stripe/createCheckoutSession`.
 */
export { getStripe } from './stripe/server';
export type { default as Stripe } from 'stripe';
