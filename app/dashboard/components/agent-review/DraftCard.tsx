'use client';

import type { AgentReviewDraft } from './types';
import { Pill, Section } from './parts';

export default function DraftCard({ draft }: { draft?: AgentReviewDraft }) {
  if (!draft) return null;
  return (
    <Section title="4. Draft" pill={<Pill tone="info">{draft.type}</Pill>}>
      <p className="text-xs font-semibold text-gray-900">{draft.title}</p>
      <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap break-words rounded bg-gray-50 p-2 text-xs text-gray-800">
        {draft.body}
      </pre>
    </Section>
  );
}
