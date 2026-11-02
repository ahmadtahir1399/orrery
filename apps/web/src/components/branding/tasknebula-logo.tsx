import type { SVGProps } from 'react';

type TaskNebulaLogoProps = SVGProps<SVGSVGElement> & {
  compact?: boolean;
  /**
   * `brand` (default) — near-black app tile with an emerald mark, theme-agnostic.
   * `mono` — single-color outline variant driven by `currentColor`.
   */
  variant?: 'brand' | 'mono';
};

/**
 * Orrery mark: a rounded task tile with a checkmark crossed by a single orbit
 * and two satellite nodes, like a small orrery around finished work.
 *
 * The brand tile is near-black `#1C1C1C` with an emerald `#3ECF8E` mark (the
 * `--primary` fill from `globals.css`). Hex literals are intentional so the
 * mark stays stable across `data-theme` palettes and light/dark mode; a faint
 * inner edge keeps the tile legible on dark backgrounds.
 *
 * Geometry must stay in sync with the static assets in `public/icon.svg`,
 * `public/icons/*` and `src/app/{favicon.ico,apple-icon.png,opengraph-image.png}`.
 */
export function TaskNebulaLogo({
  compact = false,
  variant = 'brand',
  className,
  ...props
}: TaskNebulaLogoProps) {
  const size = compact ? 28 : 36;

  if (variant === 'mono') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <rect
          x="1.5"
          y="1.5"
          width="21"
          height="21"
          rx="5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="8.2"
          ry="3.3"
          transform="rotate(30 12 12)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.5"
        />
        <path
          d="M7.1 12.5 10.6 15.9 17 8.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18.55" cy="16.1" r="1.2" fill="currentColor" />
        <circle cx="5.45" cy="7.9" r="0.85" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Near-black tile */}
      <rect x="1" y="1" width="22" height="22" rx="6" fill="#1C1C1C" />
      {/* Faint inner edge so the tile reads on dark surfaces */}
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="21"
        rx="5.5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      {/* Orbit */}
      <ellipse
        cx="12"
        cy="12"
        rx="8.2"
        ry="3.3"
        transform="rotate(30 12 12)"
        fill="none"
        stroke="#3ECF8E"
        strokeWidth="1.1"
        opacity="0.45"
      />
      {/* Task checkmark */}
      <path
        d="M7.1 12.5 10.6 15.9 17 8.6"
        fill="none"
        stroke="#3ECF8E"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Primary satellite with a soft halo, and a trailing satellite */}
      <circle cx="18.55" cy="16.1" r="2.1" fill="#FFFFFF" opacity="0.14" />
      <circle cx="18.55" cy="16.1" r="1.2" fill="#FFFFFF" />
      <circle cx="5.45" cy="7.9" r="0.85" fill="#3ECF8E" opacity="0.85" />
    </svg>
  );
}
