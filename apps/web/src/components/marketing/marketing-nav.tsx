'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TaskNebulaLogo } from '@/components/branding/tasknebula-logo';
import { MobileMenu } from './mobile-menu';
import { Shell, focusRingClass } from './primitives';

const navItems = [
  { labelKey: 'story', href: '#story' },
  { labelKey: 'features', href: '#features' },
  { labelKey: 'agents', href: '#agents' },
  { labelKey: 'faq', href: '#faq' },
] as const;

/**
 * Landing header. Transparent over the hero, then a translucent bar with a
 * hairline once the page scrolls (`data-scrolled`). The link row is a
 * scroll-spy: the section in view gets a sliding highlight (`layoutId`), and
 * the highlight follows the pointer on hover. Everything renders identically
 * on the server; the scrolled/active state is only applied after hydration.
 */
export function MarketingNav() {
  const t = useTranslations('publicPages.landing.nav');
  const items = navItems.map((item) => ({ ...item, label: t(`items.${item.labelKey}`) }));
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [hoverHref, setHoverHref] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`);
        }
        // Above the first section, nothing is active.
        if (window.scrollY < (sections[0]?.offsetTop ?? 0) - window.innerHeight * 0.5) {
          setActiveHref(null);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const highlighted = hoverHref ?? activeHref;

  return (
    <nav
      aria-label={t('primaryAria')}
      data-scrolled={scrolled ? 'true' : 'false'}
      className="lp-nav sticky top-0 z-50"
    >
      <Shell className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className={`lp-nav-brand -my-2 flex min-h-11 shrink-0 items-center gap-2.5 rounded-md py-2 ${focusRingClass}`}
          aria-label={t('homeAria')}
        >
          <TaskNebulaLogo compact className="shrink-0" />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--landing-text-dark)]">
            {'Orrery'}
          </span>
        </Link>

        <div
          className="lp-nav-links hidden items-center gap-0.5 lg:flex"
          onPointerLeave={() => setHoverHref(null)}
        >
          {items.map((item) => {
            const isHighlighted = highlighted === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onPointerEnter={() => setHoverHref(item.href)}
                onFocus={() => setHoverHref(item.href)}
                onBlur={() => setHoverHref(null)}
                data-active={activeHref === item.href ? 'true' : undefined}
                className={`lp-nav-link relative rounded-md px-3.5 py-2 text-[14px] ${focusRingClass}`}
              >
                {isHighlighted ? (
                  <motion.span
                    layoutId="lp-nav-highlight"
                    className="lp-nav-highlight absolute inset-0 rounded-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.6 }}
                  />
                ) : null}
                <span className="relative">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/signin"
            className={`hidden h-9 items-center rounded-md px-3 text-[14px] text-[var(--landing-text-muted)] transition-colors duration-150 hover:text-[var(--landing-text-dark)] md:inline-flex ${focusRingClass}`}
          >
            {t('signIn')}
          </Link>
          <Link
            href="/auth/signup"
            className={`lp-nav-cta group inline-flex h-10 items-center gap-1.5 rounded-md border border-[color-mix(in_srgb,var(--landing-accent-fill)_70%,#000)] bg-[var(--landing-accent-fill)] pe-3 ps-3.5 text-[14px] font-medium text-[var(--landing-accent-ink)] transition-[background-color,box-shadow] duration-150 hover:bg-[var(--landing-accent-fill-hover)] ${focusRingClass}`}
          >
            {t('startFree')}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <MobileMenu items={items} />
        </div>
      </Shell>
    </nav>
  );
}
