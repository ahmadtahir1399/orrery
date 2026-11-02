import { render, screen } from '@testing-library/react';
import { WorkFlowStrip, flowStageForCategory } from '../work-flow-strip';

describe('flowStageForCategory', () => {
  it('maps every status category onto the intake → ship path', () => {
    expect(flowStageForCategory('backlog')).toBe('intake');
    expect(flowStageForCategory('todo')).toBe('plan');
    expect(flowStageForCategory('in_progress')).toBe('build');
    expect(flowStageForCategory('in_review')).toBe('build');
    expect(flowStageForCategory('blocked')).toBe('build');
    expect(flowStageForCategory('done')).toBe('ship');
    expect(flowStageForCategory('archived')).toBeNull();
  });
});

describe('WorkFlowStrip', () => {
  it('renders the four stages with counts, the blocked chip, and the footer summary', () => {
    render(
      <WorkFlowStrip
        counts={{ intake: 2, plan: 5, build: 3, ship: 8 }}
        blocked={1}
        points={13}
        completed={8}
        total={18}
      />
    );

    expect(screen.getByRole('heading', { name: 'Your work in motion' })).toBeInTheDocument();
    for (const stage of ['Intake', 'Plan', 'Build', 'Ship']) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
    expect(screen.getByText('1 blocked')).toBeInTheDocument();
    expect(screen.getByText('13 story points in flight')).toBeInTheDocument();
    expect(screen.getByText('8 of 18 completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '44');
  });

  it('hides the blocked chip and the travelling mark when nothing is in that stage', () => {
    const { container } = render(
      <WorkFlowStrip
        counts={{ intake: 0, plan: 0, build: 0, ship: 0 }}
        blocked={0}
        points={0}
        completed={0}
        total={0}
      />
    );

    expect(screen.queryByText(/blocked/)).not.toBeInTheDocument();
    expect(container.querySelectorAll('.flow-rail > b')).toHaveLength(0);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
