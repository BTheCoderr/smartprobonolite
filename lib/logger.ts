/**
 * Lightweight structured JSON logger for API routes.
 * In production, emits single-line JSON (compatible with Vercel/log aggregators).
 * In development, pretty-prints for readability.
 * Swappable later for a log sink (Datadog, Axiom, etc.) by replacing emit().
 */

import type { NextApiRequest } from 'next';
import { HttpError, TimeoutError } from '@/lib/resilience';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { getProcessInstanceId } from '@/lib/runtime/instanceIdentity';
import {
  getInboundRequestIdFromHeaders,
  getInboundRequestIdFromPagesApi,
} from '@/lib/tracing/requestId';

type LogLevel = 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  instance_id?: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === 'development';

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {}),
    instance_id: getProcessInstanceId(),
  };

  const output = isDev ? JSON.stringify(entry, null, 2) : JSON.stringify(entry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Create a logger scoped to a request with an attached requestId.
 */
export function createLogger(requestId?: string) {
  const base: LogMeta = requestId ? { requestId } : {};

  return {
    info: (message: string, meta?: LogMeta) => emit('info', message, { ...base, ...meta }),
    warn: (message: string, meta?: LogMeta) => emit('warn', message, { ...base, ...meta }),
    error: (message: string, meta?: LogMeta) => emit('error', message, { ...base, ...meta }),
  };
}

const logger = createLogger();
export default logger;

/** Delegates to getInboundRequestIdFromPagesApi — middleware sets x-request-id when matched. */
export function getRequestIdFromPagesApi(req: NextApiRequest): string {
  return getInboundRequestIdFromPagesApi(req);
}

/** Delegates to getInboundRequestIdFromHeaders. */
export function getRequestIdFromHeaders(headers: Headers): string {
  return getInboundRequestIdFromHeaders(headers);
}

export function getClientTraceIdFromHeaders(headers: Headers): string | undefined {
  return headers.get('x-client-trace-id')?.trim() || undefined;
}

export function getClientTraceIdFromPagesApi(req: NextApiRequest): string | undefined {
  const raw = req.headers['x-client-trace-id'];
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && typeof v === 'string' ? v.trim() : undefined;
}

/** Safe for logs only — returns Supabase user id from Bearer token, or null. */
export async function resolveSupabaseUserIdFromRequest(req: NextApiRequest): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const authz = req.headers.authorization;
  if (!authz || typeof authz !== 'string' || !authz.startsWith('Bearer ')) return null;
  try {
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(authz.slice(7));
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Safe error shape for logs — capped, no stack dumps by default. */
export function serializeErrorSafe(err: unknown): {
  error_type: string;
  error_message_safe: string;
  error_code?: string;
} {
  if (err instanceof TimeoutError) {
    return { error_type: 'TimeoutError', error_message_safe: 'request_timeout' };
  }
  if (err instanceof HttpError) {
    return {
      error_type: 'HttpError',
      error_code: String(err.status),
      error_message_safe: err.message.slice(0, 200),
    };
  }
  if (err instanceof Error) {
    return {
      error_type: err.name || 'Error',
      error_message_safe: err.message.slice(0, 200),
    };
  }
  return { error_type: 'unknown', error_message_safe: String(err).slice(0, 200) };
}

export type ApiFlowOutcome =
  | 'success'
  | 'client_error'
  | 'rate_limited'
  | 'server_error'
  | 'forbidden';

export type ApiFlowPayload = {
  kind: 'api_flow';
  request_id: string;
  route: string;
  feature: string;
  user_id: string | null;
  outcome: ApiFlowOutcome;
  status_code: number;
  duration_ms: number;
  client_trace_id?: string;
  error_type?: string;
  error_code?: string;
  error_message_safe?: string;
  degraded_mode?: boolean;
  chat_mode?: string;
  message_count?: number;
  ai_provider?: string;
  match_count?: number;
  jurisdiction?: string;
  retrieve_top_k?: number;
  upload_file_bytes?: number;
  upload_mime?: string;
  doc_format?: string;
  health_db_connected?: boolean;
};

/**
 * One structured line per HTTP handling outcome. Never pass user content, prompts, or file text.
 */
export function logApiFlow(payload: ApiFlowPayload) {
  const { request_id, outcome } = payload;
  const level: LogLevel =
    outcome === 'server_error' ? 'error' : outcome === 'success' ? 'info' : 'warn';
  const log = createLogger(request_id);
  log[level]('api_flow', payload as unknown as LogMeta);
}
