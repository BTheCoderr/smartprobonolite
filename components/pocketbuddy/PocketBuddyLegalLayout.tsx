import type { ReactNode } from 'react';
import Link from 'next/link';
import { CircuitFieldOverlay, CrestDivider, ErmiGlyph } from '@/components/brand/BrandMotifs';
import {
  ACLU_KNOW_YOUR_RIGHTS_URL,
  POCKETBUDDY_CONTACT_EMAIL,
  POCKETBUDDY_LEGAL_LAST_UPDATED_DISPLAY,
  POCKETBUDDY_LEGAL_LAST_UPDATED_ISO,
} from '@/lib/pocketbuddy/legalSite';

export type PocketBuddyLegalSlug = 'privacy' | 'terms' | 'legal';

const NAV: { slug: PocketBuddyLegalSlug; href: string; label: string }[] = [
  { slug: 'privacy', href: '/pocketbuddy/privacy', label: 'Privacy' },
  { slug: 'terms', href: '/pocketbuddy/terms', label: 'Terms' },
  { slug: 'legal', href: '/pocketbuddy/legal', label: 'Legal & disclaimers' },
];

export function PocketBuddyLegalLayout({
  active,
  title,
  subtitle,
  children,
}: {
  active: PocketBuddyLegalSlug;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F2F55]">
      <header className="relative overflow-hidden bg-[#133659] text-white shadow-[0_8px_30px_rgba(15,47,85,0.12)]">
        <CircuitFieldOverlay className="rounded-none" opacityClass="opacity-[0.14]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 55% 70% at 18% 20%, #43C1B2 0%, transparent 55%), radial-gradient(ellipse 45% 55% at 92% 88%, #349B98 0%, transparent 52%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-8 md:pt-14 md:pb-10 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <ErmiGlyph className="h-9 w-9 shrink-0 text-[#43C1B2]" aria-hidden />
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              PocketBuddy · SmartProBono
            </span>
          </div>
          <div className="max-w-md opacity-95">
            <CrestDivider />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-[1.75rem] font-bold tracking-tight leading-tight text-white">{title}</h1>
            <p className="text-base text-white/85 leading-relaxed max-w-2xl">{subtitle}</p>
          </div>
          <p className="text-xs font-medium text-white/65">
            Last updated:{' '}
            <time dateTime={POCKETBUDDY_LEGAL_LAST_UPDATED_ISO}>{POCKETBUDDY_LEGAL_LAST_UPDATED_DISPLAY}</time>
          </p>
          <nav className="flex flex-wrap gap-2 pt-2" aria-label="PocketBuddy legal documents">
            {NAV.map((item) => {
              const isActive = item.slug === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-semibold transition-colors border',
                    isActive
                      ? 'bg-[#349B98] border-[#43C1B2]/80 text-white shadow-sm'
                      : 'bg-white/10 border-white/25 text-white hover:bg-white/18',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:py-12 space-y-8">
        <article className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 md:p-10 shadow-[0_1px_0_rgba(15,47,85,0.04),0_12px_40px_rgba(15,47,85,0.06)] space-y-10">
          {children}
          <aside className="rounded-xl border border-[#349B98]/25 bg-[#EEF8F7] p-4 text-sm text-[#475569]">
            <p className="font-semibold text-[#0F2F55]">Contact</p>
            <p className="mt-2 leading-relaxed">
              Questions about these documents:{' '}
              <a href={`mailto:${POCKETBUDDY_CONTACT_EMAIL}`} className="font-semibold text-[#349B98] underline underline-offset-2">
                {POCKETBUDDY_CONTACT_EMAIL}
              </a>
            </p>
          </aside>
        </article>

        <footer className="pb-16 text-center text-xs text-[#475569] space-y-2 leading-relaxed">
          <p className="font-semibold text-[#0F2F55]">PocketBuddy by SmartProBono</p>
          <p>Part of the Protection + Justice Infrastructure ecosystem.</p>
          <p className="text-[11px] max-w-lg mx-auto opacity-90">
            PocketBuddy is a consumer safety documentation product. SmartProBono may offer separate legal-intake or justice-access
            tools; those offerings are governed by their own terms and notices.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
            <Link href="/pocketbuddy/privacy" className="font-semibold text-[#349B98] hover:text-[#2d8583] hover:underline">
              Privacy
            </Link>
            <span className="text-[#E2E8F0]" aria-hidden>
              ·
            </span>
            <Link href="/pocketbuddy/terms" className="font-semibold text-[#349B98] hover:text-[#2d8583] hover:underline">
              Terms
            </Link>
            <span className="text-[#E2E8F0]" aria-hidden>
              ·
            </span>
            <Link href="/pocketbuddy/legal" className="font-semibold text-[#349B98] hover:text-[#2d8583] hover:underline">
              Legal & disclaimers
            </Link>
            <span className="text-[#E2E8F0]" aria-hidden>
              ·
            </span>
            <a
              href={ACLU_KNOW_YOUR_RIGHTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#349B98] hover:text-[#2d8583] hover:underline"
            >
              ACLU Know Your Rights (external)
            </a>
          </div>
          <p className="text-[10px] max-w-md mx-auto pt-1 text-[#64748B]">
            SmartProBono does not control third-party websites (including ACLU). Links are for convenience only.
          </p>
        </footer>
      </main>
    </div>
  );
}
