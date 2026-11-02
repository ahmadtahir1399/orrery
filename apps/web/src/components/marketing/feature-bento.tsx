import { ChartColumn, Command, Import, Orbit, Radio, Tags, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties, ReactNode } from 'react';
import {
  ChartVisual,
  FieldsVisual,
  ImportVisual,
  KeyboardVisual,
  OrreryVisual,
  RealtimeVisual,
} from './bento-visuals';
import { InView } from './in-view';
import { LineIcon } from './line-icon';
import { SpotlightGroup } from './spotlight-group';
import { SectionHeading, Shell } from './primitives';

type CssVars = CSSProperties & Record<`--${string}`, string>;

const cardClass =
  'lp-reveal lp-live lp-card relative min-w-0 overflow-hidden rounded-xl border border-[var(--landing-border-strong)] p-6 hover:border-[var(--landing-border-light)] sm:p-8';

function CardHeading({ icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <LineIcon icon={icon} className="lp-card-title-icon h-5 w-5" />
        <h3 className="text-[19px] font-medium tracking-[-0.01em] text-[var(--landing-text-dark)]">
          {title}
        </h3>
      </div>
      <p className="landing-body mt-3 max-w-md text-[15px] text-[var(--landing-text-muted)]">
        {body}
      </p>
    </>
  );
}

function Cell({
  icon,
  title,
  body,
  className = '',
  delay = 0,
  children,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
  delay?: number;
  children?: ReactNode;
}) {
  return (
    <InView
      activate
      live
      className={`${cardClass} flex flex-col ${className}`}
      style={{ '--lp-delay': `${delay}ms` } as CssVars}
    >
      <CardHeading icon={icon} title={title} body={body} />
      {children}
    </InView>
  );
}

export function FeatureBento() {
  const t = useTranslations('publicPages.landing.features');
  const truth = useTranslations('publicPages.landing.productTruth');
  const importT = useTranslations('pagesSettings.import');
  const appNav = useTranslations('nav');
  const appActions = useTranslations('actions');
  const mobileNav = useTranslations('mobileNav');
  const issueSidebar = useTranslations('issueSidebar');
  const sources = useTranslations('settingsClients.import.source');

  return (
    <section
      id="features"
      aria-labelledby="landing-features-title"
      className="scroll-mt-20 border-t border-[var(--landing-border)] py-20 sm:py-28"
    >
      <Shell>
        <SectionHeading
          id="landing-features-title"
          title={t('title')}
          description={t('description')}
          align="center"
        />

        <SpotlightGroup className="mt-14 grid gap-4 lg:grid-cols-6">
          <Cell
            icon={Command}
            title={t('cards.keyboard.title')}
            body={t('cards.keyboard.body')}
            className="lg:col-span-4"
          >
            <KeyboardVisual
              labels={{
                search: appNav('search_placeholder'),
                commands: [
                  appActions('create_issue'),
                  mobileNav('changeStatus'),
                  mobileNav('assignToMe'),
                  issueSidebar('labels.add'),
                ],
              }}
            />
          </Cell>

          <Cell
            icon={Orbit}
            title={t('cards.agents.title')}
            body={truth('mcp')}
            className="lg:col-span-2"
            delay={80}
          >
            <OrreryVisual />
          </Cell>

          <Cell
            icon={ChartColumn}
            title={t('cards.analytics.title')}
            body={t('cards.analytics.body')}
            className="lg:col-span-2"
          >
            <ChartVisual label={t('visuals.analytics.velocity')} />
          </Cell>

          <Cell
            icon={Import}
            title={t('cards.import.title')}
            body={importT('subtitle')}
            className="lg:col-span-2"
            delay={80}
          >
            <ImportVisual
              sources={[
                sources('jira.label'),
                sources('linear.label'),
                sources('github.label'),
                sources('csv.label'),
              ]}
            />
          </Cell>

          <Cell
            icon={Tags}
            title={truth('structureTitle')}
            body={truth('structure')}
            className="lg:col-span-2"
            delay={160}
          >
            <FieldsVisual />
          </Cell>

          <InView
            activate
            live
            className={`${cardClass} grid gap-8 lg:col-span-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center`}
          >
            <div className="min-w-0">
              <CardHeading
                icon={Radio}
                title={t('cards.realtime.title')}
                body={truth('realtime')}
              />
            </div>
            <RealtimeVisual liveCount={t('visuals.collab.liveCount')} />
          </InView>
        </SpotlightGroup>
      </Shell>
    </section>
  );
}
