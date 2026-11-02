import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionHeading, Shell, focusRingClass } from './primitives';

/**
 * FAQ — native <details>/<summary> so it works with JavaScript disabled. The
 * localized strings also feed the FAQPage JSON-LD emitted below.
 */
const faqItemKeys = ['aiKeys', 'aiReality', 'mcpServer', 'imports', 'dataVisibility'] as const;

export function Faq() {
  const t = useTranslations('publicPages.landing.faq');
  const truth = useTranslations('publicPages.landing.productTruth');
  const importT = useTranslations('pagesSettings.import');
  const answerOverrides: Record<(typeof faqItemKeys)[number], string> = {
    aiKeys: truth('aiKeys'),
    aiReality: truth('ai'),
    mcpServer: truth('mcp'),
    imports: importT('subtitle'),
    dataVisibility: truth('data'),
  };
  const faqItems = faqItemKeys.map((key) => ({
    key,
    question: t(`items.${key}.question`),
    answer: answerOverrides[key],
  }));

  return (
    <section
      id="faq"
      aria-labelledby="landing-faq-title"
      className="scroll-mt-20 border-t border-[var(--landing-border)] bg-[var(--landing-bg-soft)] py-20 sm:py-28"
    >
      <Shell>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              id="landing-faq-title"
              title={t('title')}
              description={t('description')}
            />
          </div>

          <div className="min-w-0 divide-y divide-[var(--landing-border-strong)] border-y border-[var(--landing-border-strong)]">
            {faqItems.map((item) => (
              <details key={item.key} className="lp-faq group">
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 text-[16px] font-medium text-[var(--landing-text-dark)] transition-colors duration-150 hover:text-[var(--landing-accent)] sm:text-[17px] [&::-webkit-details-marker]:hidden ${focusRingClass}`}
                >
                  <span>{item.question}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--landing-border-strong)] bg-[var(--landing-bg-card)] transition-transform duration-200 group-open:rotate-45">
                    <Plus className="h-4 w-4 text-[var(--landing-text-muted)]" aria-hidden="true" />
                  </span>
                </summary>
                <p className="lp-faq-answer landing-body max-w-2xl pb-6 pe-12 text-[15px] text-[var(--landing-text-muted)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Shell>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }),
        }}
      />
    </section>
  );
}
