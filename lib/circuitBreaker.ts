/**
 * In-memory circuit breaker.
 *
 * State machine:
 *   CLOSED → (failures >= threshold) → OPEN
 *   OPEN → (cooldown elapsed) → HALF_OPEN     [logs circuit_half_opened]
 *   HALF_OPEN → (probe success) → CLOSED       [logs circuit_closed]
 *   HALF_OPEN → (probe failure) → OPEN         [logs circuit_probe_failed + circuit_opened]
 *
 * Per serverless instance only (same limitation as the rate limiter).
 * Strict probe policy: any probe failure reopens immediately. `halfOpenMaxProbes`
 * is a documented safety cap so probe attempts cannot grow unbounded.
 */

import { createLogger } from '@/lib/logger';
import { getProcessInstanceId } from '@/lib/runtime/instanceIdentity';

export const CIRCUIT_NAMES = {
  RAG_PIPELINE: 'rag_pipeline',
  GROQ_LLM: 'groq_llm',
  HUGGINGFACE_LLM: 'huggingface_llm',
  ANALYTICS_WRITE: 'analytics_write',
} as const;

export type CircuitName = (typeof CIRCUIT_NAMES)[keyof typeof CIRCUIT_NAMES];

export type CircuitBreakerState = 'closed' | 'open' | 'half_open';

export type CircuitConfig = {
  failureThreshold: number;
  cooldownMs: number;
  /**
   * Safety cap on probe outcomes recorded inside a single HALF_OPEN window.
   * In the strict policy the first probe failure reopens the circuit, so this
   * cap mainly exists as a defensive bound and as documentation in snapshots.
   */
  halfOpenMaxProbes: number;
};

/** Conservative defaults: a few consecutive failures trip; cool down; then a single probe gates recovery. */
export const CIRCUIT_CONFIG: Record<CircuitName, CircuitConfig> = {
  [CIRCUIT_NAMES.RAG_PIPELINE]: { failureThreshold: 5, cooldownMs: 45_000, halfOpenMaxProbes: 3 },
  [CIRCUIT_NAMES.GROQ_LLM]: { failureThreshold: 4, cooldownMs: 30_000, halfOpenMaxProbes: 3 },
  [CIRCUIT_NAMES.HUGGINGFACE_LLM]: { failureThreshold: 4, cooldownMs: 60_000, halfOpenMaxProbes: 3 },
  [CIRCUIT_NAMES.ANALYTICS_WRITE]: { failureThreshold: 10, cooldownMs: 120_000, halfOpenMaxProbes: 3 },
};

type Entry = {
  failures: number;
  openUntil: number;
  halfOpen: boolean;
  /** Probe outcomes (success or failure) recorded since entering HALF_OPEN. */
  probeCount: number;
  /** Wall-clock ms when the entry transitioned OPEN→HALF_OPEN, or 0. */
  halfOpenedSinceMs: number;
};

const store = new Map<string, Entry>();

function defaultEntry(): Entry {
  return { failures: 0, openUntil: 0, halfOpen: false, probeCount: 0, halfOpenedSinceMs: 0 };
}

function get(name: string): Entry {
  return store.get(name) ?? defaultEntry();
}

function set(name: string, e: Entry) {
  store.set(name, e);
}

/**
 * If OPEN cooldown has elapsed, transition to HALF_OPEN exactly once.
 * Emits `circuit_half_opened` only on the actual edge (subsequent calls won't re-emit
 * because openUntil is cleared as part of the transition).
 */
function normalizeAfterCooldown(
  name: string,
  e: Entry,
  now: number,
  cfg: CircuitConfig,
  requestId?: string,
): Entry {
  if (e.openUntil > 0 && now >= e.openUntil) {
    const next: Entry = {
      failures: 0,
      openUntil: 0,
      halfOpen: true,
      probeCount: 0,
      halfOpenedSinceMs: now,
    };
    set(name, next);
    createLogger(requestId).info('circuit_half_opened', {
      dependency: name,
      previous_state: 'open',
      max_probe_count: cfg.halfOpenMaxProbes,
      cooldown_ms: cfg.cooldownMs,
      half_opened_since: new Date(now).toISOString(),
    });
    return next;
  }
  return e;
}

function deriveState(e: Entry, now: number): CircuitBreakerState {
  if (e.openUntil > 0 && now < e.openUntil) return 'open';
  if (e.halfOpen) return 'half_open';
  return 'closed';
}

/** True while OPEN — callers should skip upstream. HALF_OPEN returns false (probes allowed). */
export function circuitIsOpen(name: CircuitName, _config: CircuitConfig): boolean {
  const cfg = CIRCUIT_CONFIG[name];
  const now = Date.now();
  let e = get(name);
  if (e.openUntil > 0 && now < e.openUntil) return true;
  e = normalizeAfterCooldown(name, e, now, cfg);
  return deriveState(e, now) === 'open';
}

export function circuitRecordSuccess(name: CircuitName, requestId?: string): void {
  const cfg = CIRCUIT_CONFIG[name];
  const now = Date.now();
  let e = get(name);
  if (e.openUntil > 0 && now < e.openUntil) return;

  e = normalizeAfterCooldown(name, e, now, cfg, requestId);

  if (e.halfOpen) {
    const probeAttempt = e.probeCount + 1;
    set(name, defaultEntry());
    createLogger(requestId).info('circuit_closed', {
      dependency: name,
      previous_state: 'half_open',
      probe_attempt: probeAttempt,
      max_probe_count: cfg.halfOpenMaxProbes,
    });
    return;
  }

  set(name, defaultEntry());
}

export function circuitRecordFailure(
  name: CircuitName,
  config: CircuitConfig,
  requestId?: string,
): void {
  const now = Date.now();
  let e = get(name);
  if (e.openUntil > 0 && now < e.openUntil) return;

  e = normalizeAfterCooldown(name, e, now, config, requestId);

  if (e.halfOpen) {
    const probeAttempt = e.probeCount + 1;
    const openUntil = now + config.cooldownMs;
    set(name, {
      failures: 0,
      openUntil,
      halfOpen: false,
      probeCount: 0,
      halfOpenedSinceMs: 0,
    });
    createLogger(requestId).warn('circuit_probe_failed', {
      dependency: name,
      probe_attempt: probeAttempt,
      max_probe_count: config.halfOpenMaxProbes,
    });
    createLogger(requestId).warn('circuit_opened', {
      dependency: name,
      previous_state: 'half_open',
      reopened_from: 'half_open',
      cooldown_ms: config.cooldownMs,
      cooldown_remaining_ms: config.cooldownMs,
      open_until: new Date(openUntil).toISOString(),
    });
    return;
  }

  const failures = e.failures + 1;
  if (failures >= config.failureThreshold) {
    const openUntil = now + config.cooldownMs;
    set(name, {
      failures: 0,
      openUntil,
      halfOpen: false,
      probeCount: 0,
      halfOpenedSinceMs: 0,
    });
    createLogger(requestId).warn('circuit_opened', {
      dependency: name,
      previous_state: 'closed',
      cooldown_ms: config.cooldownMs,
      cooldown_remaining_ms: config.cooldownMs,
      open_until: new Date(openUntil).toISOString(),
    });
  } else {
    set(name, {
      failures,
      openUntil: 0,
      halfOpen: false,
      probeCount: 0,
      halfOpenedSinceMs: 0,
    });
  }
}

export function isRetryableUpstreamStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

export type CircuitSnapshotEntry = {
  dependency: CircuitName;
  instance_id: string;
  state: CircuitBreakerState;
  /** True only in OPEN (hard block). */
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

export function getCircuitSnapshot(): Record<CircuitName, CircuitSnapshotEntry> {
  const out = {} as Record<CircuitName, CircuitSnapshotEntry>;
  const now = Date.now();
  const instanceId = getProcessInstanceId();
  for (const name of Object.values(CIRCUIT_NAMES)) {
    const cfg = CIRCUIT_CONFIG[name];
    let e = get(name);
    e = normalizeAfterCooldown(name, e, now, cfg);
    const state = deriveState(e, now);
    const isOpen = state === 'open';
    const cooldownRemaining = isOpen ? Math.max(0, e.openUntil - now) : 0;
    out[name] = {
      dependency: name,
      instance_id: instanceId,
      state,
      open: isOpen,
      open_until_iso: isOpen ? new Date(e.openUntil).toISOString() : null,
      failures_toward_open: isOpen
        ? cfg.failureThreshold
        : state === 'closed'
          ? e.failures
          : 0,
      threshold: cfg.failureThreshold,
      probe_count: state === 'half_open' ? e.probeCount : 0,
      max_probe_count: cfg.halfOpenMaxProbes,
      cooldown_ms: cfg.cooldownMs,
      cooldown_remaining_ms: cooldownRemaining,
      half_opened_since_iso:
        state === 'half_open' && e.halfOpenedSinceMs > 0
          ? new Date(e.halfOpenedSinceMs).toISOString()
          : null,
    };
  }
  return out;
}
