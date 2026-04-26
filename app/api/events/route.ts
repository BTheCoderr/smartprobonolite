import { NextResponse } from 'next/server';
import {
  insertAppEvent,
  parseAppEventBody,
  resolveUserIdFromAuthHeader,
  type AppEventBody,
} from '@/lib/events/server';
import { checkRateLimit, ipFromHeaders } from '@/lib/rateLimit';
import { getClientTraceIdFromHeaders, getRequestIdFromHeaders } from '@/lib/logger';

function withRequestId(res: NextResponse, requestId: string): NextResponse {
  res.headers.set('x-request-id', requestId);
  return res;
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromHeaders(req.headers);
  const clientTraceId = getClientTraceIdFromHeaders(req.headers);
  const rl = checkRateLimit(`events:${ipFromHeaders(req.headers)}`, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return withRequestId(NextResponse.json({ error: 'Too many requests' }, { status: 429 }), requestId);
  }

  let body: AppEventBody;
  try {
    body = (await req.json()) as AppEventBody;
  } catch {
    return withRequestId(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }), requestId);
  }

  const { event_name, properties } = parseAppEventBody(body);
  if (!event_name || typeof event_name !== 'string') {
    return withRequestId(
      NextResponse.json({ error: 'event_name or event_type required' }, { status: 400 }),
      requestId,
    );
  }

  const userId = await resolveUserIdFromAuthHeader(req.headers.get('authorization'));
  const result = await insertAppEvent({
    event_name,
    properties: (properties ?? {}) as Record<string, unknown>,
    userId,
    requestId,
    clientTraceId,
  });

  if (!result.ok) {
    const status = result.message === 'Server misconfigured' ? 503 : 500;
    return withRequestId(NextResponse.json({ error: result.message }, { status }), requestId);
  }

  if ('skipped' in result && result.skipped) {
    return withRequestId(
      NextResponse.json({ ok: true, skipped: true, analytics_circuit_open: true }),
      requestId,
    );
  }
  if ('soft_fail' in result && result.soft_fail) {
    return withRequestId(NextResponse.json({ ok: true, analytics_degraded: true }), requestId);
  }

  return withRequestId(NextResponse.json({ ok: true }), requestId);
}
