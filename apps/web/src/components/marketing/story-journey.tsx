'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { InView } from './in-view';
import { useThreadShapes } from './live-app';

type CssVars = CSSProperties & Record<`--${string}`, string>;

export interface StoryChapter {
  id: string;
  /** Two-digit chapter number, rendered in mono. */
  index: string;
  title: string;
  body: string;
  /** Plain view for the stacked (mobile / reduced-motion / no-JS) layout. */
  view: ReactNode;
  /** Station view with WEB-31 rendered as a ghost slot for the traveller. */
  stationView: ReactNode;
  /** Announced description of the view for assistive technology. */
  alt: string;
}

interface Anchor {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Geometry {
  spacing: number;
  trackWidth: number;
  /** Left edge of each station inside the track (mirrored for RTL). */
  lefts: number[];
  anchors: Anchor[];
}

/** Fraction of each leg spent settled in a station before and after moving. */
const HOLD = 0.26;
const STATION_GAP = 180;
/** How far (px) the thread arches above the slots between stations. */
const ARCH = 150;

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Layout offset of `node` inside `ancestor`, summed up the offsetParent chain. */
function offsetWithin(node: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = node;
  while (current && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

/** Scroll progress → position along the thread, holding at every station. */
export function threadPosition(progress: number, legs: number): number {
  if (legs <= 0) return 0;
  const scaled = clamp01(progress) * legs;
  const leg = Math.min(Math.floor(scaled), legs - 1);
  const moving = clamp01((scaled - leg - HOLD) / (1 - 2 * HOLD));
  return (leg + smooth(moving)) / legs;
}

/**
 * The story as a journey. The section pins for a few screens and scrolls
 * sideways along a drawn thread: four stations (intake, plan, build, ship),
 * each the live product view with a dashed slot where WEB-31 belongs. One
 * traveller — the card itself — rides the thread from slot to slot, changing
 * shape at each station (list row → board card → issue header → shipped row),
 * while the thread draws just ahead of it. Everything is scrubbed to scroll;
 * nothing runs on a timer.
 *
 * Below `lg`, under reduced motion, and without JavaScript the same chapters
 * render as a vertical stack instead (`.lp-story-stack`); CSS picks which.
 */
export function StoryJourney({
  chapters,
  ariaLabel,
  heading,
  pinnedHeading,
}: {
  chapters: StoryChapter[];
  ariaLabel: string;
  /** Section heading for the stacked layout (carries the labelling id). */
  heading: ReactNode;
  /** The same heading, without the id, shown inside the pinned viewport. */
  pinnedHeading: ReactNode;
}) {
  const legs = Math.max(1, chapters.length - 1);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stationRefs = useRef<Array<HTMLDivElement | null>>([]);
  const segmentRefs = useRef<Array<SVGPathElement | null>>([]);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const shapes = useThreadShapes();

  // Carousel state for the stacked layout: the slide most in view drives the
  // dots, and a dot scrolls its slide into place without moving the page.
  const slidesRef = useRef<HTMLOListElement | null>(null);
  const slideRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const root = slidesRef.current;
    const nodes = slideRefs.current.filter((node): node is HTMLLIElement => node !== null);
    if (!root || nodes.length === 0 || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSlide(Number((entry.target as HTMLElement).dataset.index ?? 0));
          }
        }
      },
      { root, threshold: 0.6 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [chapters.length]);
  const goToSlide = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.5 });
  const spacingValue = useMotionValue(0);
  // 1 for LTR (track slides left as you scroll), -1 for RTL (the story runs
  // right to left, so the track starts shifted and slides right).
  const directionValue = useMotionValue(1);
  const trackX = useTransform([progress, spacingValue, directionValue], ([p, s, d]: number[]) => {
    const travel = legs * (s ?? 0);
    return (d ?? 1) < 0 ? -travel * (1 - (p ?? 0)) : -travel * (p ?? 0);
  });
  const travellerX = useMotionValue(0);
  const travellerY = useMotionValue(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const stations = stationRefs.current.filter((node): node is HTMLDivElement => node !== null);
    if (!viewport || !track || stations.length !== chapters.length) return;

    const viewportWidth = viewport.clientWidth;
    const rtl = document.documentElement.dir === 'rtl';
    const stationWidth = Math.max(...stations.map((station) => station.offsetWidth));
    const spacing = stationWidth + STATION_GAP;
    const centerOffset = Math.max(24, (viewportWidth - stationWidth) / 2);
    const lefts = stations.map((_, index) => centerOffset + (rtl ? legs - index : index) * spacing);
    const anchors = stations.map((station, index) => {
      // Offsets rather than rects: unaffected by the scroll transform on the
      // track and the settle scale on the views.
      const ghost = station.querySelector<HTMLElement>('.lpa-ghost') ?? station;
      const offset = offsetWithin(ghost, station);
      return {
        x: (lefts[index] ?? 0) + offset.left + ghost.offsetWidth / 2,
        y: offset.top + ghost.offsetHeight / 2,
        w: ghost.offsetWidth,
        h: ghost.offsetHeight,
      };
    });
    spacingValue.set(spacing);
    directionValue.set(rtl ? -1 : 1);
    setGeometry({
      spacing,
      trackWidth: centerOffset * 2 + stationWidth + legs * spacing,
      lefts,
      anchors,
    });
  }, [chapters.length, directionValue, legs, spacingValue]);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => measure());
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [measure]);

  const place = useCallback(
    (p: number) => {
      const t = threadPosition(p, legs);
      const leg = Math.min(Math.floor(t * legs), legs - 1);
      const local = t * legs - leg;
      const path = segmentRefs.current[leg];
      if (path) {
        const point = path.getPointAtLength(local * path.getTotalLength());
        travellerX.set(point.x);
        travellerY.set(point.y);
      }
      const nearest = Math.round(t * legs);
      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActive(nearest);
      }
    },
    [legs, travellerX, travellerY]
  );

  useMotionValueEvent(progress, 'change', place);
  useEffect(() => {
    if (geometry) place(progress.get());
  }, [geometry, place, progress]);

  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const runway = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (index / legs) * runway, behavior: 'smooth' });
  };

  const anchor = geometry?.anchors[active];
  const segments = geometry
    ? geometry.anchors.slice(0, -1).map((from, index) => {
        const to = geometry.anchors[index + 1] ?? from;
        const dx = to.x - from.x;
        // Arch over the next station's text instead of crossing it.
        const lift = Math.min(from.y, to.y) - ARCH;
        return `M ${from.x} ${from.y} C ${from.x + dx * 0.3} ${lift}, ${to.x - dx * 0.3} ${lift}, ${to.x} ${to.y}`;
      })
    : [];

  return (
    <InView live className="lp-story-host lp-live mt-14" threshold={0}>
      {/* Stacked layout: phones and tablets get a snap carousel of chapter
          cards; desktop under reduced motion (or without JS) gets the same
          list on a vertical rail. CSS picks which. */}
      <div className="lp-story-stack mx-auto w-full max-w-[1200px] pb-20 sm:pb-28">
        <div className="px-4 sm:px-6 lg:px-8">{heading}</div>
        <ol
          ref={slidesRef}
          tabIndex={0}
          aria-label={ariaLabel}
          className="lp-story-slides lp-story-rail relative m-0 list-none"
        >
          {chapters.map((chapter, index) => (
            <li
              key={chapter.id}
              id={`story-${chapter.id}`}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              data-index={index}
              data-active={index === slide ? 'true' : 'false'}
              data-passed={index <= slide ? 'true' : 'false'}
              className="lp-chapter lp-story-slide relative scroll-mt-28"
            >
              <span aria-hidden="true" className="lp-chapter-dot" />
              <span className="lp-chapter-index">{chapter.index}</span>
              <h3 className="landing-title mt-2 text-[22px] text-[var(--landing-text-dark)] sm:text-[26px] lg:text-[28px]">
                {chapter.title}
              </h3>
              <p className="landing-body mt-3 max-w-md text-[15px] text-[var(--landing-text-muted)] sm:text-[16px] lg:text-[17px]">
                {chapter.body}
              </p>
              <span className="sr-only">{chapter.alt}</span>
              <InView live threshold={0} className="lp-live mt-5 lg:mt-6" decorative>
                <div className="lpa-glow">{chapter.view}</div>
              </InView>
            </li>
          ))}
        </ol>
        <div role="group" aria-label={ariaLabel} className="lp-story-dots">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              aria-pressed={index === slide}
              aria-label={`${chapter.index} ${chapter.title}`}
              onClick={() => goToSlide(index)}
              className="lp-story-dot"
              data-active={index === slide ? 'true' : 'false'}
            >
              {chapter.index}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned journey: desktop with motion allowed. */}
      <div ref={sectionRef} className="lp-journey" style={{ '--lp-legs': String(legs) } as CssVars}>
        <div ref={viewportRef} className="lp-journey-viewport">
          <div className="lp-journey-heading">{pinnedHeading}</div>
          <motion.div
            ref={trackRef}
            className="lp-journey-track"
            style={{ x: trackX, width: geometry ? `${geometry.trackWidth}px` : '100%' }}
          >
            <svg className="lp-thread" aria-hidden="true">
              {segments.map((d, index) => (
                <ThreadSegment
                  key={index}
                  d={d}
                  index={index}
                  legs={legs}
                  progress={progress}
                  pathRef={(node) => {
                    segmentRefs.current[index] = node;
                  }}
                />
              ))}
            </svg>

            {chapters.map((chapter, index) => (
              <Station
                key={chapter.id}
                chapter={chapter}
                index={index}
                legs={legs}
                progress={progress}
                left={geometry?.lefts[index] ?? 0}
                isActive={index === active}
                stationRef={(node) => {
                  stationRefs.current[index] = node;
                }}
              />
            ))}

            <motion.div
              className="lp-traveller"
              aria-hidden="true"
              style={{ x: travellerX, y: travellerY }}
              data-station={chapters[active]?.id}
            >
              <motion.div
                className="lp-traveller-in"
                animate={{ width: anchor?.w ?? 0, height: anchor?.h ?? 0 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                {shapes.map((shape, index) => (
                  <div
                    key={chapters[index]?.id ?? index}
                    className="lp-traveller-shape"
                    data-active={index === active ? 'true' : 'false'}
                  >
                    {shape}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          <div role="group" aria-label={ariaLabel} className="lp-journey-dots">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                type="button"
                aria-pressed={index === active}
                aria-label={`${chapter.index} ${chapter.title}`}
                onClick={() => jumpTo(index)}
                className="lp-journey-dot"
                data-active={index === active ? 'true' : 'false'}
                data-passed={index <= active ? 'true' : 'false'}
              >
                <span className="lp-chapter-index">{chapter.index}</span>
                <span className="lp-journey-dot-label">{chapter.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </InView>
  );
}

function ThreadSegment({
  d,
  index,
  legs,
  progress,
  pathRef,
}: {
  d: string;
  index: number;
  legs: number;
  progress: MotionValue<number>;
  pathRef: (node: SVGPathElement | null) => void;
}) {
  // The thread draws slightly ahead of the traveller so it always has a line
  // to ride on.
  const dashOffset = useTransform(progress, (p) => {
    const t = threadPosition(p, legs) * legs - index;
    return 1 - clamp01(t + 0.08);
  });
  return (
    <>
      <path className="lp-thread-track" d={d} pathLength={1} />
      <motion.path
        className="lp-thread-glow"
        d={d}
        pathLength={1}
        style={{ strokeDashoffset: dashOffset }}
      />
      <motion.path
        ref={pathRef}
        className="lp-thread-line"
        d={d}
        pathLength={1}
        style={{ strokeDashoffset: dashOffset }}
      />
    </>
  );
}

function Station({
  chapter,
  index,
  legs,
  progress,
  left,
  isActive,
  stationRef,
}: {
  chapter: StoryChapter;
  index: number;
  legs: number;
  progress: MotionValue<number>;
  left: number;
  isActive: boolean;
  stationRef: (node: HTMLDivElement | null) => void;
}) {
  // Chapter text is fully present while its station is centred and fades as
  // the next one approaches; the view itself stays put.
  const distance = useTransform(progress, (p) => Math.abs(p - index / legs) * legs);
  const textOpacity = useTransform(distance, [0, 0.3, 0.55], [1, 1, 0.18]);
  const textY = useTransform(distance, [0, 0.55], [0, 10]);
  const viewScale = useTransform(distance, [0, 0.55], [1, 0.965]);

  return (
    <div
      ref={stationRef}
      className="lp-station"
      data-station={chapter.id}
      data-active={isActive ? 'true' : 'false'}
      style={{ left: `${left}px` }}
    >
      <motion.div className="lp-station-text" style={{ opacity: textOpacity, y: textY }}>
        <span className="lp-chapter-index">{chapter.index}</span>
        <h3 className="landing-title mt-2 text-[26px] text-[var(--landing-text-dark)] xl:text-[30px]">
          {chapter.title}
        </h3>
        <p className="landing-body mt-3 text-[16px] text-[var(--landing-text-muted)] xl:text-[17px]">
          {chapter.body}
        </p>
        <span className="sr-only">{chapter.alt}</span>
      </motion.div>
      <motion.div
        className="lp-station-view lpa-glow"
        style={{ scale: viewScale }}
        aria-hidden="true"
      >
        {chapter.stationView}
      </motion.div>
    </div>
  );
}
