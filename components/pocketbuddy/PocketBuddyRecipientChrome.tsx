import type { ReactNode } from 'react';
import Link from 'next/link';
import { CircuitFieldOverlay, CrestDivider, ErmiGlyph } from '@/components/brand/BrandMotifs';
import {
  POCKETBUDDY_APP_STORE_URL,
  POCKETBUDDY_CONTACT_EMAIL,
} from '@/lib/pocketbuddy/legalSite';

export function PocketBuddyRecipientChrome({ children }: { children: ReactNode }) {
  const mailto = `mailto:${POCKETBUDDY_CONTACT_EMAIL}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F2F55] flex flex-col">
      <header className="relative shrink-0 overflow-hidden bg-[#133659] text-white">
        <CircuitFieldOverlay className="rounded-none" opacityClass="opacity-[0.12]" />
        <div className="relative mx-auto max-w-lg px-4 py-4 flex items-center gap-3">
          <ErmiGlyph className="h-8 w-8 shrink-0 text-[#43C1B2]" aria-hidden />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 truncate">
              Trusted contact link
            </p>
            <p className="text-sm font-bold text-white truncate">PocketBuddy by SmartProBono</p>
          </div>
        </div>
        <div className="relative px-4 pb-3 mx-auto max-w-lg">
          <CrestDivider className="opacity-90" />
        </div>
      </header>

      <div className="flex-1 mx-auto w-full max-w-lg px-4 py-6">{children}</div>

      <footer className="shrink-0 border-t border-[#E2E8F0] bg-white px-4 py-6 text-center text-[11px] text-[#475569] space-y-3">
        <p className="font-semibold text-[#0F2F55]">Product &amp; legal</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          <a
            href={POCKETBUDDY_APP_STORE_URL}
            className="font-semibold text-[#349B98] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            App Store
          </a>
          <span className="text-[#E2E8F0]">·</span>
          <Link href="/pocketbuddy" className="font-semibold text-[#349B98] hover:underline">
            PocketBuddy
          </Link>
          <span className="text-[#E2E8F0]">·</span>
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
          <a href={mailto} className="font-semibold text-[#349B98] hover:underline">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
