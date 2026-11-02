'use client';

import type { PointerEvent, ReactNode } from 'react';

/**
 * Tracks the pointer over a group of `.lp-card`s and writes its position to
 * the hovered card as `--lp-mx` / `--lp-my`, so the card's CSS spotlight
 * follows the cursor. Purely visual; touch devices keep the centered default.
 */
export function SpotlightGroup({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const card = (event.target as Element).closest<HTMLElement>('.lp-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--lp-mx', `${Math.round(event.clientX - rect.left)}px`);
    card.style.setProperty('--lp-my', `${Math.round(event.clientY - rect.top)}px`);
  };

  return (
    <div className={className} onPointerMove={handlePointerMove}>
      {children}
    </div>
  );
}
