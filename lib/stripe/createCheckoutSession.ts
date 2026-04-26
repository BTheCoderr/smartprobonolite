import { getStripe } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

function normalizeOrigin(raw: string): string {
  return raw.replace(/\/$/, '');
}

/**
 * Creates a subscription Checkout Session for the Pro plan.
 * Success redirect defaults to `/success` (override with NEXT_PUBLIC_STRIPE_SUCCESS_PATH).
 */
export async function createProSubscriptionCheckout(params: {
  userId: string;
  userEmail?: string | null;
  origin: string;
  /** Ignored unless it matches an allowed price. Defaults to STRIPE_PRICE_ID_PRO. */
  priceId?: string;
}): Promise<{ url: string | null }> {
  const envPrice = process.env.STRIPE_PRICE_ID_PRO?.trim();
  if (!envPrice) {
    throw new Error('STRIPE_PRICE_ID_PRO is not configured');
  }

  const allowedPrices = new Set(
    [envPrice, process.env.STRIPE_PRICE_ID_PRO_ANNUAL?.trim()].filter(Boolean) as string[],
  );

  const requestedPrice = params.priceId?.trim();
  const price = requestedPrice && allowedPrices.has(requestedPrice) ? requestedPrice : envPrice;

  const base = normalizeOrigin(params.origin);
  const successPath = process.env.NEXT_PUBLIC_STRIPE_SUCCESS_PATH || '/success';
  const cancelPath = '/upgrade';

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: params.userEmail ?? undefined,
    client_reference_id: params.userId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${base}${successPath.startsWith('/') ? successPath : `/${successPath}`}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${cancelPath}?canceled=1`,
    metadata: { supabase_user_id: params.userId },
    subscription_data: {
      metadata: { supabase_user_id: params.userId },
    },
  });

  return { url: session.url };
}

export async function getUserFromBearer(token: string | undefined | null) {
  if (!supabaseAdmin || !token) return null;
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
