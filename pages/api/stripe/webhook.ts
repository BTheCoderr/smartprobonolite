/**
 * Authoritative writer for subscription state: verifies Stripe signature, then updates `profiles`.
 * Do not grant Pro from the client or success page alone.
 * Idempotency: after successful DB writes, records `event.id` in `stripe_webhook_events` (see migration).
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';
import { getInboundRequestIdFromPagesApi } from '@/lib/tracing/requestId';

export const config = {
  api: {
    bodyParser: false,
  },
};

function rawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function markEventProcessed(eventId: string): Promise<{ ok: true } | { ok: false; error: unknown }> {
  if (!supabaseAdmin) return { ok: false, error: new Error('no admin') };
  const { error } = await supabaseAdmin.from('stripe_webhook_events').insert({ id: eventId });
  if (error) {
    if (error.code === '23505') {
      return { ok: true };
    }
    return { ok: false, error };
  }
  return { ok: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  if (!supabaseAdmin || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const buf = await rawBody(req);
  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Missing stripe-signature');
  }

  const log = createLogger(getInboundRequestIdFromPagesApi(req));

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    log.error('Webhook signature verification failed', { error: err instanceof Error ? err.message : 'invalid' });
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'invalid'}`);
  }

  let skipIdempotency = false;
  const dupLookup = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();

  if (dupLookup.error) {
    const msg = dupLookup.error.message ?? '';
    if (msg.includes('does not exist') || msg.includes('schema cache')) {
      log.warn('stripe_webhook_events missing — run migration; idempotency disabled');
      skipIdempotency = true;
    } else {
      log.error('Webhook idempotency lookup failed', { error: dupLookup.error.message });
      return res.status(500).json({ error: 'Idempotency lookup failed' });
    }
  } else if (dupLookup.data) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  let didPersist = false;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const paymentOk =
          session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
        if (!paymentOk) {
          log.warn('checkout.session.completed skipped: payment not settled', { sessionId: session.id, paymentStatus: session.payment_status });
          break;
        }

        const userId = session.metadata?.supabase_user_id || session.client_reference_id;
        if (!userId) {
          log.warn('checkout.session.completed: missing user id', { sessionId: session.id });
          break;
        }

        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({
            plan_tier: 'pro',
            subscription_status: 'active',
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', userId)
          .select('id');

        if (error) {
          log.error('Webhook profiles update (checkout) failed', { error: error.message });
          return res.status(500).json({ error: 'Database update failed' });
        }
        if (!data?.length) {
          log.error('Webhook: no profile row for user', { userId });
          return res.status(500).json({ error: 'Profile not found' });
        }
        didPersist = true;
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) {
          log.warn('customer.subscription.updated: missing supabase_user_id', { subscriptionId: sub.id });
          break;
        }
        const active = ['active', 'trialing'].includes(sub.status);
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({
            plan_tier: active ? 'pro' : 'free',
            subscription_status: sub.status,
            stripe_subscription_id: sub.id,
          })
          .eq('id', userId)
          .select('id');

        if (error) {
          log.error('Webhook profiles update (subscription.updated) failed', { error: error.message });
          return res.status(500).json({ error: 'Database update failed' });
        }
        if (!data?.length) {
          log.error('Webhook: no profile row for user', { userId });
          return res.status(500).json({ error: 'Profile not found' });
        }
        didPersist = true;
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) {
          log.warn('customer.subscription.deleted: missing supabase_user_id', { subscriptionId: sub.id });
          break;
        }
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({
            plan_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('id', userId)
          .select('id');

        if (error) {
          log.error('Webhook profiles update (subscription.deleted) failed', { error: error.message });
          return res.status(500).json({ error: 'Database update failed' });
        }
        if (!data?.length) {
          log.error('Webhook: no profile row for user', { userId });
          return res.status(500).json({ error: 'Profile not found' });
        }
        didPersist = true;
        break;
      }
      default:
        break;
    }
  } catch (e) {
    log.error('Webhook handler error', { error: e instanceof Error ? e.message : String(e) });
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  if (didPersist && !skipIdempotency) {
    const marked = await markEventProcessed(event.id);
    if (!marked.ok) {
      log.error('Webhook: failed to record event id (idempotency)', { error: marked.error instanceof Error ? marked.error.message : String(marked.error) });
      return res.status(500).json({ error: 'Failed to record webhook event' });
    }
  }

  return res.status(200).json({ received: true });
}
