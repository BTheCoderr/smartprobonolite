/**
 * CourtListener (Free Law Project) search client.
 *
 * Used by the Research agent as a SECONDARY retrieval source for case-law
 * context. The PRIMARY source remains the curated Rhode Island handbook /
 * workflow materials retrieved from Supabase pgvector.
 *
 * Design rules:
 *   - Disabled by default (`COURTLISTENER_ENABLED=true` to opt in).
 *   - When disabled or missing token, returns [] silently — never throws.
 *   - When enabled and the network call fails (non-2xx, fetch exception,
 *     malformed JSON), THROWS so the Research agent can mark the slice as
 *     `degraded: true` and continue with Supabase RAG only.
 *   - Never logs the query, snippets, or raw user facts. Only counts +
 *     status metadata.
 *
 * Why this matters: CourtListener snippets are search-result excerpts, not
 * full holdings. We treat them as supporting authority only. Safety strips
 * any cited statute that is NOT present in either the curated RAG block or
 * the CourtListener result set so legitimate case-law citations still pass.
 */

const COURTLISTENER_SEARCH_URL = 'https://www.courtlistener.com/api/rest/v3/search/';

export type CourtListenerResult = {
  source: 'courtlistener';
  title: string;
  citation: string | null;
  court: string | null;
  dateFiled: string | null;
  url: string | null;
  snippet: string;
  score: number;
};

export type CourtListenerSearchArgs = {
  query: string;
  jurisdiction: string | null;
  requestId: string;
};

/** True when the operator has explicitly opted in via env. Token is checked at call time. */
export function isCourtListenerEnabled(): boolean {
  return process.env.COURTLISTENER_ENABLED === 'true';
}

function maxResults(): number {
  const raw = Number(process.env.COURTLISTENER_MAX_RESULTS ?? 5);
  if (!Number.isFinite(raw) || raw <= 0) return 5;
  return Math.min(Math.floor(raw), 25);
}

function stripHtml(value: string): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickCitation(raw: unknown): string | null {
  if (Array.isArray(raw)) {
    for (const c of raw) {
      if (typeof c === 'string' && c.trim().length > 0) return c.trim().slice(0, 240);
    }
    return null;
  }
  if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim().slice(0, 240);
  return null;
}

function pickString(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  return t.length > 0 ? t.slice(0, max) : null;
}

function pickAbsoluteUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;
  const path = raw.startsWith('http') ? raw : `https://www.courtlistener.com${raw}`;
  return path.slice(0, 500);
}

/**
 * Search CourtListener opinions.
 *
 * Returns:
 *   - []  when disabled OR the operator has not provided a token
 *           (graceful no-op so the Research agent can keep going with RAG only)
 *
 * Throws:
 *   - on non-2xx responses, fetch exceptions, or malformed JSON
 *           (Research agent catches and flags `courtListener.degraded = true`)
 */
export async function searchCourtListenerCases(
  args: CourtListenerSearchArgs,
): Promise<CourtListenerResult[]> {
  if (!isCourtListenerEnabled()) return [];
  const token = process.env.COURTLISTENER_API_TOKEN?.trim();
  if (!token) return [];

  const cap = maxResults();
  const params = new URLSearchParams({
    q: args.query.slice(0, 800),
    type: 'o',
    order_by: 'score desc',
  });

  const res = await fetch(`${COURTLISTENER_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Token ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`courtlistener_http_${res.status}`);
  }

  const data = (await res.json()) as { results?: unknown[] };
  const rows = Array.isArray(data.results) ? data.results : [];

  const out: CourtListenerResult[] = [];
  for (const row of rows.slice(0, cap)) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const title =
      pickString(r.caseName, 240) ?? pickString(r.caseNameFull, 240) ?? 'CourtListener result';
    out.push({
      source: 'courtlistener',
      title,
      citation: pickCitation(r.citation),
      court: pickString(r.court, 160),
      dateFiled: pickString(r.dateFiled, 40),
      url: pickAbsoluteUrl(r.absolute_url),
      snippet: stripHtml(typeof r.snippet === 'string' ? r.snippet : '').slice(0, 800),
      score: typeof r.score === 'number' && Number.isFinite(r.score) ? r.score : 0,
    });
  }
  return out;
}
