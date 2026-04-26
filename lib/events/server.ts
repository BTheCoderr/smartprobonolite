import { supabaseAdmin } from '@/lib/supabaseClient';
import {
  CIRCUIT_CONFIG,
  CIRCUIT_NAMES,
  circuitIsOpen,
  circuitRecordFailure,
  circuitRecordSuccess,
} from '@/lib/circuitBreaker';
import { createLogger } from '@/lib/logger';

export type AppEventBody = {
  event_name?: string;
  event_type?: string;
  properties?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export function parseAppEventBody(body: AppEventBody) {
  const event_name = body.event_name ?? body.event_type;
  const properties = body.properties ?? body.metadata ?? {};
  return { event_name, properties };
}

export type InsertAppEventResult =
  | { ok: true }
  | { ok: true; skipped: true; reason: 'circuit_open' }
  | { ok: true; soft_fail: true; reason: 'db_error' }
  | { ok: false; message: string };

export async function insertAppEvent(params: {
  event_name: string;
  properties: Record<string, unknown>;
  userId: string | null;
  /** Correlates circuit + insert logs with the HTTP request when provided. */
  requestId?: string;
  /** Browser/client trace from x-client-trace-id — server wins on merge into properties. */
  clientTraceId?: string;
}): Promise<InsertAppEventResult> {
  if (!supabaseAdmin) {
    return { ok: false, message: 'Server misconfigured' };
  }

  const cname = CIRCUIT_NAMES.ANALYTICS_WRITE;
  const cfg = CIRCUIT_CONFIG[cname];
  if (circuitIsOpen(cname, cfg)) {
    return { ok: true, skipped: true, reason: 'circuit_open' };
  }

  const baseProps = { ...(params.properties ?? {}) };
  if (params.requestId) baseProps.request_id = params.requestId;
  if (params.clientTraceId) baseProps.client_trace_id = params.clientTraceId;

  const { error } = await supabaseAdmin.from('app_events').insert({
    user_id: params.userId,
    event_name: params.event_name,
    properties: baseProps,
  });

  if (error) {
    circuitRecordFailure(cname, cfg, params.requestId);
    createLogger(params.requestId).warn('app_events_insert_failed', {
      feature: 'analytics',
      error_code: error.code,
      error_message_safe: (error.message || 'insert_error').slice(0, 200),
    });
    return { ok: true, soft_fail: true, reason: 'db_error' };
  }

  circuitRecordSuccess(cname);
  return { ok: true };
}

export async function resolveUserIdFromAuthHeader(authHeader: string | null | undefined): Promise<string | null> {
  if (!supabaseAdmin || !authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  return user?.id ?? null;
}
