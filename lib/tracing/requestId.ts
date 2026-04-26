import { randomUUID } from 'crypto';
import type { NextApiRequest } from 'next';

/** Lowercase names for Web Headers API (case-insensitive on read). */
export const REQUEST_ID_HEADER = 'x-request-id';
export const CLIENT_TRACE_HEADER = 'x-client-trace-id';

/**
 * Inbound correlation id: prefer middleware/proxy `x-request-id`, then client `x-client-trace-id`,
 * then a new UUID (e.g. script or webhook with no headers).
 */
export function getInboundRequestIdFromHeaders(headers: Headers): string {
  return (
    headers.get(REQUEST_ID_HEADER)?.trim() ||
    headers.get(CLIENT_TRACE_HEADER)?.trim() ||
    randomUUID()
  );
}

/** Same semantics as getInboundRequestIdFromHeaders for Pages Router (`IncomingHttpHeaders`). */
export function getInboundRequestIdFromPagesApi(req: NextApiRequest): string {
  const raw = req.headers[REQUEST_ID_HEADER] ?? req.headers[CLIENT_TRACE_HEADER];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && typeof v === 'string' && v.trim()) return v.trim();
  return randomUUID();
}

/** Single entry for App Router `Request` or Pages `NextApiRequest`. */
export function getInboundRequestId(req: Request | NextApiRequest): string {
  if (typeof Request !== 'undefined' && req instanceof Request) {
    return getInboundRequestIdFromHeaders(req.headers);
  }
  return getInboundRequestIdFromPagesApi(req as NextApiRequest);
}
