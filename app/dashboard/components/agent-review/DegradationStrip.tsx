'use client';

import type { AgentReviewDegradation } from './types';
import { Pill, type PillTone } from './parts';

export default function DegradationStrip({
  degraded,
  degradation,
}: {
  degraded?: boolean;
  degradation?: AgentReviewDegradation;
}) {
  const items: Array<{ label: string; tone: PillTone }> = [];
  if (degradation?.llm) items.push({ label: 'LLM down', tone: 'bad' });
  if (degradation?.rag) items.push({ label: 'RAG degraded', tone: 'warn' });
  if (degradation?.rag_circuit_open) items.push({ label: 'RAG circuit open', tone: 'bad' });
  if (degraded && items.length === 0) items.push({ label: 'degraded', tone: 'warn' });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/60 px-2 py-1.5">
      <span className="text-[11px] font-medium text-amber-900">Degraded path:</span>
      {items.map((it) => (
        <Pill key={it.label} tone={it.tone}>
          {it.label}
        </Pill>
      ))}
    </div>
  );
}
