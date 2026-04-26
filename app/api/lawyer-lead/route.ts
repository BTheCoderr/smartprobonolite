import { NextResponse } from 'next/server';
import { insertLawyerLead } from '@/lib/lawyerLead';
import { checkRateLimit, ipFromHeaders } from '@/lib/rateLimit';
import {
  getClientTraceIdFromHeaders,
  logApiFlow,
  serializeErrorSafe,
} from '@/lib/logger';
import { getInboundRequestId } from '@/lib/tracing/requestId';

function withRequestId(res: NextResponse, requestId: string): NextResponse {
  res.headers.set('x-request-id', requestId);
  return res;
}

export async function POST(req: Request) {
  const started = Date.now();
  const requestId = getInboundRequestId(req);
  const clientTraceId = getClientTraceIdFromHeaders(req.headers);

  const flow = (args: {
    outcome: 'success' | 'client_error' | 'rate_limited' | 'server_error';
    status_code: number;
    error?: unknown;
  }) => {
    const base = {
      kind: 'api_flow' as const,
      request_id: requestId,
      route: '/api/lawyer-lead',
      feature: 'lawyer_lead',
      user_id: null as string | null,
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

  const rl = checkRateLimit(`lawyer-lead:${ipFromHeaders(req.headers)}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    flow({ outcome: 'rate_limited', status_code: 429 });
    return withRequestId(
      NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 }),
      requestId,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    flow({ outcome: 'client_error', status_code: 400 });
    return withRequestId(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }), requestId);
  }

  const result = await insertLawyerLead(body);
  if (!result.ok) {
    const status =
      result.message === 'Valid email required'
        ? 400
        : result.message === 'Server misconfigured'
          ? 503
          : 500;
    const outcome =
      status === 400 ? ('client_error' as const) : status === 503 ? ('server_error' as const) : ('server_error' as const);
    flow({
      outcome,
      status_code: status,
      error: new Error(result.message),
    });
    return withRequestId(NextResponse.json({ error: result.message }, { status }), requestId);
  }

  flow({ outcome: 'success', status_code: 200 });
  return withRequestId(NextResponse.json({ ok: true }), requestId);
}
