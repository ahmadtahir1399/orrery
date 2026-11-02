import {
  Database,
  Eye,
  Keyboard,
  LayoutPanelTop,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { InView } from './in-view';
import { LineIcon } from './line-icon';
import { SectionHeading, Shell } from './primitives';

type CssVars = CSSProperties & Record<`--${string}`, string>;

const PRINCIPLES: ReadonlyArray<{ id: string; icon: LucideIcon }> = [
  { id: 'workLeads', icon: LayoutPanelTop },
  { id: 'proof', icon: Eye },
  { id: 'accountable', icon: ShieldCheck },
  { id: 'ownership', icon: Database },
  { id: 'keyboard', icon: Keyboard },
];

/**
 * The commitments behind the product, mirrored from PRODUCT.md. A numbered
 * list on a thin rail: the same accountable-path signature the workbench uses.
 */
export function PrinciplesSection() {
  const t = useTranslations('publicPages.landing.principles');

  return (
    <section
      id="principles"
      aria-labelledby="landing-principles-title"
      className="scroll-mt-20 border-t border-[var(--landing-border)] py-20 sm:py-28"
    >
      <Shell>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              id="landing-principles-title"
              title={t('title')}
              description={t('description')}
            />
          </div>

          <ol className="lp-principles m-0 list-none p-0">
            {PRINCIPLES.map((principle, index) => (
              <InView
                key={principle.id}
                as="li"
                activate
                className="lp-reveal lp-principle lp-icon-host relative flex gap-5 py-7 first:pt-0 last:pb-0 sm:gap-6"
                style={{ '--lp-delay': `${index * 70}ms` } as CssVars}
              >
                <span className="lp-icon-frame">
                  <LineIcon icon={principle.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <span className="lp-chapter-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-1 text-[19px] font-medium tracking-[-0.01em] text-[var(--landing-text-dark)] sm:text-[21px]">
                    {t(`items.${principle.id}.title`)}
                  </h3>
                  <p className="landing-body mt-2 max-w-lg text-[15px] text-[var(--landing-text-muted)] sm:text-[16px]">
                    {t(`items.${principle.id}.body`)}
                  </p>
                </div>
              </InView>
            ))}
          </ol>
        </div>
      </Shell>
    </section>
  );
}
