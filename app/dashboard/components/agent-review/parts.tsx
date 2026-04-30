'use client';

import { useState, type ReactNode } from 'react';

/**
 * Shared building blocks used by every Agent Case Review card.
 * Tailwind-only; matches the rest of `app/dashboard/components/*` styling.
 */

export type PillTone = 'neutral' | 'good' | 'warn' | 'bad' | 'info';

const PILL_TONES: Record<PillTone, string> = {
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warn: 'bg-amber-50 text-amber-900 border-amber-200',
  bad: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
};

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: PillTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${PILL_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Section({
  title,
  pill,
  defaultOpen = false,
  children,
}: {
  title: string;
  pill?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-gray-800 hover:bg-gray-50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span
            className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ▶
          </span>
          {title}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">{pill}</span>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-700">{children}</div>
      )}
    </div>
  );
}

export function KV({ label, value }: { label: string; value: ReactNode }) {
  const empty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0);
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-0.5">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="break-words text-xs text-gray-800">
        {empty ? <span className="italic text-gray-400">—</span> : value}
      </dd>
    </div>
  );
}

export function BulletList({
  items,
  empty = '—',
}: {
  items: string[] | undefined;
  empty?: string;
}) {
  if (!items || items.length === 0) {
    return <p className="text-xs italic text-gray-400">{empty}</p>;
  }
  return (
    <ul className="list-disc space-y-0.5 pl-5">
      {items.map((it, i) => (
        <li key={i} className="text-xs text-gray-800">
          {it}
        </li>
      ))}
    </ul>
  );
}
