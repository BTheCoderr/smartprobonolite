/**
 * Merge & rank research sources for the Research agent.
 *
 * Inputs:
 *   - ragBlock: curated Rhode Island handbook chunks (PRIMARY source)
 *   - courtListenerResults: case-law results from CourtListener (SECONDARY)
 *
 * Output: a single text block formatted for the Research LLM. The PRIMARY
 * block is presented first, then the SECONDARY block, separated by a clear
 * divider. We deliberately label the sections so the Research prompt's
 * "prefer curated RI materials" rule has a stable anchor.
 *
 * Dedupe:
 *   - CourtListener entries are deduped by URL when available, otherwise
 *     by (title + citation) signature. CourtListener may return duplicate
 *     opinion variants (e.g. headnotes vs full opinion); we keep the first
 *     occurrence (highest-scoring, since the agent already requested
 *     `order_by=score desc`).
 */

import type { CourtListenerResult } from '@/lib/agents/courtListener';

export type MergeArgs = {
  ragBlock: string;
  courtListenerResults: CourtListenerResult[];
};

function dedupe(results: CourtListenerResult[]): CourtListenerResult[] {
  const seen = new Set<string>();
  const out: CourtListenerResult[] = [];
  for (const r of results) {
    const key = (r.url || `${r.title}|${r.citation ?? ''}`).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function formatCourtListenerBlock(results: CourtListenerResult[]): string {
  if (results.length === 0) return '';
  return results
    .map((r, i) => {
      const lines: Array<string | null> = [
        `[CourtListener ${i + 1}]`,
        `Title: ${r.title}`,
        r.citation ? `Citation: ${r.citation}` : null,
        r.court ? `Court: ${r.court}` : null,
        r.dateFiled ? `Date filed: ${r.dateFiled}` : null,
        r.url ? `URL: ${r.url}` : null,
        r.snippet ? `Snippet: ${r.snippet}` : null,
      ];
      return lines.filter((l): l is string => l !== null).join('\n');
    })
    .join('\n\n');
}

/**
 * Build the merged research text block. Returns an empty string when both
 * sources are empty so the Research agent can detect "no grounding at all"
 * and skip the LLM payload.
 */
export function mergeResearchSources({
  ragBlock,
  courtListenerResults,
}: MergeArgs): string {
  const ragSection = ragBlock.trim();
  const courtSection = formatCourtListenerBlock(dedupe(courtListenerResults));

  const sections: string[] = [];
  if (ragSection) {
    sections.push(`PRIMARY — Curated Rhode Island materials:\n${ragSection}`);
  }
  if (courtSection) {
    sections.push(`SECONDARY — CourtListener case-law results:\n${courtSection}`);
  }
  return sections.join('\n\n---\n\n');
}
