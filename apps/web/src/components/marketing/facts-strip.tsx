import { Bot, Braces, Command, Languages, Radio, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LineIcon } from './line-icon';

const FACTS: ReadonlyArray<{ id: string; icon: LucideIcon }> = [
  { id: 'languages', icon: Languages },
  { id: 'keyboard', icon: Command },
  { id: 'mcp', icon: Bot },
  { id: 'api', icon: Braces },
  { id: 'realtime', icon: Radio },
];

/**
 * A row of verifiable product facts under the hero. There are no logos,
 * counts of customers, or benchmarks here on purpose: every line describes
 * something the product does today. On phones the row snap-scrolls sideways
 * as cards; from `sm` up it is a plain grid.
 */
export function FactsStrip() {
  const t = useTranslations('publicPages.landing.facts');

  return (
    <section
      aria-label={t('aria')}
      className="border-y border-[var(--landing-border)] bg-[var(--landing-bg-soft)]"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <ul className="lp-facts" tabIndex={0} aria-label={t('aria')}>
          {FACTS.map((fact) => (
            <li key={fact.id} className="lp-fact lp-icon-host">
              <span className="lp-icon-frame shrink-0">
                <LineIcon icon={fact.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-[var(--landing-text-dark)]">
                  {t(`items.${fact.id}.title`)}
                </span>
                <span className="landing-body mt-0.5 block text-[13px] text-[var(--landing-text-muted)]">
                  {t(`items.${fact.id}.body`)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
