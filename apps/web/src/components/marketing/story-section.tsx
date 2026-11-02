import { useTranslations } from 'next-intl';
import { LiveBoard, LiveBuild, LiveIssues, LiveSprint } from './live-app';
import { SectionHeading } from './primitives';
import { StoryJourney, type StoryChapter } from './story-journey';

const CHAPTER_IDS = ['intake', 'plan', 'build', 'ship'] as const;

/**
 * The product story: one issue's path from intake to shipped, told as a
 * journey along a thread (story-journey.tsx). Copy lives under
 * `publicPages.landing.workflow`; the views are the same code-rendered product
 * the hero uses, with WEB-31 ghosted so the traveller can land in its slot.
 */
export function StorySection() {
  const workflow = useTranslations('publicPages.landing.workflow');
  const showcase = useTranslations('publicPages.landing.showcase');

  const views = {
    intake: {
      view: <LiveIssues thread />,
      stationView: <LiveIssues thread="ghost" />,
      alt: showcase('shots.issues'),
    },
    plan: {
      view: <LiveBoard thread />,
      stationView: <LiveBoard thread="ghost" />,
      alt: showcase('shots.board'),
    },
    build: {
      view: <LiveBuild thread />,
      stationView: <LiveBuild thread="ghost" />,
      alt: showcase('shots.build'),
    },
    ship: {
      view: <LiveSprint thread />,
      stationView: <LiveSprint thread="ghost" />,
      alt: showcase('shots.dashboard'),
    },
  } as const;

  const chapters: StoryChapter[] = CHAPTER_IDS.map((id, index) => ({
    id,
    index: String(index + 1).padStart(2, '0'),
    title: workflow(`steps.${id}.title`),
    body: workflow(`steps.${id}.body`),
    view: views[id].view,
    stationView: views[id].stationView,
    alt: views[id].alt,
  }));

  return (
    <section
      id="story"
      aria-labelledby="landing-story-title"
      className="scroll-mt-20 border-t border-[var(--landing-border)]"
    >
      <StoryJourney
        chapters={chapters}
        ariaLabel={workflow('tabsAria')}
        heading={
          <SectionHeading
            id="landing-story-title"
            title={workflow('title')}
            description={workflow('description')}
          />
        }
        pinnedHeading={
          <SectionHeading title={workflow('title')} description={workflow('description')} />
        }
      />
    </section>
  );
}
