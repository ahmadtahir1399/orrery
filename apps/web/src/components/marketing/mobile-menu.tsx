'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { focusRingClass, primaryCtaClass, secondaryCtaClass } from './primitives';

/**
 * Mobile menu for the marketing nav (hidden at lg and up, where the inline
 * links take over). A sheet under the header with 48px rows, both calls to
 * action, and a dimmed backdrop. Opening moves focus to the first link,
 * Escape and backdrop taps close it, and the page does not scroll behind it.
 */
export function MobileMenu({ items }: { items: ReadonlyArray<{ label: string; href: string }> }) {
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const t = useTranslations('publicPages.landing.nav');

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstLinkRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="marketing-mobile-menu"
        aria-label={open ? t('closeMenuAria') : t('openMenuAria')}
        className={`lp-menu-btn inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--landing-border-strong)] text-[var(--landing-text)] transition-colors duration-150 hover:bg-[var(--landing-bg-hover)] ${focusRingClass}`}
      >
        {open ? (
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        ) : (
          <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <>
          <div
            role="presentation"
            onClick={close}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/25 lg:hidden"
          />
          <div
            id="marketing-mobile-menu"
            className="lp-menu-sheet absolute inset-x-0 top-16 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-lg lg:hidden"
          >
            <div className="mx-auto flex w-full max-w-[1200px] flex-col px-4 pb-4 pt-2 sm:px-6">
              {items.map((item, index) => (
                <a
                  key={item.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  onClick={close}
                  className={`flex min-h-12 items-center justify-between gap-3 rounded-md px-3 text-[16px] font-medium text-[var(--landing-text-dark)] transition-colors duration-150 hover:bg-[var(--landing-bg-hover)] ${focusRingClass}`}
                >
                  {item.label}
                  <ArrowRight
                    className="h-4 w-4 text-[var(--landing-text-muted)] rtl:rotate-180"
                    aria-hidden="true"
                  />
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--landing-border)] pt-4">
                <Link href="/auth/signin" onClick={close} className={secondaryCtaClass}>
                  {t('signIn')}
                </Link>
                <Link href="/auth/signup" onClick={close} className={primaryCtaClass}>
                  {t('startFree')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
