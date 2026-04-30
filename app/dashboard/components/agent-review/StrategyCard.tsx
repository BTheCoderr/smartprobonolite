'use client';

import type { AgentReviewStrategy } from './types';
import { BulletList, Pill, Section } from './parts';

export default function StrategyCard({ strategy }: { strategy?: AgentReviewStrategy }) {
  if (!strategy) return null;
  return (
    <Section
      title="5. Strategy"
      pill={strategy.staffReviewRequired ? <Pill tone="warn">staff review</Pill> : null}
    >
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Next steps
        </p>
        <BulletList items={strategy.nextSteps} />
      </div>
      <div className="mt-2">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
          What to bring
        </p>
        <BulletList items={strategy.whatToBring} />
      </div>
    </Section>
  );
}
