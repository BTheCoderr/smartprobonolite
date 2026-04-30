'use client';

import { AGENT_DISPLAY, AGENT_ORDER, type AgentName } from '@/lib/agents/streaming';

export type AgentStatus = 'queued' | 'running' | 'done' | 'skipped' | 'degraded';

export type AgentProgressMap = Record<AgentName, AgentStatus>;

export function emptyProgress(): AgentProgressMap {
  return {
    intake: 'running',
    research: 'queued',
    analysis: 'queued',
    document: 'queued',
    strategy: 'queued',
    safety: 'queued',
  };
}

const STATUS_STYLES: Record<AgentStatus, { dot: string; label: string }> = {
  queued: { dot: 'bg-gray-300', label: 'text-gray-400' },
  running: { dot: 'bg-spb-blue animate-pulse', label: 'text-spb-blue font-medium' },
  done: { dot: 'bg-emerald-500', label: 'text-gray-700' },
  degraded: { dot: 'bg-amber-500', label: 'text-amber-700' },
  skipped: { dot: 'bg-gray-200 ring-1 ring-gray-300', label: 'text-gray-400 italic' },
};

interface AgentStreamProgressProps {
  progress: AgentProgressMap;
}

/**
 * Inline stepper that replaces the typing dots while the multi-agent graph
 * runs. Shows each of the six agents with a color-coded status, so the user
 * can see the system thinking through the case in real time instead of
 * staring at a single spinner for 10-30 seconds.
 *
 * The conditional `document` step renders as 'skipped' (gray, italic) when
 * Analysis recommends inform/escalate instead of draft.
 */
export default function AgentStreamProgress({ progress }: AgentStreamProgressProps) {
  return (
    <div className="bg-white text-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200 max-w-full">
      <p className="text-xs font-medium text-gray-500 mb-2">Working through your case…</p>
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {AGENT_ORDER.map((agent, idx) => {
          const status = progress[agent];
          const style = STATUS_STYLES[status];
          return (
            <li key={agent} className="flex items-center gap-1.5 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${style.dot}`}
                aria-hidden="true"
              />
              <span className={style.label}>{AGENT_DISPLAY[agent]}</span>
              {idx < AGENT_ORDER.length - 1 && (
                <span className="text-gray-300" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
