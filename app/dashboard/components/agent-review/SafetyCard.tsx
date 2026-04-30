'use client';

import type { AgentReviewSafety } from './types';
import { KV, Pill, Section, type PillTone } from './parts';

export default function SafetyCard({ safety }: { safety?: AgentReviewSafety }) {
  if (!safety) return null;

  const tone: PillTone =
    safety.decision === 'pass' ? 'good' : safety.decision === 'softened' ? 'warn' : 'bad';

  return (
    <Section
      title="6. Safety"
      pill={
        <>
          <Pill tone={tone}>{safety.decision}</Pill>
          {safety.redactions > 0 && (
            <Pill tone="warn">
              {safety.redactions} redaction{safety.redactions === 1 ? '' : 's'}
            </Pill>
          )}
        </>
      }
      defaultOpen={safety.decision !== 'pass'}
    >
      <KV label="Decision" value={safety.decision} />
      <KV label="Redactions" value={safety.redactions} />
      <div className="mt-2">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Notes
        </p>
        {safety.notes.length === 0 ? (
          <p className="text-xs italic text-gray-400">No rules fired.</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {safety.notes.map((n) => (
              <Pill key={n} tone="warn">
                {n}
              </Pill>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
