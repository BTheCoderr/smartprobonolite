import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { CircuitFieldOverlay, CrestDivider, ErmiGlyph } from '@/components/brand/BrandMotifs';
import {
  POCKETBUDDY_APP_STORE_URL,
  POCKETBUDDY_CONTACT_EMAIL,
  pocketBuddyCanonicalUrl,
} from '@/lib/pocketbuddy/legalSite';

export async function generateMetadata(): Promise<Metadata> {
  const canonical = pocketBuddyCanonicalUrl('/pocketbuddy');
  return {
    title: 'PocketBuddy by SmartProBono | Mobile safety documentation',
    description:
      'PocketBuddy by SmartProBono — local-first safety documentation on iOS. Listed on the App Store as SmartProBono. Sessions, trusted contacts, incident packets.',
    robots: { index: true, follow: true },
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default function PocketBuddyProductPage() {
  const mailto = `mailto:${POCKETBUDDY_CONTACT_EMAIL}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F2F55]">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14 space-y-10 pb-20">
        <header className="relative overflow-hidden rounded-3xl border border-[#133659]/20 bg-[#133659] text-white shadow-[0_12px_40px_rgba(15,47,85,0.15)]">
          <CircuitFieldOverlay className="rounded-3xl" opacityClass="opacity-[0.14]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] rounded-3xl"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 55% 70% at 18% 20%, #43C1B2 0%, transparent 55%), radial-gradient(ellipse 45% 55% at 92% 88%, #349B98 0%, transparent 52%)',
            }}
          />
          <div className="relative px-6 py-10 md:px-10 md:py-12 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <ErmiGlyph className="h-10 w-10 shrink-0 text-[#43C1B2]" aria-hidden />
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                PocketBuddy by SmartProBono
              </span>
            </div>
            <div className="max-w-md opacity-95">
              <CrestDivider />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight text-white">
                PocketBuddy by SmartProBono
              </h1>
              <p className="text-base md:text-lg text-white/88 leading-relaxed max-w-2xl">
                A <strong className="font-semibold text-white">local-first</strong> safety documentation app for starting safety sessions,
                optionally sharing location with trusted contacts, documenting important moments, and exporting structured incident packets when{' '}
                <strong className="font-semibold text-white">you</strong> choose.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 pt-2">
              <a
                href={POCKETBUDDY_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#349B98] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#2d8583] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43C1B2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#133659]"
              >
                Download on the App Store
              </a>
              <p className="text-xs font-medium text-white/75 max-w-xl leading-relaxed">
                Listed on the App Store as <strong className="text-white/95">SmartProBono</strong>. PocketBuddy by SmartProBono is available
                through that listing — we don&apos;t rename the store listing here.
              </p>
              <p className="text-xs text-white/65 max-w-xl leading-relaxed">
                Alternative wording: Download the <strong className="text-white/85">SmartProBono</strong> mobile app with PocketBuddy safety
                documentation features.
              </p>
            </div>
          </div>
        </header>

        <NoticeBox title="Informational only — not emergency services" tone="warning">
          PocketBuddy does <strong>not</strong> replace 911 or emergency services. It does <strong>not</strong> guarantee safety, message delivery, location
          accuracy, or legal outcomes. Recording laws vary by location — <strong>you</strong> are responsible for compliance. Incident packets are for
          personal documentation and organization; they are <strong>not</strong> legal advice and <strong>not</strong> guaranteed evidence or admissibility.
          SmartProBono does <strong>not</strong> represent you, and app use does <strong>not</strong> create an attorney–client relationship.
        </NoticeBox>

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-[0_1px_0_rgba(15,47,85,0.04),0_12px_40px_rgba(15,47,85,0.06)] space-y-4">
          <h2 className="text-lg font-bold text-[#133659]">App listing &amp; support</h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Use these links for App Store review, help menus, and PocketBuddy legal documents hosted on this site.
          </p>
          <ul className="space-y-3 text-sm text-[#475569]">
            <li>
              <span className="font-semibold text-[#0F2F55]">App Store: </span>
              <a
                href={POCKETBUDDY_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#349B98] underline underline-offset-2 hover:text-[#2d8583]"
              >
                {POCKETBUDDY_APP_STORE_URL}
              </a>
            </li>
            <li>
              <span className="font-semibold text-[#0F2F55]">Privacy Policy: </span>
              <Link href="/pocketbuddy/privacy" className="font-semibold text-[#349B98] underline underline-offset-2 hover:text-[#2d8583]">
                /pocketbuddy/privacy
              </Link>
            </li>
            <li>
              <span className="font-semibold text-[#0F2F55]">Terms of Service: </span>
              <Link href="/pocketbuddy/terms" className="font-semibold text-[#349B98] underline underline-offset-2 hover:text-[#2d8583]">
                /pocketbuddy/terms
              </Link>
            </li>
            <li>
              <span className="font-semibold text-[#0F2F55]">Legal &amp; disclaimers: </span>
              <Link href="/pocketbuddy/legal" className="font-semibold text-[#349B98] underline underline-offset-2 hover:text-[#2d8583]">
                /pocketbuddy/legal
              </Link>
            </li>
            <li>
              <span className="font-semibold text-[#0F2F55]">Support email: </span>
              <a href={mailto} className="font-semibold text-[#349B98] underline underline-offset-2 hover:text-[#2d8583]">
                {POCKETBUDDY_CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </section>

        <footer className="text-center text-xs text-[#475569] space-y-2 leading-relaxed pt-4">
          <p className="font-semibold text-[#0F2F55]">PocketBuddy by SmartProBono</p>
          <p>Part of the Protection + Justice Infrastructure ecosystem.</p>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-2">
            <Link href="/pocketbuddy/privacy" className="font-semibold text-[#349B98] hover:underline">
              Privacy
            </Link>
            <span className="text-[#E2E8F0]">·</span>
            <Link href="/pocketbuddy/terms" className="font-semibold text-[#349B98] hover:underline">
              Terms
            </Link>
            <span className="text-[#E2E8F0]">·</span>
            <Link href="/pocketbuddy/legal" className="font-semibold text-[#349B98] hover:underline">
              Legal
            </Link>
            <span className="text-[#E2E8F0]">·</span>
            <Link href="/" className="font-semibold text-[#349B98] hover:underline">
              SmartProBono Lite home
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
