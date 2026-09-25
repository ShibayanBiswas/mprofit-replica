import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { decodeAnalyticsContext, type AnalyticsContext } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { SessionProvider, useSession } from '../state/SessionContext';
import { OverlayProvider } from '../state/OverlayContext';
import { WorkspaceProvider, useWorkspace } from '../state/WorkspaceContext';
import { Shell } from '../components/shell/Shell';
import { CLASSIC_LOGIN, isPage, pagePath } from './routes';
import { TodayPage } from '../pages/TodayPage';
import { HoldingsPage } from '../pages/HoldingsPage';
import { PerformancePage } from '../pages/PerformancePage';
import { SummaryPage } from '../pages/SummaryPage';
import { EquityExposurePage } from '../pages/EquityExposurePage';
import { ReportStudioPage } from '../pages/ReportStudioPage';
import { CustomCategoriesPage } from '../pages/CustomCategoriesPage';
import { BenchmarkSettingsPage } from '../pages/BenchmarkSettingsPage';
import { AdvisorsPage } from '../pages/AdvisorsPage';

// Analytics has no login screen. Live: an unauthenticated hit on app.mprofit.in bounces to cloud.mprofit.in/login.
function RequireAuth({ children }: { children: JSX.Element }) {
  const { status } = useSession();
  useEffect(() => { if (status === 'anonymous') window.location.replace(CLASSIC_LOGIN); }, [status]);
  if (status !== 'authenticated') return <div className="an-boot" />;
  return children;
}

// Resolves the tenancy token from ?p=. Without one (deep link / bookmark), fall back to the first db → first family → group portfolio,
// which is what the live app does when it has no last-accessed portfolio.
function ResolveContext() {
  const { databases } = useSession();
  const location = useLocation();
  const params = useParams<{ page?: string }>();
  const token = new URLSearchParams(location.search).get('p');
  const fromToken = decodeAnalyticsContext(token);
  const [fallback, setFallback] = useState<AnalyticsContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fromToken) return;
    let cancelled = false;
    (async () => {
      const db = databases[0];
      if (!db) { setError('No database available for this account.'); return; }
      const families = await analyticsApi.families(db.id);
      const fam = families[0];
      if (!fam) { setError('No families found.'); return; }
      const ports = await analyticsApi.portfolios(fam.id);
      const first = ports.find((p) => p.isGroup) ?? ports[0];
      if (!first) { setError('No portfolios found.'); return; }
      if (!cancelled) setFallback({ dbId: db.id, familyId: fam.id, portfolioId: first.id });
    })().catch((e: Error) => setError(e.message));
    return () => { cancelled = true; };
  }, [databases, fromToken]);

  if (fromToken) {
    return (
      <WorkspaceProvider ctx={fromToken}>
        <Shell><PageSwitch /></Shell>
      </WorkspaceProvider>
    );
  }
  if (error) return <div className="an-boot an-boot-error">{error}</div>;
  if (!fallback) return <div className="an-boot" />;
  return <Navigate to={pagePath(isPage(params.page) ? params.page : 'today', fallback)} replace />;
}

function PageSwitch() {
  const { page } = useWorkspace();
  switch (page) {
    case 'today': return <TodayPage />;
    case 'holding': return <HoldingsPage />;
    case 'performance': return <PerformancePage />;
    case 'summary': return <SummaryPage />;
    case 'equity-exposure': return <EquityExposurePage />;
    case 'custom-report-builder': return <ReportStudioPage />;
    case 'custom-categories': return <CustomCategoriesPage />;
    case 'default-benchmark': return <BenchmarkSettingsPage />;
    case 'advisors': return <AdvisorsPage />;
    default: {
      const _exhaustive: never = page;
      return _exhaustive;
    }
  }
}

export function App() {
  return (
    <SessionProvider>
      <OverlayProvider>
        <Routes>
          <Route path="/portfolio/:page/:sub" element={<RequireAuth><ResolveContext /></RequireAuth>} />
          <Route path="/portfolio/:page" element={<RequireAuth><ResolveContext /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/portfolio/today" replace />} />
        </Routes>
      </OverlayProvider>
    </SessionProvider>
  );
}
