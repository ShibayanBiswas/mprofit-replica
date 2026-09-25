import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { decodeAnalyticsContext, type AnalyticsContext, type AnalyticsPreferences, type Family, type IndexQuote, type Portfolio, type Summary } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { isPage, isRailPage, pagePath, type AnalyticsPage } from '../app/routes';

export type ViewBy = 'Category' | 'Asset Class';

interface WorkspaceState {
  ctx: AnalyticsContext;
  page: AnalyticsPage;
  sub: string | undefined;
  query: URLSearchParams;
  families: Family[];
  family: Family | null;
  portfolios: Portfolio[];
  portfolio: Portfolio | null;
  summary: Summary | null;
  indices: IndexQuote[];
  preferences: AnalyticsPreferences | null;
  viewBy: ViewBy;
  collapsed: boolean;
  goPage: (page: AnalyticsPage, sub?: string, extra?: Record<string, string>) => void;
  selectPortfolio: (portfolioId: string, familyId?: string) => void;
  selectFamily: (familyId: string) => Promise<void>;
  setViewBy: (v: ViewBy) => void;
  setCollapsed: (c: boolean) => void;
  setPreferences: (p: AnalyticsPreferences) => void;
  reloadPortfolios: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ ctx, children }: { ctx: AnalyticsContext; children: ReactNode }) {
  const params = useParams<{ page: string; sub?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const page: AnalyticsPage = isPage(params.page) ? params.page : 'today';
  const sub = params.sub;
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [families, setFamilies] = useState<Family[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [preferences, setPreferences] = useState<AnalyticsPreferences | null>(null);
  const [viewBy, setViewBy] = useState<ViewBy>('Category');
  // Live: the drawer is expanded on dashboards and auto-collapses to the 65px rail on the Portfolio (summary) page.
  const [collapsed, setCollapsed] = useState(isRailPage(page));

  const reloadPortfolios = useCallback(async () => { setPortfolios(await analyticsApi.portfolios(ctx.familyId)); }, [ctx.familyId]);

  useEffect(() => { void analyticsApi.families(ctx.dbId).then(setFamilies); }, [ctx.dbId]);
  useEffect(() => { void reloadPortfolios(); }, [reloadPortfolios]);
  useEffect(() => { setSummary(null); void analyticsApi.summary(ctx.portfolioId).then(setSummary); }, [ctx.portfolioId]);
  useEffect(() => { void analyticsApi.preferences().then(setPreferences); }, []);
  useEffect(() => {
    const load = () => void analyticsApi.indices().then(setIndices).catch(() => undefined);
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { setCollapsed(isRailPage(page)); }, [page]);

  const family = useMemo(() => families.find((f) => f.id === ctx.familyId) ?? null, [families, ctx.familyId]);
  const portfolio = useMemo(() => portfolios.find((p) => p.id === ctx.portfolioId) ?? summary?.portfolio ?? null, [portfolios, ctx.portfolioId, summary]);

  const goPage = useCallback((p: AnalyticsPage, s?: string, extra?: Record<string, string>) => navigate(pagePath(p, ctx, s, extra)), [navigate, ctx]);
  // Switching portfolio keeps the page but drops sub-routes (live returns to the page root).
  const selectPortfolio = useCallback((portfolioId: string, familyId?: string) => {
    navigate(pagePath(page, { dbId: ctx.dbId, familyId: familyId ?? ctx.familyId, portfolioId }));
  }, [navigate, page, ctx]);
  const selectFamily = useCallback(async (familyId: string) => {
    const list = await analyticsApi.portfolios(familyId);
    const first = list.find((p) => p.isGroup) ?? list[0];
    if (first) navigate(pagePath(page, { dbId: ctx.dbId, familyId, portfolioId: first.id }));
  }, [navigate, page, ctx.dbId]);

  // Keep the token in sync if someone lands on /portfolio/<page> without ?p (decode fallback handled in App).
  useEffect(() => { if (!decodeAnalyticsContext(query.get('p'))) navigate(pagePath(page, ctx, sub), { replace: true }); }, [query, navigate, page, sub, ctx]);

  const value = useMemo<WorkspaceState>(() => ({
    ctx, page, sub, query, families, family, portfolios, portfolio, summary, indices, preferences, viewBy, collapsed,
    goPage, selectPortfolio, selectFamily, setViewBy, setCollapsed, setPreferences, reloadPortfolios,
  }), [ctx, page, sub, query, families, family, portfolios, portfolio, summary, indices, preferences, viewBy, collapsed, goPage, selectPortfolio, selectFamily, reloadPortfolios]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace outside WorkspaceProvider');
  return ctx;
}
