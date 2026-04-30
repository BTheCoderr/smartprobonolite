'use client';

import { useState } from 'react';
import type { AgentReview } from './types';
import { Pill, type PillTone } from './parts';
import FactsCard from './FactsCard';
import ResearchCard from './ResearchCard';
import AnalysisCard from './AnalysisCard';
import DraftCard from './DraftCard';
import StrategyCard from './StrategyCard';
import SafetyCard from './SafetyCard';
import DegradationStrip from './DegradationStrip';

/**
 * Internal Agent Case Review panel.
 *
 * Mounts under any assistant message whose `/api/chat` response carried an
 * `agentReview` payload (i.e. the six-agent LangGraph branch ran). Collapsed
 * by default. Each agent slice owns its own card.
 *
 * Intentionally NOT a public route — this is staff/dev observability only,
 * gated by the existing `AGENTS_DEFAULT_ON` env / `use_agents` request flag.
 */
export default function AgentReviewPanel({ review }: { review?: AgentReview }) {
  const [open, setOpen] = useState(false);
  if (!review) return null;

  const safetyTone: PillTone | undefined = review.safety
    ? review.safety.decision === 'pass'
      ? 'good'
      : review.safety.decision === 'softened'
        ? 'warn'
        : 'bad'
    : undefined;

  return (
    <section
      className="mt-2 w-full rounded-lg border border-indigo-200 bg-indigo-50/40"
      aria-label="Agent case review (internal)"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Agent Case Review
          </span>
          <span className="text-[10px] text-indigo-600/70">internal</span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {review.safety && safetyTone && (
            <Pill tone={safetyTone}>{review.safety.decision}</Pill>
          )}
          {review.degraded && <Pill tone="warn">degraded</Pill>}
          {review.usedProvider && <Pill tone="info">{review.usedProvider}</Pill>}
          {review.intent && <Pill tone="neutral">{review.intent}</Pill>}
          <span
            className={`ml-1 text-indigo-500 transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ▶
          </span>
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-indigo-200 px-3 py-3">
          <p className="text-[10px] italic text-indigo-700/70">
            Visible to staff/devs. Per-agent slices from the six-agent LangGraph that produced
            this reply.
          </p>
          <DegradationStrip degraded={review.degraded} degradation={review.degradation} />
          <FactsCard facts={review.facts} />
          <ResearchCard research={review.research} />
          <AnalysisCard analysis={review.analysis} />
          <DraftCard draft={review.draft} />
          <StrategyCard strategy={review.strategy} />
          <SafetyCard safety={review.safety} />
        </div>
      )}
    </section>
  );
}
