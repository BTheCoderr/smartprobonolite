'use client';

import type { AgentReviewResearch } from './types';
import { KV, Pill, Section, type PillTone } from './parts';

export default function ResearchCard({ research }: { research?: AgentReviewResearch }) {
  if (!research) return null;

  const tone: PillTone = research.degraded
    ? 'warn'
    : research.ragMatchCount > 0
      ? 'good'
      : 'neutral';
  const label = research.degraded
    ? 'degraded'
    : research.ragMatchCount > 0
      ? `${research.ragMatchCount} match${research.ragMatchCount === 1 ? '' : 'es'}`
      : 'no matches';

  return (
    <Section title="2. Research (RAG)" pill={<Pill tone={tone}>{label}</Pill>}>
      <dl>
        <KV label="Matches" value={research.ragMatchCount} />
        <KV label="Reason" value={research.reason ?? null} />
      </dl>

      {research.citations && research.citations.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Citations
          </p>
          <ol className="space-y-1">
            {research.citations.map((c) => (
              <li
                key={c.index}
                className="rounded border border-gray-200 bg-gray-50 px-2 py-1"
              >
                <p className="text-xs font-medium text-gray-800">
                  [{c.index}] {c.title}
                </p>
                <p className="text-[11px] text-gray-600">
                  {c.source}
                  {c.topic ? ` — ${c.topic}` : ''}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {research.ragBlockExcerpt && (
        <div className="mt-2">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Retrieved block (excerpt)
          </p>
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-gray-50 p-2 text-[11px] text-gray-700">
            {research.ragBlockExcerpt}
          </pre>
        </div>
      )}
    </Section>
  );
}
