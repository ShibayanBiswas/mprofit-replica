import { http, qs } from '@mprofit/shared';
import type {
  Advisor, AnalyticsPreferences, AssetAllocation, AssetClass, Benchmark, BenchmarkSettings, Blend, CorporateAction, CustomCategories, CustomCategoryRow, Database, EquityExposure, Family, IndexCatalog, IndexQuote,
  Movers, PerformanceBreakdown, PerformanceSnapshot, Portfolio, ReportLogEntry, ReportStudioView, ReportStudioViews, ReportViewKind, ReportViewLevel, SearchHit, SessionUser, Summary, WatchlistItem, XirrResult,
} from '@mprofit/shared';

export interface LoginResponse { user: SessionUser; databases: Database[] }
export interface BenchmarksResponse { selected: string; benchmarks: Benchmark[] }

export const analyticsApi = {
  me: () => http.get<LoginResponse>('/api/Auth/Me'),
  logout: () => http.post<void>('/api/Auth/Logout'),
  keepAlive: () => http.get<{ ok: boolean }>('/api/Auth/KeepAlive'),

  families: (dbId: string) => http.get<Family[]>(`/api/Databases/${dbId}/Families`),
  portfolios: (familyId: string) => http.get<Portfolio[]>(`/api/Families/${familyId}/Portfolios`),
  portfolio: (portfolioId: string) => http.get<Portfolio>(`/api/Portfolios/${portfolioId}`),
  summary: (portfolioId: string) => http.get<Summary>(`/api/Portfolios/${portfolioId}/Summary${qs({ mode: 'INV' })}`),
  assetAllocation: (portfolioId: string) => http.get<AssetAllocation>(`/api/Portfolios/${portfolioId}/AssetAllocation`),
  performance: (portfolioId: string) => http.get<PerformanceSnapshot>(`/api/Portfolios/${portfolioId}/Performance`),
  performanceBreakdown: (portfolioId: string) => http.get<PerformanceBreakdown>(`/api/Portfolios/${portfolioId}/PerformanceBreakdown`),
  equityExposure: (portfolioId: string) => http.get<EquityExposure>(`/api/Portfolios/${portfolioId}/EquityExposure`),
  xirr: (portfolioId: string) => http.get<XirrResult>(`/api/Portfolios/${portfolioId}/Xirr${qs({ withZero: false })}`),
  movers: (portfolioId: string) => http.get<Movers>(`/api/Portfolios/${portfolioId}/Movers`),
  corporateActions: (portfolioId: string) => http.get<CorporateAction[]>(`/api/Portfolios/${portfolioId}/CorporateActions`),
  assetClasses: () => http.get<AssetClass[]>('/api/AssetClasses'),
  indices: () => http.get<IndexQuote[]>('/api/Market/AnalyticsIndices'),
  benchmarks: () => http.get<BenchmarksResponse>('/api/Market/Benchmarks'),
  selectBenchmark: (code: string) => http.put<BenchmarksResponse>('/api/Market/Benchmarks', { code }),
  search: (q: string) => http.get<SearchHit[]>(`/api/Search${qs({ q, type: 'ALL' })}`),

  watchlist: () => http.get<WatchlistItem[]>('/api/Watchlist'),
  addToWatchlist: (name: string, price: number) => http.post<WatchlistItem>('/api/Watchlist', { name, price }),
  removeFromWatchlist: (id: string) => http.del<void>(`/api/Watchlist/${id}`),
  reorderWatchlist: (ids: string[]) => http.put<WatchlistItem[]>('/api/Watchlist/Order', { ids }),

  preferences: () => http.get<AnalyticsPreferences>('/api/Users/AnalyticsPreferences'),
  savePreferences: (p: AnalyticsPreferences) => http.put<AnalyticsPreferences>('/api/Users/AnalyticsPreferences', p),

  indexCatalog: () => http.get<IndexCatalog>('/api/Market/IndexCatalog'),
  selectIndices: (names: string[]) => http.put<IndexCatalog>('/api/Market/SelectedIndices', { names }),
  blends: () => http.get<Blend[]>('/api/Market/Blends'),
  createBlend: (name: string, parts: Blend['parts']) => http.post<Blend>('/api/Market/Blends', { name, parts }),
  benchmarkSettings: () => http.get<BenchmarkSettings>('/api/Users/BenchmarkSettings'),
  saveBenchmarkSetting: (body: { defaultBenchmark?: string; category?: string; benchmark?: string | null }) => http.put<BenchmarkSettings>('/api/Users/BenchmarkSettings', body),
  reportViews: () => http.get<ReportStudioViews>('/api/ReportStudio/Views'),
  createReportView: (body: { name: string; description?: string; kind: ReportViewKind; level: ReportViewLevel }) => http.post<ReportStudioView>('/api/ReportStudio/Views', body),
  deleteReportView: (id: string) => http.del<void>(`/api/ReportStudio/Views/${id}`),
  copyReportView: (id: string) => http.post<ReportStudioView>(`/api/ReportStudio/Views/${id}/Copy`),
  runReportView: (id: string, familyId: string) => http.post<ReportLogEntry>(`/api/ReportStudio/Views/${id}/Run`, { familyId }),
  reportLog: () => http.get<ReportLogEntry[]>('/api/ReportStudio/Log'),

  advisors: () => http.get<Advisor[]>('/api/Advisors'),
  addAdvisor: (a: Omit<Advisor, 'id'>) => http.post<Advisor>('/api/Advisors', a),
  updateAdvisor: (id: string, a: Partial<Omit<Advisor, 'id'>>) => http.put<Advisor>(`/api/Advisors/${id}`, a),
  removeAdvisor: (id: string) => http.del<void>(`/api/Advisors/${id}`),
  tagAdvisor: (portfolioId: string, advisorId: string | null) => http.put<Portfolio>(`/api/Portfolios/${portfolioId}/Advisor`, { advisorId }),

  customCategories: () => http.get<CustomCategories>('/api/Users/CustomCategories'),
  saveCustomCategories: (rows: Pick<CustomCategoryRow, 'id' | 'category' | 'subCategory'>[]) => http.put<CustomCategories>('/api/Users/CustomCategories', { rows }),
  resetCustomCategories: () => http.post<CustomCategories>('/api/Users/CustomCategories/Reset'),
  addCategory: (name: string, parent?: string) => http.post<CustomCategories['master']>('/api/Users/CategoryMaster', { name, parent }),
};
