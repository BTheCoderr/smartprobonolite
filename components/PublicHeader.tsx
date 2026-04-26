'use client';

import Link from 'next/link';
import { useSubscription } from '@/contexts/SubscriptionContext';

const linkClass = 'text-sm font-medium text-gray-700 hover:text-spb-blue transition-colors';
const ctaClass =
  'text-sm font-medium rounded-lg border border-spb-blue text-spb-blue px-3 py-1.5 hover:bg-blue-50 transition-colors';

export function PublicHeader() {
  const { isPro, user } = useSubscription();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-semibold text-gray-900 hover:text-spb-blue">
          SmartProBono
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-end">
          {!isPro && (
            <Link href="/upgrade" className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 hover:bg-amber-100">
              Upgrade
            </Link>
          )}
          {isPro && (
            <span className="text-xs font-semibold uppercase tracking-wide text-spb-blue border border-spb-blue/30 rounded-full px-2 py-0.5">
              Pro
            </span>
          )}
          <Link href="/tools" className={linkClass}>
            Tools
          </Link>
          <Link href="/document" className={linkClass}>
            Understand a document
          </Link>
          <Link href="/chat" className={linkClass}>
            Ask Ermi
          </Link>
          <Link href="/generate" className={linkClass}>
            Generate
          </Link>
          <Link href="/diy/expungement" className={linkClass}>
            DIY expungement
          </Link>
          <Link href="/ri/eviction/intake" className={linkClass}>
            RI eviction help
          </Link>
          <Link href="/for-lawyers" className={linkClass}>
            For lawyers
          </Link>
          {user ? (
            <Link href="/dashboard" className={ctaClass}>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className={ctaClass}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
