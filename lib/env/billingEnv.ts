/**
 * Runtime checks for Stripe checkout — returns an error message or null if OK.
 */
export function assertStripeCheckoutEnv(): string | null {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return 'Billing is not configured (STRIPE_SECRET_KEY)';
  }
  return null;
}
