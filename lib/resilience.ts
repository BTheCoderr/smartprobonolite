/**
 * Lightweight resilience utilities: timeout-aware fetch and retry with backoff.
 * Works in both browser and Node 18+ (AbortController is global in both).
 */

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * fetch() with an automatic AbortController timeout.
 * Throws TimeoutError if the request does not complete within `timeoutMs`.
 */
export async function fetchWithTimeout(
  url: string | URL | Request,
  init: RequestInit = {},
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new TimeoutError(timeoutMs);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof TypeError) return true; // network failure
  if (error instanceof HttpError) return error.status >= 500;
  return false;
}

/**
 * Retry an async function with capped exponential backoff.
 * Returns the first successful result or throws the last error.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 2, baseDelayMs = 500, shouldRetry = defaultShouldRetry } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts || !shouldRetry(err, attempt)) throw err;
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), 5000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

/**
 * Race a promise against a timeout. Useful for SDK calls that don't accept AbortSignal.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Check if an error is a TimeoutError for user-friendly messaging.
 */
export function isTimeoutError(err: unknown): err is TimeoutError {
  return err instanceof TimeoutError || (err instanceof Error && err.name === 'TimeoutError');
}
