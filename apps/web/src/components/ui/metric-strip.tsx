import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type MetricTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface MetricStripItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** Optional semantic dot beside the label. Never the only carrier of meaning. */
  tone?: MetricTone;
}

interface MetricStripProps {
  items: MetricStripItem[];
  className?: string;
  /** Optional summary row rendered under the metrics inside the same surface. */
  footer?: ReactNode;
}

const TONE_DOT: Record<MetricTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground/50',
};

export function MetricStrip({ items, className, footer }: MetricStripProps) {
  return (
    <div
      className={cn(
        'metric-strip border-border bg-card shadow-xs min-w-0 overflow-hidden rounded-lg border',
        className
      )}
    >
      <dl className="grid grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="metric-strip-item flex min-h-[84px] min-w-0 flex-col justify-center gap-2 px-4 py-3.5 sm:px-5"
          >
            <dt className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs font-medium">
              {item.tone ? (
                <span
                  aria-hidden="true"
                  className={cn('h-2 w-2 shrink-0 rounded-full', TONE_DOT[item.tone])}
                />
              ) : null}
              <div className="min-w-0 truncate">{item.label}</div>
            </dt>
            <dd className="text-foreground text-2xl font-semibold tabular-nums leading-none tracking-tight">
              {item.value}
            </dd>
            {item.hint ? (
              <dd className="text-muted-foreground truncate text-xs">{item.hint}</dd>
            ) : null}
          </div>
        ))}
      </dl>
      {footer ? <div className="border-border border-t px-4 py-3 sm:px-5">{footer}</div> : null}
    </div>
  );
}
