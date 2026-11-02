'use client';

import { useTranslations } from 'next-intl';
import { TaskNebulaLogo } from '@/components/branding/tasknebula-logo';
import { Skeleton } from '@/components/ui/skeleton';
import { PageFrame } from '@/components/ui/page-frame';

/**
 * Full-screen workspace loader shown while the authenticated shell (session,
 * workspace access, navigation) resolves on first entry. Calm by design: the
 * mark, one sentence, and a slim indeterminate bar. Motion is disabled by the
 * global reduced-motion and `data-animations="false"` rules.
 */
export function AppLoadingScreen() {
  const t = useTranslations('common');

  return (
    <div className="bg-workbench-canvas flex min-h-dvh w-full items-center justify-center px-6">
      <div
        role="status"
        aria-live="polite"
        className="animate-fade-in flex w-full max-w-[260px] flex-col items-center text-center"
      >
        <div className="bg-card border-border mb-5 flex h-16 w-16 items-center justify-center rounded-lg border shadow-sm">
          <TaskNebulaLogo className="h-10 w-10" />
        </div>
        <p className="text-foreground text-base font-semibold">{t('loading_workspace')}</p>
        <p className="text-muted-foreground mt-1 text-sm">{t('loading')}</p>
        <div
          aria-hidden="true"
          className="progress-bar-indeterminate mt-6 h-1 w-full overflow-hidden rounded-full"
        />
      </div>
    </div>
  );
}

/**
 * In-shell route loader for pages without their own `loading.tsx`: keeps the
 * sidebar and command bar in place and sketches a header plus a list surface.
 */
export function RouteLoadingSkeleton() {
  const t = useTranslations('common');

  return (
    <PageFrame contentClassName="space-y-5">
      <div
        role="status"
        aria-busy="true"
        className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-end sm:justify-between"
      >
        <span className="sr-only">{t('loading')}</span>
        <div className="min-w-0 space-y-2" aria-hidden="true">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full rounded-full" />
        </div>
        <Skeleton className="h-8 w-full sm:w-28" aria-hidden="true" />
      </div>
      <div className="surface-card divide-border divide-y overflow-hidden" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex min-h-[60px] items-center gap-3 px-4 py-3 sm:px-5">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/4 rounded-full" />
            </div>
            <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
