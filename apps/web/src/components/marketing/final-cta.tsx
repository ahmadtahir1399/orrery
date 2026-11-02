import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { InView } from './in-view';
import { GlyphField, WireGlobe } from './patterns';
import { Shell, focusRingClass, primaryCtaClass } from './primitives';

export function FinalCta() {
  const t = useTranslations('publicPages.landing.finalCta');
  const nav = useTranslations('publicPages.landing.nav');

  return (
    <section aria-labelledby="landing-final-cta-title" className="py-20 sm:py-28">
      <Shell>
        <div className="relative isolate overflow-hidden rounded-2xl border border-[#2e2e2e] bg-[#1c1c1c] px-6 py-16 text-[#ededed] sm:px-12 sm:py-20 lg:px-16">
          <InView live className="lp-live pointer-events-none absolute inset-0">
            <GlyphField />
            <div className="hidden lg:block">
              <WireGlobe />
            </div>
          </InView>

          <div className="relative max-w-2xl">
            <h2
              id="landing-final-cta-title"
              className="landing-display text-balance text-[36px] text-[#fafafa] sm:text-[48px] lg:text-[56px]"
            >
              {t.rich('title', {
                accent: (chunks) => <span className="text-[#3ecf8e]">{chunks}</span>,
              })}
            </h2>
            <p className="landing-body mt-5 max-w-xl text-[17px] text-[#a1a1a1]">
              {t('description')}
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link href="/auth/signup" className={primaryCtaClass}>
                {nav('startFree')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link
                href="/auth/signin"
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#3e3e3e] bg-[#232323] px-5 text-[15px] font-medium text-[#ededed] transition-[background-color,border-color,transform] duration-150 hover:border-[#525252] hover:bg-[#2a2a2a] active:translate-y-px ${focusRingClass}`}
              >
                {nav('signIn')}
              </Link>
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}
