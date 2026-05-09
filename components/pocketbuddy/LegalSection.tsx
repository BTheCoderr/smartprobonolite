import type { ReactNode } from 'react';

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-[#E2E8F0] pb-8 last:border-b-0 last:pb-0 space-y-3">
      <h2 className="text-lg font-bold tracking-tight text-[#0F2F55]">{title}</h2>
      <div className="text-sm leading-relaxed text-[#475569] space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-[#0F2F55] [&_a]:font-semibold [&_a]:text-[#349B98] [&_a]:underline-offset-2 hover:[&_a]:text-[#2d8583]">
        {children}
      </div>
    </section>
  );
}
