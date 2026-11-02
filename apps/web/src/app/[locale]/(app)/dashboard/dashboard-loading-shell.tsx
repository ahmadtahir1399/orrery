import { PageFrame } from '@/components/ui/page-frame';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the dashboard composition (header, work-flow strip, attention queue,
 * side rail, disclosures) so content replaces placeholders without layout shift.
 */
export function DashboardLoadingShell({ title }: { title: string }) {
  return (
    <PageFrame className="dashboard-carbon" contentClassName="space-y-5">
      <div
        role="status"
        aria-busy="true"
        className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0 space-y-2">
          <h1 className="sr-only">{title}</h1>
          <Skeleton className="h-3 w-32 rounded-full" aria-hidden="true" />
          <Skeleton className="h-8 w-72 max-w-full" aria-hidden="true" />
          <Skeleton className="h-4 w-72 max-w-full rounded-full" aria-hidden="true" />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row" aria-hidden="true">
          <Skeleton className="h-8 w-full sm:w-28" />
          <Skeleton className="h-8 w-full sm:w-28" />
        </div>
      </div>

      <div className="surface-card min-w-0 overflow-hidden" aria-hidden="true">
        <div className="border-border flex min-h-11 items-center justify-between gap-4 border-b px-4 sm:px-5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="hidden h-3 w-56 rounded-full sm:block" />
        </div>
        <div className="flow-strip">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flow-stage">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="mt-1 h-0.5 w-full rounded-full" />
            </div>
          ))}
        </div>
        <div className="border-border flex items-center gap-4 border-t px-4 py-3 sm:px-5">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="hidden h-3 w-28 rounded-full sm:block" />
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]" aria-hidden="true">
        <div className="surface-card overflow-hidden">
          <div className="border-border flex min-h-14 items-center justify-between border-b px-4 py-3 sm:px-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48 rounded-full" />
            </div>
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
          <div className="divide-border divide-y">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex min-h-[60px] items-center gap-3 px-4 py-3 sm:px-5">
                <Skeleton className="h-3 w-3 rounded-sm" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/5" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
                <Skeleton className="hidden h-5 w-14 rounded-full sm:block" />
                <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card overflow-hidden">
            <div className="border-border flex min-h-12 items-center gap-2 border-b px-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="border-border grid grid-cols-2 border-b">
              <div className="space-y-2 px-4 py-3">
                <Skeleton className="h-2.5 w-16 rounded-full" />
                <Skeleton className="h-5 w-8" />
              </div>
              <div className="border-border space-y-2 border-s px-4 py-3">
                <Skeleton className="h-2.5 w-16 rounded-full" />
                <Skeleton className="h-5 w-8" />
              </div>
            </div>
            <div className="space-y-3 px-4 py-4">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
            </div>
          </div>
          <div className="surface-card space-y-3 p-4">
            <Skeleton className="h-4 w-36" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex min-h-10 items-center gap-3 px-2">
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-3 flex-1 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="surface-card flex min-h-14 items-center justify-between px-4 py-3 sm:px-5"
        >
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-16 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      ))}
    </PageFrame>
  );
}
