'use client';

import type { AgentReviewFacts } from './types';
import { BulletList, KV, Pill, Section, type PillTone } from './parts';

export default function FactsCard({ facts }: { facts?: AgentReviewFacts }) {
  if (!facts) return null;

  const urgencyTone: PillTone =
    facts.urgency_level === 'high'
      ? 'bad'
      : facts.urgency_level === 'medium'
        ? 'warn'
        : facts.urgency_level === 'low'
          ? 'good'
          : 'neutral';

  const pill = (
    <>
      {facts.urgency_level && <Pill tone={urgencyTone}>{facts.urgency_level} urgency</Pill>}
      {facts.missing_info.length > 0 && (
        <Pill tone="warn">missing {facts.missing_info.length}</Pill>
      )}
    </>
  );

  return (
    <Section title="1. Intake (facts)" pill={pill}>
      <dl>
        <KV label="State" value={facts.state} />
        <KV label="Legal issue" value={facts.legal_issue} />
        <KV label="Timeline" value={facts.timeline} />
        <KV label="Urgency" value={facts.urgency_level} />
        <KV label="Summary" value={facts.summary} />
      </dl>
      <div className="mt-2">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Key facts
        </p>
        <BulletList items={facts.key_facts} />
      </div>
      {facts.missing_info.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Missing info
          </p>
          <BulletList items={facts.missing_info} />
        </div>
      )}
      {facts.flags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {facts.flags.map((f) => (
            <Pill key={f} tone="info">
              {f}
            </Pill>
          ))}
        </div>
      )}
    </Section>
  );
}
