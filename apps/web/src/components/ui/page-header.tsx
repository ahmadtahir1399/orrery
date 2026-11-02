import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  headingLevel?: 1 | 2;
  description?: ReactNode;
  kicker?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /**
   * 'display' uses the landing page's display type (Figtree 500, tight
   * tracking) for a page whose title is a greeting or a name, not a label.
   */
  size?: 'default' | 'display';
}

export function PageHeader({
  title,
  headingLevel = 1,
  description,
  kicker,
  actions,
  className,
  size = 'default',
}: PageHeaderProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';
  return (
    <header
      className={cn(
        'flex min-w-0 flex-col gap-3 pb-1 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        {kicker ? <div className="kicker">{kicker}</div> : null}
        <Heading
          className={cn(
            'text-foreground text-balance leading-tight',
            size === 'display'
              ? 'text-[26px] font-medium tracking-[-0.025em] sm:text-[30px]'
              : 'text-[22px] font-semibold sm:text-[26px]'
          )}
        >
          {title}
        </Heading>
        {description ? (
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
