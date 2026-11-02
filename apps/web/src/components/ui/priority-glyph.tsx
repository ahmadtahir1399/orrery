import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type PriorityGlyphLevel = 'critical' | 'urgent' | 'high' | 'medium' | 'low' | 'none';

const LEVEL_KEY: Record<PriorityGlyphLevel, 'critical' | 'urgent' | 'high' | 'medium' | 'low'> = {
  critical: 'critical',
  urgent: 'urgent',
  high: 'high',
  medium: 'medium',
  low: 'low',
  none: 'low',
};

/**
 * Three ascending bars, the same priority mark the landing page draws on its
 * sample cards (`.lpa-prio`). Filled bars use the foreground ink; critical and
 * urgent turn the bars destructive. Styles live in `.prio-glyph` in
 * globals.css so the mark reads identically in light and dark mode.
 */
export function PriorityGlyph({
  level,
  className,
}: {
  level: PriorityGlyphLevel | string;
  className?: string;
}) {
  const t = useTranslations('issuesViews.priority');
  const resolved: PriorityGlyphLevel = level in LEVEL_KEY ? (level as PriorityGlyphLevel) : 'none';

  return (
    <span
      role="img"
      aria-label={t(LEVEL_KEY[resolved])}
      data-level={resolved}
      className={cn('prio-glyph', className)}
    >
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
    </span>
  );
}
