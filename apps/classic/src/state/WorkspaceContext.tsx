import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AssetClass, Family, IndexQuote, Portfolio, Preferences, Summary, ViewMode } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { NONE, portfolioPath } from '../app/routes';

export type SidebarFilter = 'All' | 'Portfolios' | 'Groups';

interface WorkspaceState {
  dbId: string;
  family: Family | null;
  families: Family[];
  portfolios: Portfolio[];
  portfolio: Portfolio | null;
  mode: ViewMode;
  assetClasses: AssetClass[];
  activeAssetCode: string;
  summary: Summary | null;
  summaryLoading: boolean;
  indices: IndexQuote[];
  preferences: Preferences | null;
  sidebarFilter: SidebarFilter;
  sidebarCollapsed: boolean;
  selectPortfolio: (portfolioId: string) => void;
  selectFamily: (familyId: string) => void;
  setMode: (mode: ViewMode) => void;
  setActiveAssetCode: (code: string) => void;
  setSidebarFilter: (f: SidebarFilter) => void;
  toggleSidebar: () => void;
  setPreferences: (p: Preferences) => void;
  reloadFamilies: () => Promise<void>;
  reloadPortfolios: () => Promise<void>;
  reloadSummary: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ dbId: string; familyId: string; portfolioId: string }>();
  const navigate = useNavigate();
  const dbId = params.dbId ?? '';
  // `-` is the placeholder used before the first family / portfolio exists; treat it as "nothing selected".
  const familyId = params.familyId === NONE ? '' : params.familyId ?? '';
  const portfolioId = params.portfolioId === NONE ? '' : params.portfolioId ?? '';

  const [families, setFamilies] = useState<Family[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
  const [mode, setModeState] = useState<ViewMode>('INV');
  const [activeAssetCode, setActiveAssetCode] = useState('EQ');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const reloadFamilies = useCallback(async () => { if (dbId) setFamilies(await classicApi.families(dbId)); }, [dbId]);
  const reloadPortfolios = useCallback(async () => { setPortfolios(familyId ? await classicApi.portfolios(familyId) : []); }, [familyId]);
  const reloadSummary = useCallback(async () => {
    if (!portfolioId) { setSummary(null); return; }
    setSummaryLoading(true);
    try { setSummary(await classicApi.summary(portfolioId, mode)); } finally { setSummaryLoading(false); }
  }, [portfolioId, mode]);

  useEffect(() => { void reloadFamilies(); }, [reloadFamilies]);
  useEffect(() => { void reloadPortfolios(); }, [reloadPortfolios]);
  useEffect(() => { void reloadSummary(); }, [reloadSummary]);
  useEffect(() => { void classicApi.assetClasses().then(setAssetClasses); }, []);
  useEffect(() => { void classicApi.settings().then((s) => setPreferences(s.preferences)); }, []);
  useEffect(() => {
    const load = () => void classicApi.indices().then(setIndices).catch(() => undefined);
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { setActiveAssetCode(mode === 'INV' ? 'EQ' : 'SFO'); }, [mode]);

  const family = useMemo(() => families.find((f) => f.id === familyId) ?? null, [families, familyId]);
  const portfolio = useMemo(() => portfolios.find((p) => p.id === portfolioId) ?? null, [portfolios, portfolioId]);

  const selectPortfolio = useCallback((id: string) => navigate(portfolioPath(dbId, familyId, id)), [navigate, dbId, familyId]);
  const selectFamily = useCallback(async (fid: string) => {
    const list = await classicApi.portfolios(fid);
    const first = list.find((p) => p.isGroup) ?? list[0];
    navigate(portfolioPath(dbId, fid, first ? first.id : NONE));
  }, [navigate, dbId]);
  const setMode = useCallback((m: ViewMode) => setModeState(m), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const value = useMemo<WorkspaceState>(() => ({
    dbId, family, families, portfolios, portfolio, mode, assetClasses, activeAssetCode, summary, summaryLoading, indices, preferences,
    sidebarFilter, sidebarCollapsed, selectPortfolio, selectFamily, setMode, setActiveAssetCode, setSidebarFilter, toggleSidebar,
    setPreferences, reloadFamilies, reloadPortfolios, reloadSummary,
  }), [dbId, family, families, portfolios, portfolio, mode, assetClasses, activeAssetCode, summary, summaryLoading, indices, preferences, sidebarFilter, sidebarCollapsed, selectPortfolio, selectFamily, setMode, toggleSidebar, reloadFamilies, reloadPortfolios, reloadSummary]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace outside WorkspaceProvider');
  return ctx;
}
