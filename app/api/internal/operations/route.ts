import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getRateLimitStats } from '@/lib/rateLimit';
import {
  getClientTraceIdFromHeaders,
  getRequestIdFromHeaders,
  logApiFlow,
} from '@/lib/logger';
import {
  gateInternalDiagnostics,
  getInternalDiagnosticsAccessMode,
  messageForInternalGateFailure,
  resolveInternalUser,
} from '@/lib/internal/internalAdminAuth';
import {
  degradedFromProps,
  inferOperationalOutcome,
  sanitizeAppEventProperties,
} from '@/lib/internal/sanitizeAppEventProperties';
import { maskIpForDisplay } from '@/lib/internal/maskIpForDisplay';
import { getProcessInstanceId } from '@/lib/runtime/instanceIdentity';

type OperationsEventRow = {
  id: string;
  created_at: string;
  event_name: string;
  user_id: string | null;
  inferred_outcome: ReturnType<typeof inferOperationalOutcome>;
  degraded: boolean;
  safe_properties: Record<string, string | number | boolean>;
};

export async function GET(req: Request) {
  const started = Date.now();
  const requestId = getRequestIdFromHeaders(req.headers);
  const clientTraceId = getClientTraceIdFromHeaders(req.headers);

  const gate = await gateInternalDiagnostics(req.headers);
  if (!gate.ok) {
    const user = await resolveInternalUser(req.headers);
    logApiFlow({
      kind: 'api_flow',
      request_id: requestId,
      route: '/api/internal/operations',
      feature: 'internal_ops',
      user_id: user?.id ?? null,
      outcome: 'forbidden',
      status_code: 403,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);
  const filterRaw = (url.searchParams.get('filter') ?? 'all').toLowerCase();
  const filter =
    filterRaw === 'failures' || filterRaw === 'success' || filterRaw === 'unknown'
      ? filterRaw
      : 'all';

  let limit = Number(url.searchParams.get('limit') ?? '80');
  if (!Number.isFinite(limit) || limit < 1) limit = 80;
  if (limit > 150) limit = 150;

  let events: OperationsEventRow[] = [];
  let failuresByRoute: Record<string, number> = {};

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('app_events')
        .select('id, created_at, event_name, user_id, properties')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        const rows: OperationsEventRow[] = data.map((row) => {
          const safe_properties = sanitizeAppEventProperties(row.properties);
          const inferred_outcome = inferOperationalOutcome(row.event_name, safe_properties);
          const degraded = degradedFromProps(safe_properties);
          return {
            id: row.id,
            created_at: row.created_at,
            event_name: row.event_name,
            user_id: row.user_id ?? null,
            inferred_outcome,
            degraded,
            safe_properties,
          };
        });

        const filtered =
          filter === 'all'
            ? rows
            : rows.filter((r) => r.inferred_outcome === filter);

        events = filtered;

        for (const r of rows) {
          if (r.inferred_outcome !== 'failure') continue;
          const routeKey =
            typeof r.safe_properties.route === 'string' && r.safe_properties.route
              ? r.safe_properties.route
              : '(no route)';
          failuresByRoute[routeKey] = (failuresByRoute[routeKey] ?? 0) + 1;
        }
      }
    } catch {
      events = [];
    }
  }

  const rlStats = getRateLimitStats();
  const rateLimit = {
    activeKeys: rlStats.activeKeys,
    topKeys: rlStats.entries
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
      .map(({ key, count }) => ({ key: maskIpForDisplay(key), count })),
  };

  return NextResponse.json({
    filter,
    limit,
    events,
    failuresByRoute,
    rateLimit,
    meta: {
      timestamp: new Date().toISOString(),
      instanceId: getProcessInstanceId(),
      instanceScopeNote: 'in_memory_per_process' as const,
      internalApiAccess: getInternalDiagnosticsAccessMode(),
      internalApiEnforcement: 'strict' as const,
      notes: [
        'Rows are from Supabase app_events. Only allowlisted JSON fields are returned; prompts and document text are never exposed.',
        'Outcome is inferred from event name and safe fields, not from server logs.',
        'Structured logs (api_flow) are not persisted for browsing in this UI.',
        'Rate limit counts and circuit state on the health dashboard are for this runtime instance only — other replicas may differ.',
      ],
    },
  });
}
