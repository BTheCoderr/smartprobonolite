'use client';

import type { AgentReviewAnalysis } from './types';
import { BulletList, Pill, Section, type PillTone } from './parts';

export default function AnalysisCard({ analysis }: { analysis?: AgentReviewAnalysis }) {
  if (!analysis) return null;

  const tone: PillTone =
    analysis.recommendation === 'escalate'
      ? 'bad'
      : analysis.recommendation === 'draft'
        ? 'info'
        : 'neutral';

  return (
    <Section title="3. Case Analysis" pill={<Pill tone={tone}>{analysis.recommendation}</Pill>}>
      <p className="whitespace-pre-wrap text-xs text-gray-800">
        {analysis.applicability || <span className="italic text-gray-400">—</span>}
      </p>
      <div className="mt-2">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Open questions for staff
        </p>
        <BulletList items={analysis.openQuestions} />
      </div>
    </Section>
  );
}
