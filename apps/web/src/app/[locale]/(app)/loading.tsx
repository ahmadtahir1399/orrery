import { RouteLoadingSkeleton } from '@/components/layout/app-loading-screen';

// Instant in-shell feedback for routes that do not define their own loader.
export default function AppRouteLoading() {
  return <RouteLoadingSkeleton />;
}
