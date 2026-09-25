import type { ReactNode } from 'react';
import { useWorkspace } from '../../state/WorkspaceContext';
import type { AnalyticsPage } from '../../app/routes';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { OverlayHost } from '../../overlays/OverlayHost';
import { ChevronRightIcon, ReportStudioIcon } from '../ui/Icons';

export function Shell({ children }: { children: ReactNode }) {
  const { collapsed } = useWorkspace();
  return (
    <div className={`an-app ${collapsed ? 'rail' : ''}`}>
      <Sidebar />
      <div className="an-main">
        <TopBar />
        {children}
      </div>
      <OverlayHost />
    </div>
  );
}

// "‹ Back to Dashboard" strip used by the wrench pages (Custom Categories / Benchmark Settings).
export function BackToDashboard() {
  const { goPage } = useWorkspace();
  return (
    <button type="button" className="an-back-link" onClick={() => goPage('today')}>
      <ChevronRightIcon left size={14} color="#64677a" />Back to Dashboard
    </button>
  );
}

// Today | Holdings | Performance toggle (MUI ToggleButtonGroup look) + right-hand slot.
const TABS: { page: AnalyticsPage; label: string }[] = [{ page: 'today', label: 'Today' }, { page: 'holding', label: 'Holdings' }, { page: 'performance', label: 'Performance' }];

export function DashboardTabs({ right }: { right?: ReactNode }) {
  const { page, goPage } = useWorkspace();
  return (
    <div className="an-tabs-row">
      <div className="an-dash-tabs" role="group">
        {TABS.map((t) => (
          <button key={t.page} type="button" className={page === t.page ? 'active' : ''} aria-pressed={page === t.page} onClick={() => goPage(t.page)}>{t.label}</button>
        ))}
      </div>
      <div className="an-tabs-right">{right}</div>
    </div>
  );
}

export function ReportStudioButton() {
  const { goPage } = useWorkspace();
  return (
    <button type="button" className="an-report-studio" aria-label="Open portfolio in Report Studio" onClick={() => goPage('custom-report-builder')}>
      <ReportStudioIcon />
      <span className="an-beta-badge">BETA</span>
    </button>
  );
}
