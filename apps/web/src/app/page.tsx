import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import webPackage from '../../package.json';
import { AiMcpSection } from '@/components/marketing/ai-mcp-section';
import { FactsStrip } from '@/components/marketing/facts-strip';
import { Faq } from '@/components/marketing/faq';
import { FeatureBento } from '@/components/marketing/feature-bento';
import { FinalCta } from '@/components/marketing/final-cta';
import { Hero } from '@/components/marketing/hero';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { PrinciplesSection } from '@/components/marketing/principles-section';
import { StorySection } from '@/components/marketing/story-section';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('publicPages.landing.meta');
  const title = t('title');
  const description = t('description');

  return {
    metadataBase: new URL(APP_URL),
    title,
    description,
    alternates: { canonical: '/' },
    keywords: [
      'project management',
      'Jira alternative',
      'Linear alternative',
      'AI agents',
      'MCP server',
      'kanban',
      'sprints',
    ],
    openGraph: {
      type: 'website',
      url: '/',
      siteName: 'Orrery',
      title,
      description,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/**
 * Landing page. Thin composition: every section lives in src/components/marketing/
 * and reads top to bottom as one story — the promise (hero), the proof
 * (facts), one issue's path from intake to shipped (story), what is inside
 * (features), how agents take part, the commitments behind it, and the close.
 * Client islands: the 3D product stage, the story scroller, and InView motion.
 */
export default async function HomePage() {
  const t = await getTranslations('publicPages.landing.meta');
  const softwareApplicationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Orrery',
    description: t('description'),
    url: APP_URL,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Project Management',
    operatingSystem: 'Web',
    softwareVersion: webPackage.version,
  } as const;

  return (
    <div className="landing-dark relative isolate min-h-screen overflow-x-hidden bg-[var(--landing-bg)] text-[var(--landing-text)] antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[var(--landing-bg-elevated)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--landing-text-dark)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--landing-accent-blue)]"
      >
        {t('skipToContent')}
      </a>

      <MarketingNav />

      <main id="main-content" className="relative">
        <Hero />
        <FactsStrip />
        <StorySection />
        <FeatureBento />
        <AiMcpSection />
        <PrinciplesSection />
        <Faq />
        <FinalCta />
      </main>

      <MarketingFooter />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
    </div>
  );
}
