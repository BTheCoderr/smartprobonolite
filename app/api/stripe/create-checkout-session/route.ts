import { NextResponse } from 'next/server';
import {
  createProSubscriptionCheckout,
  getUserFromBearer,
} from '@/lib/stripe/createCheckoutSession';
import { assertStripeCheckoutEnv } from '@/lib/env/billingEnv';
import { checkRateLimit, ipFromHeaders } from '@/lib/rateLimit';
import {
  getClientTraceIdFromHeaders,
  logApiFlow,
  serializeErrorSafe,
} from '@/lib/logger';
import { getInboundRequestId } from '@/lib/tracing/requestId';

function originFromRequest(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/$/, '');
  const h = req.headers;
  const origin = h.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return 'http://localhost:3000';
}

function withRequestId(res: NextResponse, requestId: string): NextResponse {
  res.headers.set('x-request-id', requestId);
  return res;
}

export async function POST(req: Request) {
  const started = Date.now();
  const requestId = getInboundRequestId(req);
  const clientTraceId = getClientTraceIdFromHeaders(req.headers);

  const flow = (args: {
    user_id?: string | null;
    outcome: 'success' | 'client_error' | 'rate_limited' | 'server_error' | 'forbidden';
    status_code: number;
    error?: unknown;
  }) => {
    const base = {
      kind: 'api_flow' as const,
      request_id: requestId,
      route: '/api/stripe/create-checkout-session',
      feature: 'stripe_checkout',
      user_id: args.user_id ?? null,
      outcome: args.outcome,
      status_code: args.status_code,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
    };
    if (args.error) {
      const s = serializeErrorSafe(args.error);
      logApiFlow({
        ...base,
        error_type: s.error_type,
        error_code: s.error_code,
        error_message_safe: s.error_message_safe,
      });
    } else {
      logApiFlow(base);
    }
  };

  const rl = checkRateLimit(`checkout:${ipFromHeaders(req.headers)}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    flow({ outcome: 'rate_limited', status_code: 429 });
    return withRequestId(
      NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 }),
      requestId,
    );
  }

  const envErr = assertStripeCheckoutEnv();
  if (envErr) {
    flow({ outcome: 'server_error', status_code: 503, error: new Error(envErr) });
    return withRequestId(NextResponse.json({ error: envErr }, { status: 503 }), requestId);
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = await getUserFromBearer(token);
  if (!user) {
    flow({ outcome: 'forbidden', status_code: 401, user_id: null });
    return withRequestId(
      NextResponse.json({ error: 'Sign in required to subscribe' }, { status: 401 }),
      requestId,
    );
  }

  let priceId: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && typeof (body as { priceId?: unknown }).priceId === 'string') {
      priceId = (body as { priceId: string }).priceId.trim();
    }
  } catch {
    // optional body
  }

  if (!process.env.STRIPE_PRICE_ID_PRO) {
    flow({
      outcome: 'server_error',
      status_code: 503,
      user_id: user.id,
      error: new Error('STRIPE_PRICE_ID_PRO missing'),
    });
    return withRequestId(
      NextResponse.json({ error: 'Billing is not configured (STRIPE_PRICE_ID_PRO)' }, { status: 503 }),
      requestId,
    );
  }

  try {
    const { url } = await createProSubscriptionCheckout({
      userId: user.id,
      userEmail: user.email,
      origin: originFromRequest(req),
      priceId,
    });
    flow({ outcome: 'success', status_code: 200, user_id: user.id });
    return withRequestId(NextResponse.json({ url }), requestId);
  } catch (e: unknown) {
    flow({ outcome: 'server_error', status_code: 500, user_id: user.id, error: e });
    return withRequestId(
      NextResponse.json({ error: e instanceof Error ? e.message : 'Checkout failed' }, { status: 500 }),
      requestId,
    );
  }
}
