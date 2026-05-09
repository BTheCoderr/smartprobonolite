'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  variant?: 'header' | 'hero';
  className?: string;
  /** Defaults to home `/`; use `/dashboard` inside authenticated app shell */
  href?: string;
};

/**
 * Full brand lockup from `/brand/smartprobono-logo.png`.
 * Falls back to wordmark text if the asset is missing in dev.
 */
export function SmartProBonoLogo({ variant = 'header', className = '', href = '/' }: Props) {
  const [broken, setBroken] = useState(false);
  const height = variant === 'hero' ? 44 : 32;

  if (broken) {
    return (
      <Link
        href={href}
        className={`inline-flex items-baseline gap-1 font-semibold tracking-tight text-spb-navy ${className}`}
      >
        SmartProBono
        <span className="text-xs font-medium uppercase tracking-widest text-spb-muted">Lite</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={`inline-flex items-center ${className}`} aria-label="SmartProBono Lite home">
      <span
        className="relative inline-block align-middle"
        style={{
          height,
          width: variant === 'hero' ? Math.round(height * 4.2) : Math.round(height * 4),
        }}
      >
        <Image
          src="/brand/smartprobono-logo.png"
          alt="SmartProBono"
          fill
          className="object-contain object-left"
          sizes={variant === 'hero' ? '200px' : '160px'}
          priority={variant === 'hero'}
          onError={() => setBroken(true)}
        />
      </span>
    </Link>
  );
}
