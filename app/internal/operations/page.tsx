'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type InferredOutcome = 'failure' | 'success' | 'unknown';

type OpsEvent = {
  id: string;
  created_at: string;
  event_name: string;
  user_id: string | null;
  inferred_outcome: InferredOutcome;
  degraded: boolean;
  safe_properties: Record<string, string | number | boolean>;
};

type OpsData = {
  filter: string;
  limit: number;
  events: OpsEvent[];
  failuresByRoute: Record<string, number>;
  rateLimit: { activeKeys: number; topKeys: Array<{ key: string; count: number }> };
  meta: {
    timestamp: string;
    instanceId: string;
    instanceScopeNote: 'in_memory_per_process';
    internalApiAccess: 'admin_allowlist' | 'dev_unscoped_override';
    internalApiEnforcement: 'strict';
    notes: string[];
  };
};

const FILTERS = ['all', 'failures', 'success', 'unknown'] as const;
type Filter = (typeof FILTERS)[number];

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function outcomeBadge(o: InferredOutcome) {
  if (o === 'failure') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        failure
      </span>
    );
  }
  if (o === 'success') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        success
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      unknown
    </span>
  );
}

function shortId(id: string | null): string {
  if (!id) return '—';
  return `${id.slice(0, 8)}…`;
}

function pickRequestId(safe: OpsEvent['safe_properties']): string {
  const a = safe.request_id;
  const b = safe.client_trace_id;
  const v = (typeof a === 'string' && a) || (typeof b === 'string' && b);
  if (!v) return '—';
  return v.length > 14 ? `${v.slice(0, 8)}…` : v;
}

export default function InternalOperationsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [data, setData] = useState<OpsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      const session = (await supabase?.auth.getSession())?.data.session;
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const q = new URLSearchParams({ filter, limit: '100' });
      const res = await fetch(`/api/internal/operations?${q}`, { headers, cache: 'no-store' });
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
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
              <Link
                href="/internal/health"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← System health
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Recent app_events (shared DB) and rate-limit snapshot (<strong>this instance only</strong>) — admin only.
              No log tail, no legal content. Match <code className="text-[11px] bg-gray-100 px-1 rounded">instance_id</code> in logs to this view.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-gray-600">
              Filter{' '}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                className="ml-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
              >
                {FILTERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {data?.meta.internalApiAccess === 'dev_unscoped_override' && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-950 px-4 py-3 text-sm" role="status">
            <strong>Development mode:</strong> <code className="text-xs">INTERNAL_API_ALLOW_UNSCOPED=true</code> without{' '}
            <code className="text-xs">ADMIN_EMAILS</code>. Use admin allowlist in production.
          </div>
        )}

        {data?.meta.notes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950 space-y-1">
            <p className="font-semibold">Data scope</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {data.meta.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-4 text-sm" role="alert">
            {error}
          </div>
        )}

        {data && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Recent events
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  <span className="inline-block rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mr-1">
                    Shared DB
                  </span>
                  Rows are global <code className="text-[11px]">app_events</code>, not per-instance.{' '}
                  <strong>Deg.</strong> is from allowlisted properties only — see System health for breakers on this instance.
                </p>
                {data.events.length > 0 ? (
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                          <th className="pb-2 pr-2 font-medium">When</th>
                          <th className="pb-2 pr-2 font-medium">Event</th>
                          <th className="pb-2 pr-2 font-medium">Outcome</th>
                          <th className="pb-2 pr-2 font-medium">Route / feature</th>
                          <th className="pb-2 pr-2 font-medium">Req</th>
                          <th className="pb-2 pr-2 font-medium">User</th>
                          <th className="pb-2 font-medium">Deg.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.events.map((ev) => {
                          const route =
                            typeof ev.safe_properties.route === 'string'
                              ? ev.safe_properties.route
                              : '';
                          const feature =
                            typeof ev.safe_properties.feature === 'string'
                              ? ev.safe_properties.feature
                              : '';
                          const rf = [route, feature].filter(Boolean).join(' · ') || '—';
                          return (
                            <tr key={ev.id} className="border-t border-gray-50">
                              <td className="py-2 pr-2 text-gray-500 text-xs whitespace-nowrap">
                                {timeAgo(ev.created_at)}
                              </td>
                              <td className="py-2 pr-2 font-mono text-xs text-gray-800 max-w-[200px] truncate">
                                {ev.event_name}
                              </td>
                              <td className="py-2 pr-2">{outcomeBadge(ev.inferred_outcome)}</td>
                              <td
                                className="py-2 pr-2 font-mono text-xs text-gray-600 max-w-[180px] truncate"
                                title={rf}
                              >
                                {rf}
                              </td>
                              <td className="py-2 pr-2 font-mono text-xs text-gray-500">
                                {pickRequestId(ev.safe_properties)}
                              </td>
                              <td className="py-2 pr-2 font-mono text-xs text-gray-500">
                                {shortId(ev.user_id)}
                              </td>
                              <td className="py-2 text-xs">{ev.degraded ? 'Y' : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No rows for this filter (or no data in app_events yet).
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Failures by route
                </h2>
                {Object.keys(data.failuresByRoute).length > 0 ? (
                  <ul className="text-sm space-y-2">
                    {Object.entries(data.failuresByRoute)
                      .sort(([, a], [, b]) => b - a)
                      .map(([route, n]) => (
                        <li key={route} className="flex justify-between gap-2">
                          <span className="font-mono text-xs text-gray-700 truncate" title={route}>
                            {route}
                          </span>
                          <span className="text-red-700 font-medium shrink-0">{n}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No inferred failures in the fetched window.
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Counts use the same sample as the table (last {data.limit} events from DB before
                  filter). Inferred from names + allowlisted fields only.
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Rate limiter
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  <span className="inline-block rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mr-1">
                    Instance-scoped
                  </span>
                  In-memory per process — not a cluster-wide count.
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Active keys: <strong>{data.rateLimit.activeKeys}</strong>
                </p>
                {data.rateLimit.topKeys.length > 0 ? (
                  <ul className="text-sm space-y-1.5">
                    {data.rateLimit.topKeys.map((k, i) => (
                      <li key={i} className="flex justify-between gap-2 font-mono text-xs">
                        <span className="text-gray-600 truncate">{k.key}</span>
                        <span className="text-gray-800 font-medium shrink-0">{k.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No counters yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {data && (
          <p className="text-xs text-gray-400 text-right">
            Server: {new Date(data.meta.timestamp).toLocaleString()} · Instance:{' '}
            <code className="text-[11px]">{data.meta.instanceId.slice(0, 8)}…</code> · Access:{' '}
            {data.meta.internalApiAccess} · {data.meta.internalApiEnforcement}
          </p>
        )}
      </div>
    </div>
  );
}
