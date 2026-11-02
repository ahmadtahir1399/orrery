import type { ReactNode } from 'react';

export type ThreadMode = boolean | 'ghost';

/**
 * The one issue that threads the landing story. Each chapter view renders
 * WEB-31 in a different shape (list row, board card, issue header, shipped
 * row). In `ghost` mode the element keeps its box but shows only a dashed
 * slot: the journey's traveller (see story-journey.tsx) lands exactly on it.
 * `true` marks the element as the thread without ghosting it; `false`
 * renders it plainly (hero deck, inline mobile views).
 */
export function ThreadCard({
  mode = false,
  as = 'div',
  className,
  children,
}: {
  mode?: ThreadMode;
  as?: 'div' | 'li';
  className?: string;
  children: ReactNode;
}) {
  const Tag = as;
  const classes = [className, mode === 'ghost' ? 'lpa-ghost' : mode ? 'lpa-thread' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} data-thread={mode ? 'true' : undefined}>
      {children}
    </Tag>
  );
}
