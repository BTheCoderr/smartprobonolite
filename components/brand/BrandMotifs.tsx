/**
 * Identity-driven chrome: shield + scales (protection / justice) and circuit field (AI infrastructure).
 * Use on surfaces that should feel unmistakably SmartProBono—not generic SaaS decoration.
 */

type SvgProps = { className?: string; 'aria-hidden'?: boolean };

/** Lockup glyph: shield silhouette + balance motif + trace lines (mirrors logo semantics). */
export function ErmiGlyph({ className = 'h-6 w-6 shrink-0', ...rest }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={rest['aria-hidden'] ?? true}
    >
      {/* Shield */}
      <path
        d="M12 21.2c4.6-2.1 7.3-5.5 7.3-9.6V6.1L12 2.5 4.7 6.1v5.5c0 4.1 2.7 7.5 7.3 9.6z"
        stroke="currentColor"
        strokeWidth={1.35}
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.14}
      />
      {/* Scales beam + pans */}
      <path
        d="M8.5 10.5h7M12 10.5v2.2M9 14.2l-.8 2.4h-.9M15 14.2l.8 2.4h.9"
        stroke="currentColor"
        strokeWidth={1.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.7 16.6h1.6M14.7 16.6h1.6" stroke="currentColor" strokeWidth={1.05} strokeLinecap="round" opacity={0.85} />
      {/* Circuit traces */}
      <path
        d="M4.5 8.2h2.2M17.3 8.2h2.2M5.8 12.4H7M17 12.4h1.2"
        stroke="currentColor"
        strokeWidth={0.9}
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
}

/** Horizontal crest: mint → teal → navy (scales-to-shield gradient like the lockup). */
export function CrestDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-[3px] rounded-full bg-gradient-to-r from-spb-mint via-spb-teal to-spb-navy ${className}`}
      aria-hidden
    />
  );
}

/** Subtle grid / trace field — parent should be `relative overflow-hidden`. */
export function CircuitFieldOverlay({
  className = '',
  opacityClass = 'opacity-[0.22]',
}: {
  className?: string;
  /** Tailwind opacity utility; tune per surface (hero vs card vs header). */
  opacityClass?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 spb-circuit-field ${opacityClass} ${className}`}
      aria-hidden
    />
  );
}
