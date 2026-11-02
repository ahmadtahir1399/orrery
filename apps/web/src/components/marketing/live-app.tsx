import {
  Activity,
  ArrowRightLeft,
  Bot,
  Check,
  CircleDot,
  FolderKanban,
  Inbox,
  ListTodo,
  MessageSquare,
  MousePointer2,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties, ReactNode } from 'react';
import { TaskNebulaLogo } from '@/components/branding/tasknebula-logo';
import { ThreadCard, type ThreadMode } from './thread-card';

type CssVars = CSSProperties & Record<`--${string}`, string>;

/*
 * The product, rendered in code for the landing page. Every view is sample
 * data, aria-hidden, and animated with CSS loops that pause offscreen and hold
 * a finished frame under reduced motion (see `.lpa-*` in globals.css). Labels
 * reuse the app's own translated strings so the preview matches the product in
 * every locale; identifiers such as WEB-18 are sample data.
 */

type Priority = 'urgent' | 'high' | 'medium' | 'low';

function useBoardCopy() {
  const status = useTranslations('issuesViews.status');
  const columns = useTranslations('kanban.column.categories');
  const priority = useTranslations('issuesViews.priority');
  const issues = useTranslations('publicPages.landing.showcase.board.issues');
  return { status, columns, priority, issues };
}

function PriorityGlyph({ level }: { level: Priority }) {
  return (
    <span className="lpa-prio" data-level={level}>
      <i />
      <i />
      <i />
    </span>
  );
}

function Avatar({
  initials,
  tone,
}: {
  initials: string;
  tone: 'emerald' | 'blue' | 'ink' | 'amber';
}) {
  return (
    <span className="lpa-avatar" data-tone={tone}>
      {initials}
    </span>
  );
}

function Card({
  id,
  title,
  level,
  levelLabel,
  owner,
  tone,
  className = '',
  style,
  children,
  thread = false,
}: {
  id: string;
  title: string;
  level: Priority;
  levelLabel: string;
  owner: string;
  tone: 'emerald' | 'blue' | 'ink' | 'amber';
  className?: string;
  style?: CssVars;
  children?: ReactNode;
  /** Render as the story's thread element (or its ghost slot). */
  thread?: ThreadMode;
}) {
  const body = (
    <>
      <div className="lpa-card-top">
        <span className="lpa-key">{id}</span>
        <PriorityGlyph level={level} />
      </div>
      <p className="lpa-card-title">{title}</p>
      <div className="lpa-card-foot">
        <span className="lpa-chip" data-level={level}>
          {levelLabel}
        </span>
        <Avatar initials={owner} tone={tone} />
      </div>
      {children}
    </>
  );
  if (thread) {
    return (
      <ThreadCard mode={thread} className={`lpa-card ${className}`}>
        {body}
      </ThreadCard>
    );
  }
  return (
    <div className={`lpa-card ${className}`} style={style}>
      {body}
    </div>
  );
}

function Counter({ name }: { name: string }) {
  return <span className="lpa-count" data-counter={name} />;
}

function Cursor({ who, label }: { who: 'a' | 'b'; label: string }) {
  return (
    <span className="lpa-cursor" data-who={who}>
      <MousePointer2 strokeWidth={1.5} />
      <span>{label}</span>
    </span>
  );
}

/** Main workspace window: sidebar, sprint board, a drag, and an agent-created issue. */
export function LiveBoard({
  chrome = true,
  thread = false,
}: {
  chrome?: boolean;
  thread?: ThreadMode;
}) {
  const nav = useTranslations('nav');
  const stats = useTranslations('dashboard');
  const agentStatus = useTranslations('issuePanels.agent.runnerStatuses');
  const { status, columns, priority, issues } = useBoardCopy();

  return (
    <div className="lpa-window" data-chrome={chrome ? 'true' : undefined}>
      <div className="lpa-titlebar">
        <span className="lpa-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="lpa-search">
          <Search strokeWidth={1.75} />
          <span>{nav('search_placeholder')}</span>
          <kbd>{'⌘K'}</kbd>
        </span>
        <span className="lpa-presence">
          <Avatar initials="AT" tone="emerald" />
          <Avatar initials="ML" tone="blue" />
          <span className="lpa-live-dot" />
        </span>
      </div>

      <div className="lpa-body">
        <aside className="lpa-sidebar">
          <div className="lpa-brand">
            <TaskNebulaLogo compact className="h-5 w-5" />
            <span>{'Orrery'}</span>
          </div>
          <span className="lpa-nav">
            <Inbox strokeWidth={1.75} />
            {nav('inbox')}
            <b className="lpa-badge">
              <Counter name="inbox" />
            </b>
          </span>
          <span className="lpa-nav">
            <ListTodo strokeWidth={1.75} />
            {nav('my_issues')}
          </span>
          <span className="lpa-nav" data-active="true">
            <FolderKanban strokeWidth={1.75} />
            {nav('projects')}
          </span>
          <span className="lpa-nav">
            <Activity strokeWidth={1.75} />
            {nav('activity')}
          </span>
          <span className="lpa-section">{nav('projects')}</span>
          <span className="lpa-project" data-active="true">
            <i data-tone="emerald" />
            {'WEB'}
          </span>
          <span className="lpa-project">
            <i data-tone="blue" />
            {'API'}
          </span>
          <span className="lpa-project">
            <i data-tone="amber" />
            {'APP'}
          </span>
        </aside>

        <div className="lpa-main">
          <div className="lpa-stats">
            <span className="lpa-stat">
              <small>{stats('stat_active')}</small>
              <Counter name="active" />
            </span>
            <span className="lpa-stat" data-accent="true">
              <small>{stats('stat_completed')}</small>
              <Counter name="done" />
            </span>
            <span className="lpa-stat">
              <small>{stats('stat_blocked')}</small>
              <b>{'1'}</b>
            </span>
            <span className="lpa-stat">
              <small>{stats('stat_story_points')}</small>
              <b>{'42'}</b>
            </span>
          </div>

          <div className="lpa-board">
            <div className="lpa-col">
              <div className="lpa-col-head">
                <i data-tone="ink" />
                {status('todo')}
                <Counter name="todo" />
              </div>
              <Card
                id="WEB-31"
                title={issues('web21.title')}
                level="high"
                levelLabel={priority('high')}
                owner="AG"
                tone="emerald"
                className={thread ? '' : 'lpa-card-new'}
                thread={thread}
              >
                <span className="lpa-agent-tag">
                  <Bot strokeWidth={1.75} />
                  <span className="lpa-swap">
                    <span>{agentStatus('running')}</span>
                    <span>{agentStatus('completed')}</span>
                  </span>
                </span>
              </Card>
              <Card
                id="WEB-24"
                title={issues('web24.title')}
                level="medium"
                levelLabel={priority('medium')}
                owner="TF"
                tone="blue"
              />
              <Card
                id="WEB-09"
                title={issues('web09.title')}
                level="low"
                levelLabel={priority('low')}
                owner="ML"
                tone="ink"
              />
            </div>

            <div className="lpa-col">
              <div className="lpa-col-head">
                <i data-tone="blue" />
                {columns('in_progress')}
                <Counter name="progress" />
              </div>
              <div className="lpa-slot" />
              <Card
                id="WEB-05"
                title={issues('web05.title')}
                level="medium"
                levelLabel={priority('medium')}
                owner="AT"
                tone="emerald"
              />
              <Card
                id="API-17"
                title={issues('api17.title')}
                level="urgent"
                levelLabel={priority('urgent')}
                owner="ML"
                tone="blue"
              />
            </div>

            <div className="lpa-col">
              <div className="lpa-col-head">
                <i data-tone="amber" />
                {columns('in_review')}
                <Counter name="review" />
              </div>
              <Card
                id="API-12"
                title={issues('api12.title')}
                level="high"
                levelLabel={priority('high')}
                owner="TF"
                tone="blue"
              />
              <div className="lpa-drop" />
            </div>

            <div className="lpa-col lpa-col-done">
              <div className="lpa-col-head">
                <i data-tone="emerald" />
                {columns('done')}
              </div>
              <Card
                id="APP-19"
                title={issues('app19.title')}
                level="low"
                levelLabel={priority('low')}
                owner="AT"
                tone="emerald"
              />
              <Card
                id="API-09"
                title={issues('api09.title')}
                level="medium"
                levelLabel={priority('medium')}
                owner="ML"
                tone="blue"
              />
            </div>

            <Card
              id="WEB-18"
              title={issues('web18.title')}
              level="high"
              levelLabel={priority('high')}
              owner="AT"
              tone="emerald"
              className="lpa-card-drag"
            >
              <Cursor who="a" label="AT" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Floating activity feed that logs the drag the moment it lands. */
export function LiveActivity() {
  const nav = useTranslations('nav');
  const team = useTranslations('publicPages.landing.showcase.team');
  const help = useTranslations('personalHelp');

  return (
    <div className="lpa-panel lpa-activity">
      <div className="lpa-panel-head">
        <Activity strokeWidth={1.75} />
        {nav('activity')}
        <span className="lpa-live-dot" />
      </div>
      <ul>
        <li className="lpa-feed-new">
          <Avatar initials="AT" tone="emerald" />
          <span className="lpa-feed-copy">
            <b>{team('activityItems.moved')}</b>
            <small>{help('justNow')}</small>
          </span>
        </li>
        <li>
          <Avatar initials="ML" tone="blue" />
          <span className="lpa-feed-copy">
            <b>{team('activityItems.linked')}</b>
            <small>{team('times.fourMinutes')}</small>
          </span>
        </li>
        <li>
          <Avatar initials="TF" tone="ink" />
          <span className="lpa-feed-copy">
            <b>{team('activityItems.closed')}</b>
            <small>{team('times.elevenMinutes')}</small>
          </span>
        </li>
      </ul>
    </div>
  );
}

/** Floating agent run: three MCP tool calls complete in order. */
export function LiveAgent() {
  const mock = useTranslations('publicPages.landing.aiMcp.mock');
  const agentStatus = useTranslations('issuePanels.agent.runnerStatuses');

  const steps = [
    { id: 'search', tool: 'search_issues', icon: Search },
    { id: 'update', tool: 'update_issue', icon: ArrowRightLeft },
    { id: 'create', tool: 'create_issue', icon: Plus },
  ];

  return (
    <div className="lpa-panel lpa-agent">
      <div className="lpa-panel-head">
        <span className="lpa-bot">
          <Bot strokeWidth={1.75} />
        </span>
        <span className="lpa-agent-title">
          <b>{mock('agent')}</b>
          <small>{mock('planning')}</small>
        </span>
        <span className="lpa-run">
          <span className="lpa-swap">
            <span>{agentStatus('running')}</span>
            <span>{agentStatus('completed')}</span>
          </span>
        </span>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li key={step.id} style={{ '--step': String(index) } as CssVars}>
            <span className="lpa-step-icon">
              <step.icon strokeWidth={1.75} />
            </span>
            <code>{step.tool}</code>
            <span className="lpa-step-state">
              <CircleDot strokeWidth={2} />
              <Check strokeWidth={2.5} />
            </span>
          </li>
        ))}
      </ol>
      <div className="lpa-progress">
        <i />
      </div>
    </div>
  );
}

/** Tour view for intake: an issue list where an agent-triaged issue arrives. */
export function LiveIssues({ thread = false }: { thread?: ThreadMode }) {
  const nav = useTranslations('nav');
  const { status, columns, priority, issues } = useBoardCopy();

  const rows: Array<{
    id: string;
    title: string;
    level: Priority;
    state: string;
    tone: 'emerald' | 'blue' | 'ink' | 'amber';
    owner: string;
    stateTone: string;
  }> = [
    {
      id: 'WEB-24',
      title: issues('web24.title'),
      level: 'medium',
      state: status('todo'),
      stateTone: 'ink',
      owner: 'TF',
      tone: 'blue',
    },
    {
      id: 'API-17',
      title: issues('api17.title'),
      level: 'urgent',
      state: columns('in_progress'),
      stateTone: 'blue',
      owner: 'ML',
      tone: 'ink',
    },
    {
      id: 'API-12',
      title: issues('api12.title'),
      level: 'high',
      state: columns('in_review'),
      stateTone: 'amber',
      owner: 'AT',
      tone: 'emerald',
    },
    {
      id: 'APP-06',
      title: issues('app06.title'),
      level: 'medium',
      state: status('todo'),
      stateTone: 'ink',
      owner: 'ML',
      tone: 'blue',
    },
    {
      id: 'APP-19',
      title: issues('app19.title'),
      level: 'low',
      state: columns('done'),
      stateTone: 'emerald',
      owner: 'AT',
      tone: 'emerald',
    },
  ];

  return (
    <div className="lpa-window lpa-view">
      <div className="lpa-view-head">
        <ListTodo strokeWidth={1.75} />
        <b>{nav('my_issues')}</b>
        <span className="lpa-filter" data-active="true">
          {priority('urgent')}
        </span>
        <span className="lpa-filter">{priority('high')}</span>
        <span className="lpa-filter">{priority('medium')}</span>
      </div>
      <ul className="lpa-rows">
        <ThreadCard
          mode={thread}
          as="li"
          className={thread ? 'lpa-row lpa-row-tagged' : 'lpa-row lpa-row-new'}
        >
          <PriorityGlyph level="high" />
          <span className="lpa-key">{'WEB-31'}</span>
          <span className="lpa-row-title">{issues('web21.title')}</span>
          <span className="lpa-agent-tag">
            <Sparkles strokeWidth={1.75} />
            {priority('high')}
          </span>
          <span className="lpa-state" data-tone="ink">
            {status('todo')}
          </span>
          <Avatar initials="AG" tone="emerald" />
        </ThreadCard>
        {rows.map((row) => (
          <li key={row.id} className="lpa-row">
            <PriorityGlyph level={row.level} />
            <span className="lpa-key">{row.id}</span>
            <span className="lpa-row-title">{row.title}</span>
            <span className="lpa-state" data-tone={row.stateTone}>
              {row.state}
            </span>
            <Avatar initials={row.owner} tone={row.tone} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Story view for building: one issue delegated to an agent. The run's tool
 * calls complete on the left, the activity log fills on the right, and the
 * footer keeps the human owner and the review gate in view.
 */
export function LiveBuild({ thread = false }: { thread?: ThreadMode }) {
  const mock = useTranslations('publicPages.landing.aiMcp.mock');
  const agentStatus = useTranslations('issuePanels.agent.runnerStatuses');
  const build = useTranslations('publicPages.landing.workflow.visuals.build');
  const board = useTranslations('publicPages.landing.showcase.board');
  const issues = useTranslations('publicPages.landing.showcase.board.issues');
  const team = useTranslations('publicPages.landing.showcase.team');
  const help = useTranslations('personalHelp');

  const steps = [
    { id: 'search', tool: 'search_issues', icon: Search },
    { id: 'transition', tool: 'transition_status', icon: ArrowRightLeft },
    { id: 'comment', tool: 'add_comment', icon: MessageSquare },
  ];

  return (
    <div className="lpa-window lpa-view lpa-build">
      <ThreadCard mode={thread} className="lpa-view-head">
        <span className="lpa-key">{'WEB-31'}</span>
        <b className="lpa-build-title">{issues('web21.title')}</b>
        <span className="lpa-run">
          <span className="lpa-swap">
            <span>{agentStatus('running')}</span>
            <span>{agentStatus('completed')}</span>
          </span>
        </span>
      </ThreadCard>

      <div className="lpa-build-grid">
        <div className="lpa-agent lpa-embed">
          <div className="lpa-panel-head">
            <span className="lpa-bot">
              <Bot strokeWidth={1.75} />
            </span>
            <span className="lpa-agent-title">
              <b>{mock('agent')}</b>
              <small>{mock('planning')}</small>
            </span>
          </div>
          <ol>
            {steps.map((step, index) => (
              <li key={step.id} style={{ '--step': String(index) } as CssVars}>
                <span className="lpa-step-icon">
                  <step.icon strokeWidth={1.75} />
                </span>
                <code>{step.tool}</code>
                <span className="lpa-step-state">
                  <CircleDot strokeWidth={2} />
                  <Check strokeWidth={2.5} />
                </span>
              </li>
            ))}
          </ol>
          <div className="lpa-progress">
            <i />
          </div>
        </div>

        <div className="lpa-activity lpa-embed">
          <div className="lpa-panel-head">
            <Activity strokeWidth={1.75} />
            {build('title')}
            <span className="lpa-live-dot" />
          </div>
          <ul>
            <li className="lpa-feed-new">
              <Avatar initials="AG" tone="emerald" />
              <span className="lpa-feed-copy">
                <b>{build('commented')}</b>
                <small>{help('justNow')}</small>
              </span>
            </li>
            <li>
              <Avatar initials="AG" tone="emerald" />
              <span className="lpa-feed-copy">
                <b>{build('movedToReview')}</b>
                <small>{team('times.fourMinutes')}</small>
              </span>
            </li>
            <li>
              <Avatar initials="AG" tone="emerald" />
              <span className="lpa-feed-copy">
                <b>{build('pickedUp')}</b>
                <small>{team('times.elevenMinutes')}</small>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="lpa-build-foot">
        <span className="lpa-build-owner">
          <Avatar initials="AT" tone="ink" />
          {board('meta.owner', { owner: 'AT' })}
        </span>
        <span className="lpa-agent-tag">
          <Bot strokeWidth={1.75} />
          {build('delegated')}
        </span>
        <span className="lpa-filter" data-active="true">
          {build('reviewRequired')}
        </span>
      </div>
    </div>
  );
}

/** Tour view for shipping: sprint stats, a live burndown, and the priority mix. */
export function LiveSprint({ thread = false }: { thread?: ThreadMode }) {
  const stats = useTranslations('dashboard');
  const charts = useTranslations('charts');
  const priority = useTranslations('issuesViews.priority');
  const sprint = useTranslations('publicPages.landing.showcase.sprint');
  const analytics = useTranslations('publicPages.landing.showcase.analytics');
  const ship = useTranslations('publicPages.landing.workflow.visuals.ship');
  const issues = useTranslations('publicPages.landing.showcase.board.issues');

  const mix: Array<{ id: Priority; value: number }> = [
    { id: 'urgent', value: 18 },
    { id: 'high', value: 34 },
    { id: 'medium', value: 30 },
    { id: 'low', value: 18 },
  ];
  const line = 'M0 18 L60 30 L120 44 L180 50 L240 70 L300 84 L360 104 L420 118';

  return (
    <div className="lpa-window lpa-view lpa-sprint">
      <div className="lpa-stats lpa-stats-wide">
        <span className="lpa-stat">
          <small>{charts('total')}</small>
          <b>{'18'}</b>
        </span>
        <span className="lpa-stat" data-accent="true">
          <small>{stats('stat_completed')}</small>
          <Counter name="sprint-done" />
        </span>
        <span className="lpa-stat">
          <small>{stats('stat_active')}</small>
          <b>{'6'}</b>
        </span>
        <span className="lpa-stat">
          <small>{charts('points')}</small>
          <b>{'42'}</b>
        </span>
      </div>
      <div className="lpa-sprint-grid">
        <div className="lpa-chart-card">
          <div className="lpa-chart-head">
            <b>{sprint('burndown')}</b>
            <small>{sprint('remaining')}</small>
          </div>
          <svg viewBox="0 0 420 130" className="lpa-burn">
            <defs>
              <linearGradient id="lpa-burn-fill" x1="0" x2="0" y1="0" y2="1">
                <stop className="lp-chart-stop" offset="0%" stopOpacity="0.3" />
                <stop className="lp-chart-stop" offset="100%" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[20, 60, 100].map((y) => (
              <line key={y} className="lp-chart-grid" x1="0" x2="420" y1={y} y2={y} />
            ))}
            <path className="lpa-burn-ideal" d="M0 14 L420 124" />
            <path className="lpa-burn-area" d={`${line} L420 130 L0 130 Z`} />
            <path className="lp-chart-line" pathLength={1} d={line} />
            <path className="lp-chart-comet" pathLength={1} d={line} />
          </svg>
        </div>
        <div className="lpa-chart-card">
          <div className="lpa-chart-head">
            <b>{analytics('priorityMix')}</b>
          </div>
          <ul className="lpa-mix">
            {mix.map((item, index) => (
              <li
                key={item.id}
                style={{ '--v': `${item.value}%`, '--i': String(index) } as CssVars}
              >
                <span>
                  <PriorityGlyph level={item.id} />
                  {priority(item.id)}
                </span>
                <i />
                <small>{`${item.value}%`}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lpa-shipped">
        <div className="lpa-chart-head">
          <b>{ship('shipped')}</b>
          <small>{'v1.4'}</small>
        </div>
        <ul className="lpa-rows">
          <ThreadCard mode={thread} as="li" className="lpa-row">
            <PriorityGlyph level="high" />
            <span className="lpa-key">{'WEB-31'}</span>
            <span className="lpa-row-title">{issues('web21.title')}</span>
            <span className="lpa-state" data-tone="emerald">
              {ship('resolution.fixed')}
            </span>
            <Avatar initials="AT" tone="ink" />
          </ThreadCard>
          <li className="lpa-row">
            <PriorityGlyph level="medium" />
            <span className="lpa-key">{'API-09'}</span>
            <span className="lpa-row-title">{issues('api09.title')}</span>
            <span className="lpa-state" data-tone="emerald">
              {ship('resolution.fixed')}
            </span>
            <Avatar initials="ML" tone="blue" />
          </li>
          <li className="lpa-row">
            <PriorityGlyph level="low" />
            <span className="lpa-key">{'APP-06'}</span>
            <span className="lpa-row-title">{issues('app06.title')}</span>
            <span className="lpa-state" data-tone="ink">
              {ship('resolution.wontDo')}
            </span>
            <Avatar initials="TF" tone="amber" />
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * The four shapes WEB-31 takes across the story, in chapter order: intake list
 * row, board card, issue header, shipped row. The journey's traveller renders
 * these while the views underneath show only a ghost slot (see
 * story-journey.tsx). Sizes match the ghosts because the markup is identical.
 */
export function useThreadShapes(): ReactNode[] {
  const { status, priority, issues } = useBoardCopy();
  const agentStatus = useTranslations('issuePanels.agent.runnerStatuses');
  const ship = useTranslations('publicPages.landing.workflow.visuals.ship');

  return [
    <div key="intake" className="lpa-row lpa-row-tagged lpa-thread">
      <PriorityGlyph level="high" />
      <span className="lpa-key">{'WEB-31'}</span>
      <span className="lpa-row-title">{issues('web21.title')}</span>
      <span className="lpa-agent-tag">
        <Sparkles strokeWidth={1.75} />
        {priority('high')}
      </span>
      <span className="lpa-state" data-tone="ink">
        {status('todo')}
      </span>
      <Avatar initials="AG" tone="emerald" />
    </div>,
    <div key="plan" className="lpa-card lpa-thread">
      <div className="lpa-card-top">
        <span className="lpa-key">{'WEB-31'}</span>
        <PriorityGlyph level="high" />
      </div>
      <p className="lpa-card-title">{issues('web21.title')}</p>
      <div className="lpa-card-foot">
        <span className="lpa-chip" data-level="high">
          {priority('high')}
        </span>
        <Avatar initials="AG" tone="emerald" />
      </div>
      <span className="lpa-agent-tag">
        <Bot strokeWidth={1.75} />
        {agentStatus('running')}
      </span>
    </div>,
    <div key="build" className="lpa-view-head lpa-thread">
      <span className="lpa-key">{'WEB-31'}</span>
      <b className="lpa-build-title">{issues('web21.title')}</b>
      <span className="lpa-run">{agentStatus('completed')}</span>
    </div>,
    <div key="ship" className="lpa-row lpa-thread">
      <PriorityGlyph level="high" />
      <span className="lpa-key">{'WEB-31'}</span>
      <span className="lpa-row-title">{issues('web21.title')}</span>
      <span className="lpa-state" data-tone="emerald">
        {ship('resolution.fixed')}
      </span>
      <Avatar initials="AT" tone="ink" />
    </div>,
  ];
}
