import { AppLoadingScreen } from '@/components/layout/app-loading-screen';

// Shown while the authenticated shell layout (session + workspace access)
// resolves on first entry, e.g. right after sign-in.
export default function LocaleLoading() {
  return <AppLoadingScreen />;
}
