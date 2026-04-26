'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

/* ---------- types ---------- */

type Status = 'active' | 'degraded' | 'inactive';

type CircuitRow = {
  dependency: string;
  instance_id: string;
  state: 'closed' | 'open' | 'half_open';
  open: boolean;
  open_until_iso: string | null;
  failures_toward_open: number;
  threshold: number;
  probe_count: number;
  max_probe_count: number;
  cooldown_ms: number;
  cooldown_remaining_ms: number;
  half_opened_since_iso: string | null;
};

type HealthData = {
  auth: { id: string; email: string; role: string } | null;
  env: Record<string, boolean>;
  database: { connected: boolean; latencyMs: number | null; tableCount: number | null };
  ai: { provider: string; providerKeyPresent: boolean; groqReady: boolean; huggingfaceReady: boolean; status: Status };
  rag: { embeddingConfigured: boolean; vectorStoreConfigured: boolean; status: Status };
  billing: { stripeConfigured: boolean; webhookConfigured: boolean; status: Status };
  observability: { posthog: boolean; sentry: boolean; structuredLogging: boolean; requestIds: boolean };
  circuits: Record<string, CircuitRow>;
  rateLimit: { activeKeys: number; topKeys: Array<{ key: string; count: number }> };
  recentEvents: Array<{ event_name: string; created_at: string }>;
  eventCounts: Record<string, number>;
  recentErrors: Array<{ event_name: string; created_at: string }>;
  meta: {
    nodeEnv: string;
    timestamp: string;
    instanceId: string;
    instanceScopeNote: 'in_memory_per_process';
    internalApiAccess: 'admin_allowlist' | 'dev_unscoped_override';
    internalApiEnforcement: 'strict';
  };
};

/* ---------- ui primitives ---------- */

function Badge({ status, label }: { status: 'healthy' | 'degraded' | 'missing' | 'ok' | 'off'; label?: string }) {
  const map = {
    healthy:  { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', default: 'Healthy' },
    ok:       { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', default: 'OK' },
    degraded: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', default: 'Degraded' },
    missing:  { bg: 'bg-red-100',   text: 'text-red-800',   dot: 'bg-red-500',   default: 'Missing' },
    off:      { bg: 'bg-gray-100',  text: 'text-gray-500',  dot: 'bg-gray-400',  default: 'Off' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label ?? s.default}
    </span>
  );
}

function envBadge(ok: boolean) {
  return <Badge status={ok ? 'ok' : 'missing'} />;
}

function statusBadge(s: Status) {
  return <Badge status={s === 'active' ? 'healthy' : s === 'degraded' ? 'degraded' : 'off'} label={s === 'active' ? 'Active' : s === 'degraded' ? 'Degraded' : 'Inactive'} />;
}

function Section({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="flex items-center gap-2 text-gray-800">{children}</span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* ---------- overall score ---------- */

function computeOverall(d: HealthData): { label: string; status: 'healthy' | 'degraded' | 'missing' } {
  const anyCircuitOpen =
    d.circuits && Object.values(d.circuits).some((c) => c.open);
  const anyCircuitHalfOpen =
    d.circuits && Object.values(d.circuits).some((c) => c.state === 'half_open');
  const critical = [d.database.connected, d.ai.status === 'active'];
  if (critical.every(Boolean)) {
    // OPEN blocks traffic; HALF_OPEN allows probe traffic — softer overall signal.
    if (anyCircuitOpen) {
      return { label: 'Degraded — circuit breaker(s) open', status: 'degraded' };
    }
    if (anyCircuitHalfOpen) {
      return {
        label: 'Operational — circuit(s) in half-open recovery (probing upstream)',
        status: 'healthy',
      };
    }
    // RAG / billing gaps affect product completeness; observability tools are informational only.
    const depWarns = [d.rag.status !== 'active', d.billing.status !== 'active'];
    const depCount = depWarns.filter(Boolean).length;
    const softObs = !d.observability.posthog || !d.observability.sentry;
    if (depCount === 0) {
      if (softObs) {
        return {
          label: 'Core paths OK — optional observability (PostHog/Sentry) not fully on',
          status: 'healthy',
        };
      }
      return { label: 'All systems operational', status: 'healthy' };
    }
    if (depCount === 1) {
      return {
        label: 'Operational — one dependency below full strength (RAG or billing)',
        status: 'healthy',
      };
    }
    return { label: 'Multiple dependency gaps (RAG and billing)', status: 'degraded' };
  }
  return { label: 'Service degraded', status: 'missing' };
}

/* ---------- main component ---------- */

export default function HealthDashboard() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      const session = (await supabase?.auth.getSession())?.data?.session;
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch('/api/internal/health', { headers, cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(fetchHealth, 30_000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, fetchHealth]);

  const overall = data ? computeOverall(data) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
              <Link
                href="/internal/operations"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Operations viewer →
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Internal diagnostics — not user-facing</p>
            <p className="text-xs text-gray-500 mt-2 max-w-2xl leading-relaxed">
              <strong className="text-gray-700">Not a global cluster view:</strong> rate limits and circuit breakers are{' '}
              <strong>in-memory per process</strong> — this page shows one replica&apos;s view. Database pings and event samples
              use shared Supabase. Use <strong>Instance ID</strong> (Runtime) to align with <code className="text-[11px] bg-gray-100 px-1 rounded">instance_id</code> in logs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Auto-refresh 30s
            </label>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-2 ring-offset-2 ring-blue-600 transition disabled:opacity-50"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* overall status bar */}
        {overall && (
          <div className={`rounded-xl border px-5 py-3 flex items-center justify-between ${
            overall.status === 'healthy' ? 'bg-green-50 border-green-200' :
            overall.status === 'degraded' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <span className="font-medium text-sm">{overall.label}</span>
            <Badge status={overall.status} />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-4 text-sm" role="alert">
            <strong>Failed to load health data:</strong> {error}
          </div>
        )}

        {data?.meta.internalApiAccess === 'dev_unscoped_override' && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-950 px-4 py-3 text-sm" role="status">
            <strong>Development mode:</strong> <code className="text-xs">INTERNAL_API_ALLOW_UNSCOPED=true</code> is set and{' '}
            <code className="text-xs">ADMIN_EMAILS</code> is empty. Any signed-in user can reach internal diagnostics.
            Remove the override and set <code className="text-xs">ADMIN_EMAILS</code> before production.
          </div>
        )}

        {data && (
          <>
            {/* Auth + Meta row */}
            <div className="grid md:grid-cols-2 gap-5">
              <Section title="Session / Auth" badge={data.auth ? <Badge status="healthy" label="Signed in" /> : <Badge status="missing" label="Not signed in" />}>
                {data.auth ? (
                  <div className="space-y-1 text-sm">
                    <Row label="User ID"><code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{data.auth.id.slice(0, 8)}…</code></Row>
                    <Row label="Email">{data.auth.email}</Row>
                    <Row label="Role"><span className="capitalize font-medium">{data.auth.role}</span></Row>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No active session detected.</p>
                )}
              </Section>

              <Section title="Runtime" badge={<Badge status="ok" label={data.meta.nodeEnv} />}>
                <div className="space-y-1 text-sm">
                  <Row label="NODE_ENV"><code className="font-mono text-xs">{data.meta.nodeEnv}</code></Row>
                  <Row label="Instance ID">
                    <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded break-all">{data.meta.instanceId}</code>
                  </Row>
                  <Row label="Server time">{new Date(data.meta.timestamp).toLocaleString()}</Row>
                  <Row label="Internal API gate">
                    <span className="text-xs font-medium capitalize">
                      {data.meta.internalApiAccess.replace(/_/g, ' ')}
                    </span>
                  </Row>
                  <Row label="Enforcement">
                    <Badge status="healthy" label="Strict (no unscoped access without override)" />
                  </Row>
                  <Row label="Structured logging">{envBadge(data.observability.structuredLogging)}</Row>
                  <Row label="Request IDs">{envBadge(data.observability.requestIds)}</Row>
                </div>
              </Section>
            </div>

            {/* Env configuration */}
            <Section title="Environment Configuration">
              <p className="text-xs text-gray-500 mb-3">Boolean flags only — secret values are never sent to the browser.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                {Object.entries(data.env).map(([key, ok]) => (
                  <div key={key} className="flex items-center gap-2 py-1 text-sm">
                    {envBadge(ok)}
                    <span className="font-mono text-xs text-gray-600 truncate">{key}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Core services 2x2 grid */}
            <div className="grid md:grid-cols-2 gap-5">
              <Section title="Database (Supabase)" badge={<Badge status={data.database.connected ? 'healthy' : 'missing'} label={data.database.connected ? 'Connected' : 'Disconnected'} />}>
                <div className="space-y-1 text-sm">
                  <Row label="Ping latency">
                    {data.database.latencyMs != null
                      ? <span className={data.database.latencyMs > 500 ? 'text-amber-600 font-medium' : ''}>{data.database.latencyMs}ms</span>
                      : <span className="text-gray-400">—</span>
                    }
                  </Row>
                  <Row label="Profile rows">{data.database.tableCount != null ? data.database.tableCount.toLocaleString() : '—'}</Row>
                </div>
              </Section>

              <Section title="AI Provider" badge={statusBadge(data.ai.status)}>
                <div className="space-y-1 text-sm">
                  <Row label="Active provider"><code className="font-mono text-xs">{data.ai.provider}</code></Row>
                  <Row label="Provider key present">{envBadge(data.ai.providerKeyPresent)}</Row>
                  <Row label="Groq ready">{envBadge(data.ai.groqReady)}</Row>
                  <Row label="HuggingFace ready">{envBadge(data.ai.huggingfaceReady)}</Row>
                </div>
              </Section>

              <Section title="RAG Pipeline" badge={statusBadge(data.rag.status)}>
                <div className="space-y-1 text-sm">
                  <Row label="Embeddings (OpenAI)">{envBadge(data.rag.embeddingConfigured)}</Row>
                  <Row label="Vector store (pgvector)">{envBadge(data.rag.vectorStoreConfigured)}</Row>
                  <Row label="Retrieval status">{statusBadge(data.rag.status)}</Row>
                </div>
              </Section>

              <Section title="Billing (Stripe)" badge={statusBadge(data.billing.status)}>
                <div className="space-y-1 text-sm">
                  <Row label="Stripe API configured">{envBadge(data.billing.stripeConfigured)}</Row>
                  <Row label="Webhook signature">{envBadge(data.billing.webhookConfigured)}</Row>
                  <Row label="Billing status">{statusBadge(data.billing.status)}</Row>
                </div>
              </Section>
            </div>

            {/* Observability */}
            <Section title="Observability">
              <p className="text-xs text-gray-500 mb-3">
                PostHog/Sentry are third-party tooling — missing keys do not mean core app routes are down.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">{envBadge(data.observability.posthog)}<span>PostHog analytics</span></div>
                <div className="flex items-center gap-2">{envBadge(data.observability.sentry)}<span>Sentry errors</span></div>
                <div className="flex items-center gap-2">{envBadge(data.observability.structuredLogging)}<span>Structured logging</span></div>
                <div className="flex items-center gap-2">{envBadge(data.observability.requestIds)}<span>Request correlation</span></div>
              </div>
            </Section>

            <Section
              title="Circuit breakers"
              badge={
                <span className="flex flex-wrap gap-2 justify-end items-center">
                  <Badge status="off" label="Instance-scoped" />
                  {data.circuits && Object.values(data.circuits).some((c) => c.state === 'open') ? (
                    <Badge status="degraded" label="Open" />
                  ) : data.circuits && Object.values(data.circuits).some((c) => c.state === 'half_open') ? (
                    <Badge status="degraded" label="Half-open" />
                  ) : (
                    <Badge status="healthy" label="Closed" />
                  )}
                </span>
              }
            >
              <p className="text-xs text-gray-500 mb-3">
                <strong>This process only</strong> — other replicas maintain separate breaker state. <strong>OPEN</strong> blocks upstream until cooldown ends, then{' '}
                <strong>HALF_OPEN</strong> allows probe traffic. A successful probe closes the circuit; <strong>any probe failure reopens it</strong> with a fresh cooldown.
                While <strong>OPEN</strong>, failures/threshold shows the trip level.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs uppercase">
                      <th className="pb-1.5 font-medium">Circuit</th>
                      <th className="pb-1.5 font-medium">State</th>
                      <th className="pb-1.5 font-medium text-right">Failures / threshold</th>
                      <th className="pb-1.5 font-medium text-right">Probes / max</th>
                      <th
                        className="pb-1.5 font-medium text-right"
                        title="OPEN: live remaining cooldown. CLOSED/HALF_OPEN: configured cooldown the next OPEN will use."
                      >
                        Cooldown left
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.circuits ?? {}).map(([name, c]) => {
                      const cooldownDisplaySec =
                        c.state === 'open'
                          ? Math.ceil(c.cooldown_remaining_ms / 1000)
                          : Math.round(c.cooldown_ms / 1000);
                      return (
                        <tr key={name} className="border-t border-gray-100 align-top">
                          <td className="py-1.5 font-mono text-xs text-gray-700">{c.dependency || name}</td>
                          <td className="py-1.5">
                            {c.state === 'open' ? (
                              <span className="text-amber-700 font-medium">OPEN</span>
                            ) : c.state === 'half_open' ? (
                              <span className="text-blue-700 font-medium">HALF_OPEN</span>
                            ) : (
                              <span className="text-green-700">CLOSED</span>
                            )}
                            {c.state === 'open' && c.open_until_iso && (
                              <span className="block text-xs text-gray-500">
                                until {new Date(c.open_until_iso).toLocaleTimeString()}
                              </span>
                            )}
                            {c.state === 'half_open' && c.half_opened_since_iso && (
                              <span className="block text-xs text-gray-500">
                                since {new Date(c.half_opened_since_iso).toLocaleTimeString()}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 text-right text-gray-600">
                            {c.failures_toward_open} / {c.threshold}
                          </td>
                          <td className="py-1.5 text-right text-gray-600 text-xs">
                            {c.state === 'half_open'
                              ? `${c.probe_count} / ${c.max_probe_count}`
                              : '—'}
                          </td>
                          <td className="py-1.5 text-right text-gray-500 text-xs">
                            {c.state === 'open' ? (
                              <span className="text-amber-700 font-medium">{cooldownDisplaySec}s</span>
                            ) : (
                              <span>{cooldownDisplaySec}s</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Rate limiter + Events side by side */}
            <div className="grid lg:grid-cols-2 gap-5">
              <Section
                title="Rate Limiter"
                badge={<Badge status="off" label="Instance-scoped" />}
              >
                <p className="text-xs text-gray-500 mb-2">
                  <strong>This process only</strong> — counters are not shared across replicas; totals cluster-wide are unknown here.
                </p>
                <p className="text-sm text-gray-500 mb-2">Active windows: <strong>{data.rateLimit.activeKeys}</strong></p>
                {data.rateLimit.topKeys.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase">
                          <th className="pb-1.5 font-medium">Key</th>
                          <th className="pb-1.5 font-medium text-right">Requests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rateLimit.topKeys.map((k, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="py-1.5 font-mono text-xs text-gray-600">{k.key}</td>
                            <td className="py-1.5 text-right text-gray-700 font-medium">{k.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No active rate-limit windows</p>
                )}
              </Section>

              <Section title="Event Frequency (last 50)">
                <p className="text-xs text-gray-500 mb-2">
                  <strong>Shared DB</strong> — counts are from Supabase <code className="text-[11px] bg-gray-100 px-1 rounded">app_events</code>, not per-instance.
                </p>
                {Object.keys(data.eventCounts).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase">
                          <th className="pb-1.5 font-medium">Event</th>
                          <th className="pb-1.5 font-medium text-right">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.eventCounts)
                          .sort(([, a], [, b]) => b - a)
                          .map(([name, count]) => (
                            <tr key={name} className="border-t border-gray-100">
                              <td className={`py-1.5 font-mono text-xs ${/fail|error/i.test(name) ? 'text-red-600' : 'text-gray-600'}`}>{name}</td>
                              <td className="py-1.5 text-right text-gray-700 font-medium">{count}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No events recorded yet</p>
                )}
              </Section>
            </div>

            {/* Recent errors */}
            {data.recentErrors.length > 0 && (
              <Section title="Recent Errors / Failures" badge={<Badge status="missing" label={`${data.recentErrors.length} error events`} />}>
                <p className="text-xs text-gray-500 mb-2">
                  <strong>Shared DB</strong> — sample from Supabase, not scoped to Instance ID.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 text-xs uppercase">
                        <th className="pb-1.5 font-medium">Event</th>
                        <th className="pb-1.5 font-medium text-right">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentErrors.map((ev, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-1.5 font-mono text-xs text-red-600">{ev.event_name}</td>
                          <td className="py-1.5 text-right text-gray-500 text-xs">{timeAgo(ev.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Recent events timeline */}
            <Section title="Recent Events">
              <p className="text-xs text-gray-500 mb-2">
                <strong>Shared DB</strong> — timeline is global to the project, not tied to Instance ID.
              </p>
              {data.recentEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 text-xs uppercase">
                        <th className="pb-1.5 font-medium">Event</th>
                        <th className="pb-1.5 font-medium text-right">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentEvents.map((ev, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className={`py-1.5 font-mono text-xs ${/fail|error/i.test(ev.event_name) ? 'text-red-600' : 'text-gray-600'}`}>{ev.event_name}</td>
                          <td className="py-1.5 text-right text-gray-500 text-xs">{timeAgo(ev.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No events recorded yet</p>
              )}
            </Section>

            {/* footer */}
            <p className="text-xs text-gray-400 text-right">
              Last checked: {new Date(data.meta.timestamp).toLocaleString()}
              {' · '}
              Instance: <code className="text-[11px]">{data.meta.instanceId.slice(0, 8)}…</code>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
