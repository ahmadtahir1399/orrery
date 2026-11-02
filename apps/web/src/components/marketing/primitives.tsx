import type { ReactNode } from 'react';

/**
 * Shared layout primitives for the marketing landing page.
 *
 * Server-safe (no hooks, no state). Colors and fonts go through the
 * `--landing-*` tokens scoped by `.landing-dark` in globals.css: a white or
 * near-black canvas, neutral greys, and one emerald action color whose fill
 * always carries near-black ink.
 */

export function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  align = 'start',
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  align?: 'start' | 'center';
  id?: string;
}) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'}>
      <h2
        id={id}
        className="landing-title text-balance text-[32px] text-[var(--landing-text-dark)] sm:text-[40px] lg:text-[48px]"
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`landing-body mt-4 text-pretty text-[16px] text-[var(--landing-text-muted)] sm:text-[18px] ${
            centered ? 'mx-auto max-w-2xl' : 'max-w-xl'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Shared focus ring for landing controls. */
export const focusRingClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]';

/** Emerald primary CTA with near-black ink (Supabase-style lit button). */
export const primaryCtaClass = `inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--landing-accent-fill)_70%,#000)] bg-[var(--landing-accent-fill)] px-5 text-[15px] font-medium text-[var(--landing-accent-ink)] transition-[background-color,transform] duration-150 hover:bg-[var(--landing-accent-fill-hover)] active:translate-y-px ${focusRingClass}`;

/** Neutral outline CTA. */
export const secondaryCtaClass = `inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--landing-border-strong)] bg-[var(--landing-bg-elevated)] px-5 text-[15px] font-medium text-[var(--landing-text)] transition-[background-color,border-color,transform] duration-150 hover:border-[var(--landing-border-light)] hover:bg-[var(--landing-bg-hover)] active:translate-y-px ${focusRingClass}`;
