/**
 * Simple in-memory sliding-window rate limiter for Next.js API routes.
 * Not shared across serverless instances — provides per-instance protection.
 * For production at scale, swap for Redis/Vercel KV.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

export function checkRateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number },
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count < maxRequests) {
    entry.count += 1;
    return { allowed: true };
  }

  return { allowed: false, retryAfterMs: entry.resetAt - now };
}

/**
 * Derive a rate-limit key from a Next.js Pages API request.
 * Uses x-forwarded-for (Vercel / reverse proxy) or falls back to socket address.
 */
export function ipFromRequest(
  req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } },
): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd[0]) return fwd[0].split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

/**
 * Derive a rate-limit key from an App Router `Request` (Web Fetch API headers).
 */
export function ipFromHeaders(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Snapshot of rate limiter state for the health dashboard.
 */
export function getRateLimitStats(): { activeKeys: number; entries: Array<{ key: string; count: number; resetAt: number }> } {
  cleanup();
  const entries: Array<{ key: string; count: number; resetAt: number }> = [];
  for (const [key, entry] of store) {
    entries.push({ key, count: entry.count, resetAt: entry.resetAt });
  }
  return { activeKeys: store.size, entries };
}
