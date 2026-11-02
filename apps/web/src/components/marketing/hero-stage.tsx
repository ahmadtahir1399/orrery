'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { InView } from './in-view';

type CssVars = CSSProperties & Record<`--${string}`, string>;

export interface HeroView {
  id: string;
  label: string;
  view: ReactNode;
}

/** How each position in the stack sits in space: front first, then behind. */
const DEPTHS = [
  // Opacity stays 1 for visible layers; CSS applies a scrim per depth so the
  // text keeps real contrast and no blur filter runs in the hot path. Only
  // the parked layer (depth 3) is transparent.
  { z: 0, y: 0, scale: 1, opacity: 1 },
  { z: -150, y: -46, scale: 0.94, opacity: 1 },
  { z: -300, y: -88, scale: 0.88, opacity: 1 },
  { z: -450, y: -126, scale: 0.83, opacity: 0 },
] as const;

const CYCLE_MS = 6000;
/** The deck moves on one clean expo-out curve: no overshoot, nothing to settle. */
const STACK_TWEEN = { duration: 0.72, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * Hero stage: the product as a deck of live views in 3D. The front view is
 * sharp and lit; the others recede up and back. Every few seconds the deck
 * advances (the front view sinks into the stack, the next one comes forward),
 * pausing while the pointer rests on it, while it is offscreen, and under
 * reduced motion. The pills below are real controls for the same deck.
 *
 * The whole rig settles from a tilt as it scrolls into view and leans toward
 * the pointer; the two floating panels sit at different depths so they
 * parallax against the deck. Server and client render identical motion
 * styles; entrance choreography is CSS gated on `data-armed` so a page
 * without JavaScript still shows everything.
 */
export function HeroStage({
  views,
  side,
  front,
  caption,
  ariaLabel,
}: {
  views: HeroView[];
  side: ReactNode;
  front: ReactNode;
  caption: string;
  ariaLabel: string;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const pausedRef = useRef(false);
  const inViewRef = useRef(true);

  const advance = useCallback(() => {
    setActive((index) => (index + 1) % views.length);
    setCycle((n) => n + 1);
  }, [views.length]);

  // Auto-advance. Any manual pick restarts the timer so a chosen view gets a
  // full turn before the deck moves on.
  useEffect(() => {
    if (reduceMotion || views.length < 2) return undefined;
    const timer = window.setInterval(() => {
      if (pausedRef.current || !inViewRef.current || document.hidden) return;
      advance();
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [advance, reduceMotion, views.length, cycle]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry?.isIntersecting ?? true;
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const select = (index: number) => {
    setActive(index);
    setCycle((n) => n + 1);
  };

  // Settle from a tilt as the stage scrolls into view.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'center center'],
  });
  const settle = useSpring(useTransform(scrollYProgress, [0.15, 1], [0, 1], { clamp: true }), {
    stiffness: 90,
    damping: 24,
    mass: 0.6,
  });

  // Lean toward the pointer; panels move more than the deck for parallax.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 20,
  });
  const leanX = useSpring(useTransform(pointerY, [-0.5, 0.5], [4, -4]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateX = useTransform(
    [settle, leanX],
    ([s, lean]: number[]) => 18 * (1 - (s ?? 0)) + (lean ?? 0)
  );
  const rotateY = useTransform(leanY, (lean) => lean);
  const scale = useTransform(settle, [0, 1], [0.95, 1]);
  const deckX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 120,
    damping: 20,
  });
  const sideX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-26, 26]), {
    stiffness: 110,
    damping: 18,
  });
  const sideY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-16, 16]), {
    stiffness: 110,
    damping: 18,
  });
  const frontX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-34, 34]), {
    stiffness: 110,
    damping: 18,
  });
  const frontY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-22, 22]), {
    stiffness: 110,
    damping: 18,
  });
  const sideZ = useTransform(settle, [0, 1], [240, 110]);
  const frontZ = useTransform(settle, [0, 1], [320, 150]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    pausedRef.current = false;
  };

  return (
    <div className="relative mx-auto mt-10 w-full max-w-[1200px] px-4 sm:mt-12 sm:px-6 lg:px-8">
      <InView live threshold={0} className="lp-live lp-hero-enter">
        <div
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => {
            pausedRef.current = true;
          }}
          onPointerLeave={handlePointerLeave}
          className="lp-stage relative"
          data-front={views[active]?.id}
          aria-hidden="true"
        >
          <motion.div
            className="lp-rig relative pb-[3%] pt-[1%] lg:px-[9%]"
            style={{ rotateX, rotateY, scale, transformOrigin: '50% 0%' }}
          >
            <motion.div className="lp-deck relative" style={{ x: deckX }}>
              {views.map((item, index) => {
                const depth = (index - active + views.length) % views.length;
                const target = DEPTHS[Math.min(depth, DEPTHS.length - 1)] ?? DEPTHS[0];
                return (
                  <motion.div
                    key={item.id}
                    className="lp-hero-layer"
                    data-depth={depth}
                    style={{ zIndex: views.length - depth, '--lp-i': String(index) } as CssVars}
                    animate={{
                      z: target.z,
                      y: target.y,
                      scale: target.scale,
                      opacity: target.opacity,
                    }}
                    transition={reduceMotion ? { duration: 0 } : STACK_TWEEN}
                  >
                    <div className="lp-hero-layer-in lpa-glow">{item.view}</div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              className="lp-float-pane lp-hero-pane start-0 top-[42%] hidden lg:block"
              style={{ translateZ: sideZ, x: sideX, y: sideY }}
            >
              <div className="lp-bob" style={{ '--bob-delay': '-2s' } as CssVars}>
                {side}
              </div>
            </motion.div>
            <motion.div
              className="lp-float-pane lp-hero-pane end-0 top-[6%] hidden lg:block"
              style={{ translateZ: frontZ, x: frontX, y: frontY }}
            >
              <div className="lp-bob" style={{ '--bob-delay': '-5s' } as CssVars}>
                {front}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </InView>

      <div
        role="group"
        aria-label={ariaLabel}
        className="lp-hero-pills mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        {views.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={index === active}
            onClick={() => select(index)}
            className="lp-hero-pill-btn"
            data-active={index === active ? 'true' : 'false'}
            data-cycling={index === active ? 'true' : 'false'}
            style={{ '--lp-cycle': `${CYCLE_MS}ms` } as CssVars}
          >
            <span key={`${index}-${cycle}`} className="lp-hero-pill-fill" aria-hidden="true" />
            <span className="relative">{item.label}</span>
          </button>
        ))}
        <span className="basis-full text-center text-[13px] text-[var(--landing-text-muted)] sm:ms-3 sm:basis-auto">
          {caption}
        </span>
      </div>
    </div>
  );
}
