/**
 * Allowlisted keys from app_events.properties — never pass through arbitrary client metadata
 * (could contain prompts, document excerpts, PII).
 */
const ALLOWED_KEYS = new Set([
  'outcome',
  'route',
  'feature',
  'request_id',
  'client_trace_id',
  'degraded_mode',
  'degraded',
  'analytics_degraded',
  'status_code',
  'http_status',
  'error_code',
  'error_message_safe',
  'kind',
  'rate_limited',
]);

export type SafeEventProps = Record<string, string | number | boolean>;

export function sanitizeAppEventProperties(raw: unknown): SafeEventProps {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: SafeEventProps = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (typeof v === 'boolean') {
      out[k] = v;
    } else if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = v;
    } else if (typeof v === 'string') {
      out[k] = v.slice(0, 400);
    }
  }
  return out;
}

export type InferredOutcome = 'failure' | 'success' | 'unknown';

/** True when allowlisted props indicate degraded / soft-fail paths (shown separately from inferred outcome). */
export function degradedFromProps(safe: SafeEventProps): boolean {
  return (
    safe.degraded_mode === true ||
    safe.degraded === true ||
    safe.analytics_degraded === true
  );
}

export function inferOperationalOutcome(
  eventName: string,
  safe: SafeEventProps,
): InferredOutcome {
  const name = eventName.toLowerCase();
  const failName =
    /fail|error|exception|timeout|denied|forbidden|429|unauthorized|rate[-_]limit|rate_limit/i.test(
      name,
    );
  const outcome = typeof safe.outcome === 'string' ? safe.outcome.toLowerCase() : '';
  const outcomeFail = [
    'error',
    'forbidden',
    'failure',
    'timeout',
    'denied',
    'client_error',
    'server_error',
    'rate_limited',
  ].includes(outcome);
  const outcomeOk = ['success', 'ok'].includes(outcome);
  const sc =
    typeof safe.status_code === 'number'
      ? safe.status_code
      : typeof safe.http_status === 'number'
        ? safe.http_status
        : null;
  const rateLimited = safe.rate_limited === true;

  if (failName || outcomeFail || rateLimited || (sc != null && sc >= 400)) {
    return 'failure';
  }
  if (outcomeOk || (sc != null && sc > 0 && sc < 400)) {
    return 'success';
  }
  return 'unknown';
}
