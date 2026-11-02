'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type CssVars = CSSProperties & Record<`--${string}`, string>;

export const FLOW_STAGES = ['intake', 'plan', 'build', 'ship'] as const;
export type FlowStage = (typeof FLOW_STAGES)[number];

/** Which status category feeds each stage of the intake → ship path. */
export function flowStageForCategory(category: string): FlowStage | null {
  switch (category) {
    case 'backlog':
      return 'intake';
    case 'todo':
      return 'plan';
    case 'in_progress':
    case 'in_review':
    case 'blocked':
      return 'build';
    case 'done':
      return 'ship';
    default:
      return null;
  }
}

export interface WorkFlowStripProps {
  counts: Record<FlowStage, number>;
  blocked: number;
  /** Story points on issues that are in progress or in review. */
  points: number;
  completed: number;
  total: number;
  className?: string;
}

/**
 * The dashboard's summary card, shaped like the landing page's story: the same
 * four stages (intake → plan → build → ship) with the counts of the viewer's
 * own issues. Each stage carries a short rail; the fill compares stages and a
 * mark travels the rail while the card is on screen (paused offscreen, hidden
 * under reduced motion). Completion and points in flight sit in the footer.
 */
export function WorkFlowStrip({
  counts,
  blocked,
  points,
  completed,
  total,
  className,
}: WorkFlowStripProps) {
  const t = useTranslations('dashboard');
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) node.dataset.inview = entry.isIntersecting ? 'true' : 'false';
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(1, ...FLOW_STAGES.map((stage) => counts[stage]));
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section
      ref={ref}
      aria-labelledby="dashboard-flow-heading"
      className={cn('surface-card min-w-0 overflow-hidden', className)}
    >
      <div className="border-border flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3 sm:px-5">
        <h2 id="dashboard-flow-heading" className="text-foreground text-sm font-semibold">
          {t('flow.heading')}
        </h2>
        <p className="text-muted-foreground text-xs">{t('flow.description')}</p>
      </div>

      <dl className="flow-strip">
        {FLOW_STAGES.map((stage, index) => {
          const count = counts[stage];
          const showBlocked = stage === 'build' && blocked > 0;
          return (
            <div
              key={stage}
              className="flow-stage"
              data-tone={stage === 'ship' ? 'done' : undefined}
              style={
                {
                  '--flow-fill': String(count / max),
                  '--flow-index': String(index),
                } as CssVars
              }
            >
              <dt className="flex min-w-0 items-center gap-2">
                <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-foreground truncate text-xs font-semibold">
                  {t(`flow.stages.${stage}`)}
                </span>
              </dt>
              <dd className="flex min-w-0 items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl font-semibold tabular-nums leading-none tracking-tight',
                    stage === 'ship' && count > 0 ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {count}
                </span>
                {showBlocked ? (
                  <span className="bg-destructive-soft text-destructive truncate rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums">
                    {t('flow.blocked', { count: blocked })}
                  </span>
                ) : null}
              </dd>
              <dd className="text-muted-foreground truncate text-xs">{t(`flow.hints.${stage}`)}</dd>
              <dd aria-hidden="true" className="flow-rail">
                <i />
                {count > 0 ? <b /> : null}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="border-border flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-t px-4 py-3 sm:px-5">
        <span className="text-foreground text-xs font-semibold">{t('completion_label')}</span>
        <div
          role="progressbar"
          aria-label={t('completion_label')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionPercent}
          className="bg-muted h-2 min-w-[120px] flex-1 overflow-hidden rounded-full"
        >
          <div
            className="bg-primary h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">
          {t('completion_summary', { completed, total })}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {t('flow.points', { points })}
        </span>
      </div>
    </section>
  );
}
