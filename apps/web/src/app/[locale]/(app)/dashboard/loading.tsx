import { getTranslations } from 'next-intl/server';
import { DashboardLoadingShell } from './dashboard-loading-shell';

// Same shell as the page's Suspense fallback and the client pending state, so
// navigation, streaming, and data loading hand off without a visual jump.
export default async function DashboardLoading() {
  const tDashboard = await getTranslations('dashboard');
  return <DashboardLoadingShell title={tDashboard('kicker')} />;
}
