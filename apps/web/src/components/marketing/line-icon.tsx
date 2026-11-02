import type { LucideIcon } from 'lucide-react';

/**
 * Thin decorative Lucide icon for the landing page. Inside an active host
 * (`.lp-card`, `.lp-icon-host`, or a selected tab) its strokes redraw; see
 * `.lp-icon` in globals.css.
 */
export function LineIcon({ icon: Icon, className = '' }: { icon: LucideIcon; className?: string }) {
  return <Icon aria-hidden="true" strokeWidth={1.5} className={`lp-icon ${className}`} />;
}
