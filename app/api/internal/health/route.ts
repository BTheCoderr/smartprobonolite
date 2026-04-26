import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getRateLimitStats } from '@/lib/rateLimit';
import {
  getClientTraceIdFromHeaders,
  getRequestIdFromHeaders,
  logApiFlow,
} from '@/lib/logger';
import { getCircuitSnapshot } from '@/lib/circuitBreaker';
import {
  ADMIN_EMAILS,
  gateInternalDiagnostics,
  getInternalDiagnosticsAccessMode,
  messageForInternalGateFailure,
  resolveInternalUser,
} from '@/lib/internal/internalAdminAuth';
import { maskIpForDisplay } from '@/lib/internal/maskIpForDisplay';
import { isInternalApiDevUnscopedAllowed } from '@/lib/internal/adminEmailsEnv';
import { getProcessInstanceId } from '@/lib/runtime/instanceIdentity';

function envPresent(key: string): boolean {
  return !!process.env[key]?.trim();
}

async function pingDb(): Promise<{ connected: boolean; latencyMs: number | null; tableCount: number | null }> {
  if (!supabaseAdmin) return { connected: false, latencyMs: null, tableCount: null };
  const start = Date.now();
  try {
    const { count, error } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true });
    return { connected: !error, latencyMs: Date.now() - start, tableCount: count ?? null };
  } catch {
    return { connected: false, latencyMs: Date.now() - start, tableCount: null };
  }
}

async function getRecentEvents(): Promise<{
  events: Array<{ event_name: string; created_at: string }>;
  counts: Record<string, number>;
  recentErrors: Array<{ event_name: string; created_at: string }>;
}> {
  if (!supabaseAdmin) return { events: [], counts: {}, recentErrors: [] };
  try {
    const { data } = await supabaseAdmin
      .from('app_events')
      .select('event_name, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    const events = (data ?? []).slice(0, 15);

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.event_name] = (counts[row.event_name] ?? 0) + 1;
    }

    const recentErrors = (data ?? [])
      .filter((e) => /fail|error/i.test(e.event_name))
      .slice(0, 10);

    return { events, counts, recentErrors };
  } catch {
    return { events: [], counts: {}, recentErrors: [] };
  }
}

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
      route: '/api/internal/health',
      feature: 'health',
      user_id: user?.id ?? null,
      outcome: 'forbidden',
      status_code: 403,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
    });
    return NextResponse.json(
      { error: messageForInternalGateFailure(gate.reason) },
      { status: 403 },
    );
  }

  const userInfo = gate.user;

  const aiProvider = process.env.AI_PROVIDER || 'huggingface';

  const env = {
    SUPABASE_URL: envPresent('NEXT_PUBLIC_SUPABASE_URL'),
    SUPABASE_ANON_KEY: envPresent('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE: envPresent('SUPABASE_SERVICE_ROLE_KEY'),
    GROQ_API_KEY: envPresent('GROQ_API_KEY'),
    OPENAI_API_KEY: envPresent('OPENAI_API_KEY'),
    HUGGINGFACE_API_KEY: envPresent('HUGGINGFACE_API_KEY'),
    RESEND_API_KEY: envPresent('RESEND_API_KEY'),
    STRIPE_SECRET_KEY: envPresent('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: envPresent('STRIPE_WEBHOOK_SECRET'),
    STRIPE_PRICE_ID_PRO: envPresent('STRIPE_PRICE_ID_PRO'),
    POSTHOG_KEY: envPresent('NEXT_PUBLIC_POSTHOG_KEY'),
    SENTRY_DSN: envPresent('NEXT_PUBLIC_SENTRY_DSN') || envPresent('SENTRY_DSN'),
    ADMIN_EMAILS: ADMIN_EMAILS.length > 0,
    INTERNAL_API_ALLOW_UNSCOPED: isInternalApiDevUnscopedAllowed(),
  };

  const db = await pingDb();

  const rag = {
    embeddingConfigured: envPresent('OPENAI_API_KEY'),
    vectorStoreConfigured: envPresent('NEXT_PUBLIC_SUPABASE_URL') && envPresent('SUPABASE_SERVICE_ROLE_KEY'),
    status: (envPresent('OPENAI_API_KEY') && envPresent('NEXT_PUBLIC_SUPABASE_URL') && envPresent('SUPABASE_SERVICE_ROLE_KEY'))
      ? 'active' as const
      : envPresent('NEXT_PUBLIC_SUPABASE_URL')
        ? 'degraded' as const
        : 'inactive' as const,
  };

  const ai = {
    provider: aiProvider,
    providerKeyPresent: aiProvider === 'groq' ? envPresent('GROQ_API_KEY') : envPresent('HUGGINGFACE_API_KEY'),
    groqReady: envPresent('GROQ_API_KEY'),
    huggingfaceReady: envPresent('HUGGINGFACE_API_KEY'),
    status: (aiProvider === 'groq' && envPresent('GROQ_API_KEY'))
      ? 'active' as const
      : (aiProvider === 'huggingface' && envPresent('HUGGINGFACE_API_KEY'))
        ? 'active' as const
        : 'degraded' as const,
  };

  const billing = {
    stripeConfigured: envPresent('STRIPE_SECRET_KEY') && envPresent('STRIPE_PRICE_ID_PRO'),
    webhookConfigured: envPresent('STRIPE_WEBHOOK_SECRET'),
    status: (envPresent('STRIPE_SECRET_KEY') && envPresent('STRIPE_PRICE_ID_PRO') && envPresent('STRIPE_WEBHOOK_SECRET'))
      ? 'active' as const
      : envPresent('STRIPE_SECRET_KEY')
        ? 'degraded' as const
        : 'inactive' as const,
  };

  const observability = {
    posthog: envPresent('NEXT_PUBLIC_POSTHOG_KEY'),
    sentry: envPresent('NEXT_PUBLIC_SENTRY_DSN') || envPresent('SENTRY_DSN'),
    structuredLogging: true,
    requestIds: true,
  };

  const { events, counts, recentErrors } = await getRecentEvents();

  const rlStats = getRateLimitStats();
  const rateLimit = {
    activeKeys: rlStats.activeKeys,
    topKeys: rlStats.entries
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ key, count }) => ({ key: maskIpForDisplay(key), count })),
  };

  const circuits = getCircuitSnapshot();

  return NextResponse.json({
    auth: userInfo ? { id: userInfo.id, email: userInfo.email, role: userInfo.role } : null,
    env,
    database: db,
    ai,
    rag,
    billing,
    observability,
    rateLimit,
    circuits,
    recentEvents: events,
    eventCounts: counts,
    recentErrors,
    meta: {
      nodeEnv: process.env.NODE_ENV ?? 'unknown',
      timestamp: new Date().toISOString(),
      instanceId: getProcessInstanceId(),
      /** Rate limiter + circuit breaker state are keyed to this id only (in-memory per process). */
      instanceScopeNote: 'in_memory_per_process' as const,
      internalApiAccess: getInternalDiagnosticsAccessMode(),
      internalApiEnforcement: 'strict' as const,
    },
  });
}
