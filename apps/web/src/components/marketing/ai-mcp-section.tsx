import { Bot } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties, ReactNode } from 'react';
import { InView } from './in-view';
import { DotField } from './patterns';
import { SectionHeading, Shell } from './primitives';

type CssVars = CSSProperties & Record<`--${string}`, string>;

const capabilities = ['ask', 'triage', 'mcp'] as const;

export function AiMcpSection() {
  const t = useTranslations('publicPages.landing.aiMcp');
  const truth = useTranslations('publicPages.landing.productTruth');

  return (
    <section
      id="agents"
      aria-labelledby="landing-agents-title"
      className="relative scroll-mt-20 overflow-hidden border-t border-[var(--landing-border)] bg-[var(--landing-bg-soft)] py-20 sm:py-28"
    >
      <DotField />
      <Shell className="relative">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <SectionHeading
              id="landing-agents-title"
              title={t('title')}
              description={truth('aiSummary')}
            />
            <ul className="mt-10 divide-y divide-[var(--landing-border-strong)] border-y border-[var(--landing-border-strong)]">
              {capabilities.map((key) => (
                <li key={key} className="py-5">
                  <h3 className="text-[17px] font-medium text-[var(--landing-text-dark)]">
                    {t(`capabilities.${key}.title`)}
                  </h3>
                  <p className="landing-body mt-1.5 text-[15px] text-[var(--landing-text-muted)]">
                    {truth(key === 'triage' ? 'ai' : key)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-24">
            <ToolCallTranscript />
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Line({
  index,
  children,
  className = '',
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`lp-line ${className}`}
      style={{ '--lp-delay': `${120 + index * 160}ms` } as CssVars}
    >
      {children}
    </div>
  );
}

/**
 * Illustrative MCP exchange rendered as a code sample: an external agent calls
 * two tools and Orrery answers. Lines stream in once when scrolled into view.
 */
function ToolCallTranscript() {
  const t = useTranslations('publicPages.landing.aiMcp.mock');
  const resultRows = [
    { id: 'WEB-204', label: t('resultLabels.checkout') },
    { id: 'WEB-211', label: t('resultLabels.flaky') },
    { id: 'API-58', label: t('resultLabels.tests') },
  ];

  return (
    <InView
      className="overflow-hidden rounded-xl border border-[#2e2e2e] bg-[var(--landing-terminal-bg)] text-[#ededed] shadow-[var(--landing-shadow-deep)]"
      threshold={0.35}
    >
      <div aria-hidden="true">
        <div className="flex items-center justify-between gap-3 border-b border-[#2e2e2e] px-5 py-3.5">
          <span className="flex min-w-0 items-center gap-2 font-mono text-[12px] text-[#a1a1a1]">
            <Bot className="h-4 w-4 shrink-0 text-[#3ecf8e]" />
            <span className="truncate">{t('session')}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#2e2e2e] px-2.5 py-0.5 text-[11px] text-[#a1a1a1]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3ecf8e]" />
            {t('connected')}
          </span>
        </div>

        <div className="space-y-3 p-5 font-mono text-[12.5px] leading-6">
          <Line index={0} className="text-[#a1a1a1]">
            <span className="text-[#3ecf8e]">{t('agent')}</span> {t('planning')}
          </Line>

          <Line index={1} className="rounded-lg border border-[#2e2e2e] bg-[#232323] px-3.5 py-2.5">
            <p className="text-[#a1a1a1]">
              <span className="text-[#3ecf8e]">{t('call')}</span> {'search_issues'}
            </p>
            <pre dir="ltr" className="mt-1 whitespace-pre-wrap text-start text-[#d4d4d4]">
              <code>{'{ "query": "flaky checkout tests", "status": "open" }'}</code>
            </pre>
          </Line>

          <Line index={2} className="rounded-lg border border-[#2e2e2e] bg-[#232323] px-3.5 py-2.5">
            <p className="text-[#a1a1a1]">
              <span className="text-[#7be3b3]">{t('result')}</span> {t('issueCount')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {resultRows.map((row) => (
                <span
                  key={row.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#2e2e2e] bg-[#1c1c1c] px-2 py-0.5 text-[11.5px]"
                >
                  <span className="text-[#ededed]">{row.id}</span>
                  <span className="text-[#8a8a8a]">{row.label}</span>
                </span>
              ))}
            </div>
          </Line>

          <Line index={3} className="rounded-lg border border-[#2e2e2e] bg-[#232323] px-3.5 py-2.5">
            <p className="text-[#a1a1a1]">
              <span className="text-[#3ecf8e]">{t('call')}</span> {'update_issue'}
            </p>
            <pre dir="ltr" className="mt-1 whitespace-pre-wrap text-start text-[#d4d4d4]">
              <code>{'{ "id": "WEB-211", "priority": "high", "labels": ["flaky"] }'}</code>
            </pre>
          </Line>

          <Line index={4} className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11.5px] text-[#8a8a8a]">{t('applied')}</span>
            <span className="rounded-full bg-[#1d352a] px-2.5 py-0.5 text-[11.5px] text-[#3ecf8e]">
              {t('priorityHigh')}
            </span>
            <span className="rounded-full bg-[#1d352a] px-2.5 py-0.5 text-[11.5px] text-[#3ecf8e]">
              {t('labelFlaky')}
            </span>
          </Line>
        </div>
      </div>
    </InView>
  );
}
