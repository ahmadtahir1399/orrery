import { TaskNebulaLogo } from '@/components/branding/tasknebula-logo';
import { useTranslations } from 'next-intl';
import { Shell, focusRingClass } from './primitives';

export function MarketingFooter() {
  const t = useTranslations('publicPages.landing.footer');
  const nav = useTranslations('publicPages.landing.nav');

  const columns = [
    {
      id: 'product',
      title: t('columns.product'),
      links: [
        { id: 'story', label: nav('items.story'), href: '#story' },
        { id: 'features', label: t('links.features'), href: '#features' },
        { id: 'agents', label: nav('items.agents'), href: '#agents' },
        { id: 'faq', label: t('links.faq'), href: '#faq' },
      ],
    },
    {
      id: 'account',
      title: t('columns.resources'),
      links: [
        { id: 'signUp', label: nav('startFree'), href: '/auth/signup' },
        { id: 'signIn', label: t('links.signIn'), href: '/auth/signin' },
        { id: 'openapi', label: t('links.openapiSpec'), href: '/openapi.json' },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)]">
      <Shell className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))] lg:gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <TaskNebulaLogo compact />
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--landing-text-dark)]">
                {'Orrery'}
              </span>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[var(--landing-text-muted)]">
              {t('tagline')}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[var(--landing-text-muted)]">
              {t('description')}
            </p>
          </div>

          {/* Two link columns sit side by side on phones and join the outer grid at lg. */}
          <div className="grid grid-cols-2 gap-6 lg:contents">
            {columns.map((column) => (
              <div key={column.id}>
                <h3 className="text-[14px] font-medium text-[var(--landing-text-dark)]">
                  {column.title}
                </h3>
                <ul className="mt-2 flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        className={`inline-flex min-h-11 min-w-11 items-center rounded-sm text-[14px] text-[var(--landing-text-muted)] transition-colors duration-150 hover:text-[var(--landing-text-dark)] lg:min-h-9 ${focusRingClass}`}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--landing-border)] pt-6 text-[13px] text-[var(--landing-text-muted)] sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('copyright', { year: new Date().getFullYear() })}</span>
          <span>{t('trademarks')}</span>
        </div>
      </Shell>
    </footer>
  );
}
