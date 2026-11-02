'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

type InViewTag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'figure';

interface InViewProps {
  as?: InViewTag;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Keep toggling so looping visuals pause when they leave the viewport. */
  live?: boolean;
  /**
   * On devices without hover, mark the element `data-active` while it is mostly
   * on screen so hover-driven illustrations still play.
   */
  activate?: boolean;
  /** Hide purely decorative illustrations from assistive technology. */
  decorative?: boolean;
  threshold?: number;
  id?: string;
}

/**
 * Arms scroll-linked landing motion. Server-rendered markup stays fully visible;
 * this island sets `data-armed` after hydration, `data-inview` while in view, and
 * a one-shot `data-seen` once entered. CSS in globals.css (`.lp-reveal`, `.lp-live`,
 * `.lp-card`, `.lp-slab`, `.lp-line`) keys off those attributes, so a failed
 * script never hides content. Attributes are written directly to avoid
 * re-rendering React on scroll.
 */
export function InView({
  as: Tag = 'div',
  className,
  style,
  children,
  live = false,
  activate = false,
  decorative = false,
  threshold = 0.2,
  id,
}: InViewProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.inview = 'true';
      node.dataset.seen = 'true';
      return undefined;
    }

    node.dataset.armed = 'true';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          node.dataset.inview = 'true';
          // One-shot flag for reveals: never cleared, even for live hosts.
          node.dataset.seen = 'true';
          if (!live) observer.disconnect();
        } else if (live) {
          node.dataset.inview = 'false';
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);

    let activeObserver: IntersectionObserver | undefined;
    if (activate && window.matchMedia('(hover: none)').matches) {
      activeObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry) node.dataset.active = entry.isIntersecting ? 'true' : 'false';
        },
        { threshold: 0.5 }
      );
      activeObserver.observe(node);
    }

    return () => {
      observer.disconnect();
      activeObserver?.disconnect();
    };
  }, [activate, live, threshold]);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      id={id}
      className={className}
      style={style}
      aria-hidden={decorative ? true : undefined}
    >
      {children}
    </Tag>
  );
}
