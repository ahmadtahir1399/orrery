import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HeroStage, type HeroView } from './hero-stage';
import { LiveActivity, LiveAgent, LiveBoard, LiveBuild, LiveIssues, LiveSprint } from './live-app';
import { HeroGrid } from './patterns';
import { Shell, focusRingClass, primaryCtaClass, secondaryCtaClass } from './primitives';

export function Hero() {
  const t = useTranslations('publicPages.landing.hero');
  const nav = useTranslations('publicPages.landing.nav');
  const appNav = useTranslations('nav');
  const showcase = useTranslations('publicPages.landing.showcase');
  const workflow = useTranslations('publicPages.landing.workflow');

  // The deck reuses the app's own labels; every view is the product rendered
  // in code with sample data (see live-app.tsx).
  const views: HeroView[] = [
    { id: 'board', label: showcase('frame.board'), view: <LiveBoard /> },
    { id: 'issues', label: appNav('my_issues'), view: <LiveIssues /> },
    { id: 'build', label: appNav('ai_agents'), view: <LiveBuild /> },
    { id: 'sprint', label: showcase('sprint.frameTitle'), view: <LiveSprint /> },
  ];

  return (
    <section
      aria-labelledby="landing-hero-title"
      className="relative overflow-hidden pb-16 sm:pb-20"
    >
      <HeroGrid />
      <div aria-hidden="true" className="lp-hero-aura" />
      <Shell className="relative pt-10 sm:pt-12 lg:pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <a href="#agents" className={`lp-hero-pill animate-fade-up mb-6 ${focusRingClass}`}>
            <b>{t('pillBadge')}</b>
            <span>{t('pillText')}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
          </a>
          <h1
            id="landing-hero-title"
            className="landing-display animate-fade-up text-balance text-[40px] text-[var(--landing-text-dark)] min-[390px]:text-[44px] sm:text-[56px] lg:text-[64px]"
          >
            {t.rich('title', {
              accent: (chunks) => (
                <span className="lp-accent-mark text-[var(--landing-accent)]">
                  {chunks}
                  <svg viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
                    <path pathLength={1} d="M3 9 C 70 3, 170 2, 297 6" />
                  </svg>
                </span>
              ),
            })}
          </h1>
          <p
            className="landing-body animate-fade-up mx-auto mt-5 max-w-xl text-pretty text-[17px] text-[var(--landing-text-muted)] sm:text-[18px]"
            style={{ animationDelay: '80ms', animationFillMode: 'both' }}
          >
            {t('description')}
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-col items-stretch justify-center gap-3 min-[390px]:flex-row min-[390px]:items-center"
            style={{ animationDelay: '160ms', animationFillMode: 'both' }}
          >
            <Link href="/auth/signup" className={primaryCtaClass}>
              {nav('startFree')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <Link href="/auth/signin" className={secondaryCtaClass}>
              {nav('signIn')}
            </Link>
          </div>
        </div>
      </Shell>

      <HeroStage
        views={views}
        side={<LiveAgent />}
        front={<LiveActivity />}
        caption={showcase('sampleData')}
        ariaLabel={workflow('tabsAria')}
      />
    </section>
  );
}
