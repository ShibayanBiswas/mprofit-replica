import { http, qs } from '@mprofit/shared';
import type {
  AccessUser, AdvisorProfile, AssetAllocation, AssetClass, AutoTransferCharges, ChangeLog, CorporateAction, Database,
  EquityExposure, Family, GlobalReport, ImportTemplate, IndexQuote, PerformanceSnapshot, Portfolio, Preferences,
  ReportJob, ReportsCatalog, SearchHit, SessionUser, Summary, TaskItem, Transaction, UserSettings, ViewMode, XirrResult, Broker,
} from '@mprofit/shared';

export interface LoginResponse { user: SessionUser; databases: Database[] }

export const classicApi = {
  login: (email: string, password: string) => http.post<LoginResponse>('/api/Auth/Login', { email, password }),
  logout: () => http.post<void>('/api/Auth/Logout'),
  me: () => http.get<LoginResponse>('/api/Auth/Me'),
  keepAlive: () => http.get<{ ok: boolean }>('/api/Auth/KeepAlive'),
  forgotPassword: (email: string) => http.post<{ message: string }>('/api/Auth/ForgotPassword', { email }),
  changePassword: (currentPassword: string, newPassword: string) => http.post<void>('/api/Auth/ChangePassword', { currentPassword, newPassword }),

  families: (dbId: string) => http.get<Family[]>(`/api/Databases/${dbId}/Families`),
  addFamily: (dbId: string, name: string) => http.post<Family>(`/api/Databases/${dbId}/Families`, { name }),
  editFamily: (familyId: string, name: string) => http.put<Family>(`/api/Families/${familyId}`, { name }),
  portfolios: (familyId: string) => http.get<Portfolio[]>(`/api/Families/${familyId}/Portfolios`),
  addPortfolio: (familyId: string, body: Partial<Portfolio>) => http.post<Portfolio>(`/api/Families/${familyId}/Portfolios`, body),
  editPortfolio: (portfolioId: string, body: Partial<Portfolio>) => http.put<Portfolio>(`/api/Portfolios/${portfolioId}`, body),
  portfolio: (portfolioId: string) => http.get<Portfolio>(`/api/Portfolios/${portfolioId}`),
  summary: (portfolioId: string, mode: ViewMode) => http.get<Summary>(`/api/Portfolios/${portfolioId}/Summary${qs({ mode })}`),
  assetAllocation: (portfolioId: string) => http.get<AssetAllocation>(`/api/Portfolios/${portfolioId}/AssetAllocation`),
  performance: (portfolioId: string) => http.get<PerformanceSnapshot>(`/api/Portfolios/${portfolioId}/Performance`),
  equityExposure: (portfolioId: string) => http.get<EquityExposure>(`/api/Portfolios/${portfolioId}/EquityExposure`),
  xirr: (portfolioId: string, withZero: boolean) => http.get<XirrResult>(`/api/Portfolios/${portfolioId}/Xirr${qs({ withZero })}`),
  transactions: (portfolioId: string) => http.get<Transaction[]>(`/api/Portfolios/${portfolioId}/Transactions`),
  addTransaction: (portfolioId: string, body: Partial<Transaction>) => http.post<Transaction>(`/api/Portfolios/${portfolioId}/Transactions`, body),
  assetClasses: () => http.get<AssetClass[]>('/api/AssetClasses'),
  indices: () => http.get<IndexQuote[]>('/api/Market/Indices'),
  search: (q: string, type: string) => http.get<SearchHit[]>(`/api/Search${qs({ q, type })}`),
  settings: () => http.get<UserSettings>('/api/Users/Settings'),
  savePreferences: (p: Preferences) => http.put<Preferences>('/api/Users/Preferences', p),
  recent: () => http.get<Portfolio[]>('/api/Users/Recent'),

  reportsCatalog: () => http.get<ReportsCatalog>('/api/Reports/Catalog'),
  globalReports: () => http.get<GlobalReport>('/api/Reports/Global'),
  reportJobs: () => http.get<ReportJob[]>('/api/Reports/Jobs'),
  createReportJob: (body: { reportName: string; portfolioName: string; format: 'PDF' | 'Excel' }) => http.post<ReportJob>('/api/Reports/Jobs', body),

  accessUsers: () => http.get<{ users: AccessUser[]; maxUsers: number }>('/api/AccessControl/Users'),
  addAccessUser: (body: Partial<AccessUser>) => http.post<AccessUser>('/api/AccessControl/Users', body),
  removeAccessUser: (id: string) => http.del<void>(`/api/AccessControl/Users/${id}`),
  corporateActions: () => http.get<CorporateAction[]>('/api/CorporateActions'),
  autoTransferCharges: () => http.get<AutoTransferCharges>('/api/Tools/AutoTransferCharges'),
  saveAutoTransferCharges: (b: AutoTransferCharges) => http.put<AutoTransferCharges>('/api/Tools/AutoTransferCharges', b),
  tasks: () => http.get<TaskItem[]>('/api/Tools/Tasks'),
  advisorProfile: () => http.get<AdvisorProfile>('/api/Tools/AdvisorProfile'),
  saveAdvisorProfile: (b: AdvisorProfile) => http.put<AdvisorProfile>('/api/Tools/AdvisorProfile', b),
  masters: () => http.get<(Portfolio & { familyName: string })[]>('/api/Masters/Portfolios'),

  brokers: () => http.get<Broker[]>('/api/Import/Brokers'),
  importTemplates: (assetType?: string) => http.get<ImportTemplate[]>(`/api/Import/Templates${qs({ assetType })}`),
  upload: (body: unknown) => http.post<{ id: string; status: string; message: string }>('/api/Import/Upload', body),

  changelog: () => http.get<ChangeLog[]>('/api/ChangeLog'),
  helpArticles: () => http.get<string[]>('/api/Help/Articles'),
};
