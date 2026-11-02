import {
  ArrowRightLeft,
  Bot,
  Boxes,
  Bug,
  Check,
  CircleCheck,
  Component,
  Flag,
  GitBranch,
  Hash,
  Layers,
  Milestone,
  MousePointer2,
  Plus,
  Search,
  Table2,
  Tag,
  UserPlus,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { InView } from './in-view';
import { LineIcon } from './line-icon';

type CssVars = CSSProperties & Record<`--${string}`, string>;

/*
 * Illustrations for the feature bento. They are aria-hidden and loop gently
 * while on screen (`.lp-live` pauses them offscreen); hovering a card, or
 * scrolling it into view on touch devices, turns up the emerald accents.
 * Identifiers such as WEB-18 are sample data.
 */

export interface KeyboardVisualLabels {
  search: string;
  commands: [string, string, string, string];
}

const KEYS = [
  { id: 'esc', label: 'esc', small: true, anim: 'none' },
  { id: 'cmd', label: '⌘', small: false, anim: 'lp-kp-cmd' },
  { id: 'k', label: 'K', small: false, anim: 'lp-kp-k' },
  { id: 'up', label: '↑', small: false, anim: 'none' },
  { id: 'down', label: '↓', small: false, anim: 'lp-kp-down' },
  { id: 'enter', label: '↵', small: false, anim: 'lp-kp-enter' },
];

const COMMAND_ICONS = [Plus, ArrowRightLeft, UserPlus, Tag];

/**
 * Isometric 3D keycaps drive a command palette: Cmd+K opens it, Down moves
 * twice, Enter picks. Command names reuse the app's own translated labels.
 */
export function KeyboardVisual({ labels }: { labels: KeyboardVisualLabels }) {
  return (
    <InView live decorative className="lp-live lp-kb">
      <div className="lp-keys-stage sm:w-[58%]">
        <div className="lp-keys-plane">
          {KEYS.map((key) => (
            <div
              key={key.id}
              className="lp-k"
              data-small={key.small ? 'true' : undefined}
              style={{ '--lp-k-anim': key.anim } as CssVars}
            >
              <span>
                <i>{key.label}</i>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-kb-palette">
        <div className="lp-kb-search">
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="lp-kb-caret" />
          <span>{labels.search}</span>
        </div>
        <div className="lp-kb-rows">
          <span className="lp-kb-highlight" />
          {labels.commands.map((command, index) => {
            const Icon = COMMAND_ICONS[index] ?? Plus;
            return (
              <div
                key={command}
                className="lp-kb-row"
                data-target={index === 2 ? 'true' : undefined}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span>{command}</span>
                {index === 2 ? <kbd className="landing-kbd">{'↵'}</kbd> : null}
              </div>
            );
          })}
        </div>
      </div>
    </InView>
  );
}

// Agents take turns: one packet every 4s on the 12s loop (see lp-packet-turn).
const ARMS = [
  { id: 'a', angle: '0deg', sig: '0s' },
  { id: 'b', angle: '120deg', sig: '4s' },
  { id: 'c', angle: '240deg', sig: '8s' },
];

const CORE_COLUMNS = [
  { id: 'todo', cards: [false, true, false] },
  { id: 'doing', cards: [true, false] },
  { id: 'done', cards: [false, true, false] },
];

/**
 * Three agents on one orbit, evenly spaced and wired by arms to a raised board.
 * They take turns on the 12s loop: a satellite pulses as it sends, its packet
 * runs down the arm, the board ripples as it lands, and one card advances a
 * column per turn — to do, doing, done — then the cycle restarts. Hover only
 * brightens; the choreography never restarts.
 */
export function OrreryVisual() {
  let cardIndex = 0;
  return (
    <InView live className="lp-live -mx-12 my-auto sm:-mx-16">
      <div className="lp-orrery" aria-hidden="true">
        <div className="lp-orrery-plane">
          <span className="lp-orbit-ring" data-dashed="true" style={{ '--r': '100%' } as CssVars} />
          <span className="lp-orbit-ring" data-track="true" style={{ '--r': '68%' } as CssVars} />
          <span className="lp-orbit-ring" style={{ '--r': '44%' } as CssVars} />
          <span className="lp-orrery-pulse" />
          <div className="lp-core">
            <div className="lp-core-top">
              <i className="lp-core-mover" />
              {CORE_COLUMNS.map((column) => (
                <span key={column.id} className="lp-core-col">
                  {column.cards.map((hot, index) => {
                    cardIndex += 1;
                    return (
                      <i
                        key={`${column.id}-${index}`}
                        data-hot={hot ? 'true' : undefined}
                        style={{ '--i': String(cardIndex) } as CssVars}
                      />
                    );
                  })}
                </span>
              ))}
            </div>
          </div>
          <div className="lp-orbit">
            {ARMS.map((arm) => (
              <div
                key={arm.id}
                className="lp-arm"
                style={{ '--a': arm.angle, '--sig': arm.sig } as CssVars}
              >
                <span className="lp-arm-line" />
                <div className="lp-satellite">
                  <span>
                    <Bot className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InView>
  );
}

const BAR_HEIGHTS = [38, 52, 46, 70, 64, 88, 110];
const CHART_LINE = 'M26 92 L70 78 L114 84 L158 60 L202 66 L246 42 L290 20';

const CHART_AREA = `${CHART_LINE} L290 140 L26 140 Z`;

/** Velocity bars under a live trend line; hovering regrows the bars. */
export function ChartVisual({ label }: { label: string }) {
  return (
    <InView live decorative className="lp-live mt-auto pt-8">
      <svg className="lp-chart" viewBox="0 0 320 150">
        <defs>
          <linearGradient id="lp-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop className="lp-chart-stop" offset="0%" stopOpacity="0.32" />
            <stop className="lp-chart-stop" offset="100%" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 60, 100, 140].map((y) => (
          <line key={y} className="lp-chart-grid" x1="0" x2="320" y1={y} y2={y} />
        ))}
        {BAR_HEIGHTS.map((height, index) => (
          <rect
            key={height}
            className="lp-chart-bar"
            x={14 + index * 44}
            y={140 - height}
            width="24"
            height={height}
            rx="4"
            data-hot={index > 3 ? 'true' : undefined}
            style={{ '--i': String(index) } as CssVars}
          />
        ))}
        <path className="lp-chart-area" d={CHART_AREA} />
        <path className="lp-chart-line" pathLength={1} d={CHART_LINE} />
        <path className="lp-chart-comet" pathLength={1} d={CHART_LINE} />
        <circle className="lp-chart-ping" cx="290" cy="20" r="5" />
        <circle className="lp-chart-dot" cx="290" cy="20" r="5" />
      </svg>
      <p className="mt-3 text-[13px] text-[var(--landing-text-muted)]">{label}</p>
    </InView>
  );
}

const IMPORT_TARGETS = ['WEB-231', 'API-88', 'WEB-19', 'APP-7'];

/** Work travels from each source along a dashed connector into an issue. */
export function ImportVisual({ sources }: { sources: string[] }) {
  return (
    <InView as="ul" live decorative className="lp-live lp-import -mx-6 mt-auto pt-8 sm:-mx-8">
      {sources.map((source, index) => (
        <li key={source} className="lp-import-row" style={{ '--i': String(index) } as CssVars}>
          <span className="lp-chip lp-chip-src">
            <Table2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            {source}
          </span>
          <span className="lp-chip lp-chip-dst">
            <Check className="h-3.5" strokeWidth={2} />
            {IMPORT_TARGETS[index]}
          </span>
        </li>
      ))}
    </InView>
  );
}

const FIELD_TILES = [
  { id: 'label', icon: Tag, hot: true },
  { id: 'components', icon: Boxes, hot: false },
  { id: 'version', icon: Milestone, hot: true },
  { id: 'resolution', icon: CircleCheck, hot: false },
  { id: 'bug', icon: Bug, hot: false },
  { id: 'branch', icon: GitBranch, hot: false },
  { id: 'flag', icon: Flag, hot: true },
  { id: 'epic', icon: Layers, hot: false },
  { id: 'component', icon: Component, hot: true },
  { id: 'key', icon: Hash, hot: false },
];

/** A tray of first-class backlog fields with a highlight sweeping across. */
export function FieldsVisual() {
  return (
    <InView live decorative className="lp-live lp-tiles-stage mt-auto pt-8">
      <div className="lp-tiles">
        {FIELD_TILES.map((tile, index) => (
          <span
            key={tile.id}
            className="lp-tile"
            data-hot={tile.hot ? 'true' : undefined}
            style={{ '--i': String(index) } as CssVars}
          >
            <LineIcon icon={tile.icon} className="h-6 w-6" />
          </span>
        ))}
      </div>
    </InView>
  );
}

const PRESENCE = [
  { initials: 'ML', tone: 'bg-[#3ecf8e] text-[#171717]' },
  { initials: 'TF', tone: 'bg-[#2162ca] text-white' },
  { initials: 'AT', tone: 'bg-[var(--landing-text-dark)] text-[var(--landing-bg)]' },
];

/**
 * Two people editing one issue: one types a new status while the other
 * selects the priority. The JSON is sample data and always reads left to right.
 */
export function RealtimeVisual({ liveCount }: { liveCount: string }) {
  return (
    <InView live decorative className="lp-live lp-rt">
      <div className="lp-rt-grid" />
      <div className="lp-rt-doc" dir="ltr">
        <div className="lp-rt-head">
          <i />
          <i />
          <i />
          <span>{'WEB-18.json'}</span>
        </div>
        <pre className="lp-rt-code">
          <span>
            <b>{'"key"'}</b>
            {': "WEB-18",'}
          </span>
          <span>
            <b>{'"status"'}</b>
            {': '}
            <span className="lp-rt-typed">
              <span className="lp-rt-typed-text">{'"in_review"'}</span>
              <span className="lp-rt-caret">
                <span className="lp-cursor" data-who="a">
                  <MousePointer2 strokeWidth={1.5} />
                  <span>
                    {'AT'}
                    {[0, 1, 2].map((index) => (
                      <i key={index} style={{ '--i': String(index) } as CssVars} />
                    ))}
                  </span>
                </span>
              </span>
            </span>
            {','}
          </span>
          <span>
            <b>{'"priority"'}</b>
            {': '}
            <span className="lp-rt-select">
              {'"high"'}
              <span className="lp-cursor" data-who="b">
                <MousePointer2 strokeWidth={1.5} />
                <span>{'ML'}</span>
              </span>
            </span>
          </span>
        </pre>
      </div>
      <div className="absolute end-0 top-0 flex items-center gap-2">
        <div className="flex -space-x-1.5 rtl:space-x-reverse">
          {PRESENCE.map((person) => (
            <span
              key={person.initials}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--landing-bg-card)] text-[10px] font-semibold ${person.tone}`}
            >
              {person.initials}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-border-strong)] bg-[var(--landing-bg-card)] px-2.5 py-0.5 text-[12px] text-[var(--landing-text-body)]">
          <span className="realtime-ping relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--landing-accent-fill)]" />
          {liveCount}
        </span>
      </div>
    </InView>
  );
}
