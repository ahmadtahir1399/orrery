'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PageFrame } from '@/components/ui/page-frame';
import { PageHeader } from '@/components/ui/page-header';
import { PriorityGlyph } from '@/components/ui/priority-glyph';
import {
  FLOW_STAGES,
  WorkFlowStrip,
  flowStageForCategory,
  type FlowStage,
} from '@/components/dashboard/work-flow-strip';
import { IssueDetailModal } from '@/components/issues/issue-detail-modal';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import { UpcomingDeadlinesWidget } from '@/components/dashboard/upcoming-deadlines-widget';
import { PinnedItemsWidget } from '@/components/dashboard/pinned-items-widget';
import { CatchMeUpBanner } from '@/components/dashboard/catch-me-up-banner';
import { StandupWidget } from '@/components/dashboard/standup-widget';
import { DeliveryAnalysis } from '@/components/dashboard/delivery-analysis';
import { AgentAttentionWidget } from '@/components/dashboard/agent-attention-widget';
import { useOrganization } from '@/lib/hooks/use-organization';
import { useProjects } from '@/lib/hooks/use-projects';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Plus,
  RotateCw,
  ShieldCheck,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { DashboardLoadingShell } from './dashboard-loading-shell';

interface Issue {
  id: string;
  key: string;
  title: string;
  priority: string;
  statusId: string;
  projectId: string;
  estimate?: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  status: {
    name: string;
    category: string;
    color: string;
  };
  project: {
    key: string;
    name: string;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_ACTION_ORDER: Record<string, number> = {
  blocked: 0,
  in_progress: 1,
  in_review: 1,
  todo: 2,
  backlog: 3,
};

const PRIORITY_ACTION_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function issueAttentionOrder(issue: Issue, now: number): number {
  if (issue.status.category === 'blocked') return 0;
  if (issue.dueDate) {
    const dueAt = new Date(issue.dueDate).getTime();
    if (!Number.isNaN(dueAt) && dueAt < now) return 1;
  }
  return (STATUS_ACTION_ORDER[issue.status.category] ?? 4) + 2;
}

function compareActionableIssues(left: Issue, right: Issue, now: number): number {
  const statusDelta = issueAttentionOrder(left, now) - issueAttentionOrder(right, now);
  if (statusDelta !== 0) return statusDelta;

  const priorityDelta =
    (PRIORITY_ACTION_ORDER[left.priority] ?? 4) - (PRIORITY_ACTION_ORDER[right.priority] ?? 4);
  if (priorityDelta !== 0) return priorityDelta;

  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

type GreetingKey = 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening';

/** Local time of day. Only evaluated on the client after data loads, so the
 *  server-rendered loading shell never disagrees with the browser clock. */
function greetingKeyFor(date: Date): GreetingKey {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'greeting_morning';
  if (hour >= 12 && hour < 18) return 'greeting_afternoon';
  return 'greeting_evening';
}

export function DashboardClient() {
  const { data: session } = useSession();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isWorkspaceToolsOpen, setIsWorkspaceToolsOpen] = useState(false);
  const [pendingAgentApprovalCount, setPendingAgentApprovalCount] = useState(0);
  const { currentOrganizationId, currentTeamId, setCurrentOrganization } = useOrganization();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const formatter = useFormatter();
  const tDash = useTranslations('dashboard');
  const tActions = useTranslations('actions');
  const tNav = useTranslations('nav');
  const t = useTranslations('pagesHome');
  const tExtra = useTranslations('dashboardExtra');
  const tSettings = useTranslations('settingsConfig');
  const tErrorPages = useTranslations('errorPages.error');
  const errorT = useTranslations('componentErrors.dashboard');

  // Surface server-side permission redirects (e.g. /settings/organization without perms)
  // and the post-verify success landing (/dashboard?verified=1).
  useEffect(() => {
    const error = searchParams.get('error');
    const verified = searchParams.get('verified');

    if (error === 'insufficient-permission') {
      toast({
        title: t('toast_access_denied_title'),
        description: t('toast_access_denied_description'),
        variant: 'destructive',
      });
    } else if (verified === '1') {
      toast({
        title: t('toast_verified_title'),
        description: t('toast_verified_description'),
      });
    } else {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete('error');
    next.delete('verified');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const { data: projectsForCreate } = useProjects({
    organizationId: currentOrganizationId,
    teamId: currentTeamId,
  });
  const firstProjectId = projectsForCreate?.[0]?.id ?? null;

  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('/api/organizations');
      if (!response.ok) throw new Error(errorT('fetchOrganizations'));
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  const firstOrganizationId = orgsData?.organizations?.[0]?.id ?? null;
  useEffect(() => {
    if (!currentOrganizationId && firstOrganizationId) {
      setCurrentOrganization(firstOrganizationId);
    }
  }, [currentOrganizationId, firstOrganizationId, setCurrentOrganization]);

  const {
    data: myIssues,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useQuery<Issue[]>({
    queryKey: ['my-issues', session?.user?.id, currentOrganizationId, currentTeamId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentOrganizationId) params.set('organizationId', currentOrganizationId);
      if (currentTeamId) params.set('teamId', currentTeamId);

      const response = await fetch(
        `/api/issues/my-issues${params.size > 0 ? `?${params.toString()}` : ''}`
      );
      if (!response.ok) throw new Error(errorT('fetchIssues'));
      const data = await response.json();
      return data.issues || [];
    },
    enabled: !!session?.user?.id,
  });

  const stats = useMemo(() => {
    const issues = myIssues ?? [];
    const flow = Object.fromEntries(FLOW_STAGES.map((stage) => [stage, 0])) as Record<
      FlowStage,
      number
    >;
    let blocked = 0;
    let completed = 0;
    let points = 0;

    for (const issue of issues) {
      const category = issue.status.category;
      const stage = flowStageForCategory(category);
      if (stage) flow[stage] += 1;
      if (category === 'done') {
        completed += 1;
      } else if (category === 'blocked') {
        blocked += 1;
      }
      if (category === 'in_progress' || category === 'in_review') {
        points += issue.estimate || 0;
      }
    }

    return { flow, blocked, completed, points, total: issues.length };
  }, [myIssues]);

  const actionableIssues = useMemo(() => {
    const now = Date.now();
    return (myIssues ?? [])
      .filter((issue) => issue.status.category !== 'done')
      .sort((left, right) => compareActionableIssues(left, right, now));
  }, [myIssues]);

  // `isPending` (not `isLoading`) keeps the shell up until the first real
  // answer, so the page never flashes an "all caught up" state before data.
  if (isPending && !isError) {
    return <DashboardLoadingShell title={tDash('kicker')} />;
  }

  const firstName = session?.user?.name?.split(' ')[0] || t('greeting_fallback_name');
  const now = new Date();

  return (
    <>
      <PageFrame className="dashboard-carbon" contentClassName="space-y-5">
        <PageHeader
          size="display"
          kicker={
            <time dateTime={now.toISOString().slice(0, 10)}>
              {formatter.dateTime(now, { weekday: 'long', month: 'long', day: 'numeric' })}
            </time>
          }
          title={tDash(greetingKeyFor(now), { name: firstName })}
          description={currentTeamId ? tDash('subtitle_team') : tDash('subtitle_personal')}
          actions={
            <>
              {firstProjectId ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setIsCreateIssueOpen(true)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {tActions('create_issue')}
                </Button>
              ) : null}
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link href="/my-issues">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  {tNav('my_issues')}
                </Link>
              </Button>
            </>
          }
        />

        {isError ? null : (
          <WorkFlowStrip
            counts={stats.flow}
            blocked={stats.blocked}
            points={stats.points}
            completed={stats.completed}
            total={stats.total}
          />
        )}

        <CatchMeUpBanner />

        <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section
            aria-labelledby="dashboard-action-queue"
            className="surface-card min-w-0 overflow-hidden"
          >
            <div className="border-border flex min-h-14 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h2
                    id="dashboard-action-queue"
                    className="text-foreground min-w-0 truncate text-base font-semibold"
                  >
                    {tDash('my_issues_heading')}
                  </h2>
                  {!isError && actionableIssues.length > 0 ? (
                    <span className="bg-primary-soft text-primary shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {actionableIssues.length}
                    </span>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {tDash('attention_hint')}
                </p>
              </div>
              <Link
                href="/my-issues"
                className="text-primary hover:text-primary/80 focus-visible:ring-ring inline-flex shrink-0 items-center gap-1 rounded-sm text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {tActions('view_all')}
                <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
            </div>

            {isError ? (
              <div
                role="alert"
                className="flex flex-col items-center justify-center px-4 py-14 text-center"
              >
                <span className="bg-destructive-soft text-destructive mb-3 flex h-11 w-11 items-center justify-center rounded-full">
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-foreground mb-4 text-sm font-medium">{errorT('fetchIssues')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                  disabled={isRefetching}
                >
                  <RotateCw
                    className={cn('h-4 w-4', isRefetching && 'animate-spin')}
                    aria-hidden="true"
                  />
                  {tErrorPages('tryAgain')}
                </Button>
              </div>
            ) : actionableIssues.length === 0 && pendingAgentApprovalCount === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                <span className="bg-success-soft text-success mb-3 flex h-11 w-11 items-center justify-center rounded-full">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-foreground mb-4 text-sm font-medium">{tDash('all_caught_up')}</p>
                {firstProjectId ? (
                  <Button variant="outline" size="sm" onClick={() => setIsCreateIssueOpen(true)}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {tActions('create_issue')}
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link href="/projects?new=1">{tActions('create_project')}</Link>
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-border divide-y">
                {pendingAgentApprovalCount > 0 ? (
                  <li>
                    <Link
                      href="/settings?tab=ai-agents#agent-governance"
                      className="hover:bg-warning-soft/60 focus-visible:ring-ring flex min-h-14 min-w-0 items-center gap-3 px-4 py-3 text-start transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-5"
                    >
                      <span className="bg-warning-soft text-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground block truncate text-sm font-medium">
                          {tSettings('agentGovernance.queueTitle')}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {tSettings('orgAi.needs_review')}
                        </span>
                      </span>
                      <span className="bg-warning-soft text-warning shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
                        {pendingAgentApprovalCount}
                      </span>
                    </Link>
                  </li>
                ) : null}
                {actionableIssues.slice(0, 9).map((issue) => (
                  <li key={issue.id}>
                    <IssueRow
                      issue={issue}
                      now={now.getTime()}
                      onClick={() => setSelectedIssueId(issue.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="min-w-0 space-y-5">
            <AgentAttentionWidget
              organizationId={currentOrganizationId}
              onPendingApprovalCountChange={setPendingAgentApprovalCount}
            />
            <UpcomingDeadlinesWidget />
          </aside>
        </div>

        <details
          className="surface-card group min-w-0 overflow-hidden"
          onToggle={(event) => setIsWorkspaceToolsOpen(event.currentTarget.open)}
        >
          <summary className="hover:bg-surface focus-visible:ring-ring flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-5 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0">
              <span className="kicker">{tExtra('your_work.heading')}</span>
              <h2 className="text-foreground mt-0.5 truncate text-sm font-semibold">
                {tExtra('standup.heading')}
                <span className="text-muted-foreground mx-1.5" aria-hidden="true">
                  {'/'}
                </span>
                {tExtra('pinned.heading')}
              </h2>
            </div>
            <ChevronDown
              className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-150 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          {isWorkspaceToolsOpen ? (
            <div className="border-border bg-surface/60 grid min-w-0 gap-4 border-t p-4 sm:p-5 lg:grid-cols-2">
              <StandupWidget />
              <PinnedItemsWidget />
            </div>
          ) : null}
        </details>

        <DeliveryAnalysis organizationId={currentOrganizationId} projectId={firstProjectId} />
      </PageFrame>

      {selectedIssueId ? (
        <IssueDetailModal
          issueId={selectedIssueId}
          open={!!selectedIssueId}
          onOpenChange={(open) => !open && setSelectedIssueId(null)}
        />
      ) : null}

      {firstProjectId ? (
        <CreateIssueModal
          open={isCreateIssueOpen}
          onOpenChange={setIsCreateIssueOpen}
          projectId={firstProjectId}
        />
      ) : null}
    </>
  );
}

const STATUS_PILL_CLASS: Record<string, string> = {
  in_progress: 'bg-info-soft text-info',
  in_review: 'bg-info-soft text-info',
  blocked: 'bg-destructive-soft text-destructive',
  done: 'bg-success-soft text-success',
};

const STATUS_DOT_CLASS: Record<string, string> = {
  in_progress: 'bg-info',
  in_review: 'bg-info',
  blocked: 'bg-destructive',
  done: 'bg-success',
};

function IssueRow({ issue, now, onClick }: { issue: Issue; now: number; onClick: () => void }) {
  const tDueDate = useTranslations('issueSidebar');
  const formatter = useFormatter();

  const dueAt = issue.dueDate ? new Date(issue.dueDate).getTime() : Number.NaN;
  const hasDue = !Number.isNaN(dueAt);
  const isOverdue = hasDue && dueAt < now;
  const isDueSoon = hasDue && !isOverdue && dueAt - now <= 3 * DAY_MS;

  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-surface focus-visible:ring-ring group flex min-h-[60px] w-full min-w-0 cursor-pointer items-center gap-3 px-4 py-3 text-start transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-5"
    >
      <span className="flex h-9 w-5 shrink-0 items-center justify-center">
        <PriorityGlyph level={issue.priority} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          dir="auto"
          className="text-foreground group-hover:text-primary block truncate text-sm font-medium transition-colors duration-150"
        >
          {issue.title}
        </span>
        <span className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-1.5 text-xs">
          <span dir="ltr" className="shrink-0 font-mono text-[11px]">
            {issue.key}
          </span>
          <span aria-hidden="true">{'·'}</span>
          <span className="min-w-0 truncate">{issue.project.name}</span>
        </span>
      </span>

      {hasDue ? (
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums sm:inline-flex',
            // Overdue stays visible on phones; other dates yield to the title.
            isOverdue ? 'inline-flex' : 'hidden',
            isOverdue
              ? 'bg-destructive-soft text-destructive'
              : isDueSoon
                ? 'bg-warning-soft text-warning'
                : 'bg-muted text-muted-foreground'
          )}
        >
          <span className="sr-only">{tDueDate('rows.dueDate')}</span>
          {isOverdue
            ? tDueDate('dueDate.overdue')
            : formatter.dateTime(new Date(dueAt), { month: 'short', day: 'numeric' })}
        </span>
      ) : null}

      <span
        className={cn(
          'hidden max-w-[140px] shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex',
          STATUS_PILL_CLASS[issue.status.category] ?? 'bg-muted text-muted-foreground'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            STATUS_DOT_CLASS[issue.status.category] ?? 'bg-muted-foreground/60'
          )}
        />
        <span className="truncate">{issue.status.name}</span>
      </span>
    </button>
  );
}
