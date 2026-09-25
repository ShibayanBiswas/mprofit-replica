// API shapes shared by Classic, Analytics and the mock API (sys1-style PascalCase routes, camelCase payloads).

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: 'Owner' | 'Admin' | 'User';
}

export interface Database {
  id: string;
  name: string;
  plan: string;
  expiryDate: string;
  activeUsers: number;
  maxUsers: number;
}

export interface Family {
  id: string;
  dbId: string;
  name: string;
}

export type PortfolioType = 'Investment' | 'F&O' | 'International';

export interface Portfolio {
  id: string;
  familyId: string;
  shortName: string;
  fullName: string;
  pan: string;
  type: PortfolioType;
  isGroup: boolean;
  isTrading: boolean;
  isPms: boolean;
  advisorId?: string | null;
}

export type ViewMode = 'INV' | 'FO';

export interface AssetClass {
  code: string;
  badge: string;
  label: string;
  mode: ViewMode;
}

export interface HoldingRow {
  id: string;
  assetClassCode: string;
  name: string;
  qty: number;
  avgPrice: number;
  amtInvested: number;
  currentPrice: number;
  todaysGain: number;
  todaysGainPct: number;
  unrealisedGain: number;
  unrealisedGainPct: number;
  currentValue: number;
}

export interface SummaryTotals {
  amtInvested: number;
  todaysGain: number;
  todaysGainPct: number;
  unrealisedGain: number;
  unrealisedGainPct: number;
  currentValue: number;
}

export interface Summary {
  portfolio: Portfolio;
  mode: ViewMode;
  rows: HoldingRow[];
  totals: SummaryTotals;
  asOn: string;
}

export interface IndexQuote {
  code: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  assetType: string;
  type: string;
  assetName: string;
  date: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ReportItem {
  id: string;
  name: string;
  description: string[];
  chips: string[];
  hasPreview: boolean;
  generate?: boolean;
}

export interface ReportCategory {
  id: string;
  name: string;
  external?: boolean;
  reports: ReportItem[];
}

export interface ReportsCatalog {
  title: string;
  categories: ReportCategory[];
}

export interface GlobalReport {
  id: string;
  name: string;
  description: string;
  sections: { report: string; description: string }[];
}

export interface ReportJob {
  id: string;
  reportName: string;
  portfolioName: string;
  status: 'Running' | 'Ready' | 'Failed';
  createdAt: string;
  format: 'PDF' | 'Excel';
}

export interface ChangeLog {
  id: string;
  title: string;
  date: string;
  paragraphs: string[];
  bullets: string[];
}

export interface Broker {
  id: string;
  name: string;
  kind: 'stocks' | 'fo' | 'banks';
}

export interface ImportTemplate {
  id: string;
  name: string;
  brokerId: string | null;
  assetType: string;
  format: 'Excel' | 'PDF' | 'CSV';
  recommended: boolean;
  autoImport: boolean;
}

export interface AccessUser {
  id: string;
  email: string;
  type: 'Owner' | 'Admin' | 'User';
  access: string;
}

export interface AssetAllocationRow {
  assetClass: string;
  amtInvested: number;
  unrealisedGain: number;
  gainPct: number;
  currentValue: number;
  holdingPct: number;
}

export interface AssetAllocation {
  asOn: string;
  currentValue: number;
  amtInvested: number;
  unrealisedGain: number;
  unrealisedGainPct: number | null;
  rows: AssetAllocationRow[];
}

export interface UserSettings {
  lastAccessedPortfolioId: string | null;
  preferences: Preferences;
}

export interface Preferences {
  defaultSort: 'Name' | 'Current Value' | 'Amount Invested' | 'Unrealised Gain';
  sortDirection: 'Ascending' | 'Descending';
  zeroHoldings: 'Show' | 'Hide';
  decimals: 'Show' | 'Hide';
  separator: 'Lakhs' | 'Millions';
  fontSize: 'Small' | 'Large';
  pmsWithinGroups: 'Underlyings' | 'Line-item';
  showPortfolioFullName: 'Yes' | 'No';
}

export interface AdvisorProfile {
  name: string;
  address1: string;
  address2: string;
  phone: string;
  email: string;
}

export interface AutoTransferCharges {
  invNonTrading: boolean;
  invTrading: boolean;
  fo: boolean;
}

export interface TaskItem {
  id: string;
  status: string;
  type: string;
  dateCreated: string;
  period: string;
  details: string;
}

export interface CorporateAction {
  id: string;
  type: string;
  exDate: string;
  stockName: string;
  action: string;
  applied: boolean;
}

export interface XirrResult {
  portfolioId: string;
  xirr: number | null;
  withZeroHoldings: boolean;
  firstTransactionDate: string | null;
}

export interface SearchHit {
  portfolioId: string;
  portfolioName: string;
  familyId: string;
  familyName: string;
  type: 'INV' | 'F&O' | 'ACT';
  isGroup: boolean;
}

export interface PerformanceSnapshot {
  xirr: number | null;
  firstTransactionDate: string | null;
  currentValuation: number;
  totalInvestment: number;
  totalWithdrawal: number;
  totalGain: number;
  realisedPl: number;
  unrealisedPl: number;
  totalIncome: number;
  benchmark: { name: string; cagr: number | null };
}

export interface EquityExposureRow {
  name: string;
  currentValue: number;
  pctOfEquity: number;
  pctOfPortfolio: number;
}

export interface EquityExposure {
  asOn: string;
  currentValue: number;
  byStock: EquityExposureRow[];
  bySector: EquityExposureRow[];
  byMarketCap: EquityExposureRow[];
}

// ---- Analytics-only shapes ----------------------------------------------------------------------

export interface WatchlistItem {
  id: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
}

export interface Mover {
  name: string;
  price: number;
  change: number;
  changePct: number;
}

export interface Movers {
  gainers: Mover[];
  losers: Mover[];
}

export interface PerformanceRow {
  name: string;
  closingValuation: number;
  xirr: number | null;
  totalInvestment: number;
  totalWithdrawal: number;
  totalGain: number;
  realisedGain: number;
  unrealisedGain: number;
  totalIncome: number;
}

export interface PerformanceBreakdown {
  byCategory: PerformanceRow[];
  byAssetClass: PerformanceRow[];
}

export interface AnalyticsPreferences {
  zeroValues: boolean;
  pmsLineItem: boolean;
}

export interface Benchmark {
  code: string;
  name: string;
  cagr: number | null;
}

export interface IndexCatalogEntry {
  code: string;
  name: string;
  order: number;
}

export interface IndexCatalog {
  selected: string[];
  indices: IndexCatalogEntry[];
}

export interface Blend {
  id: string;
  name: string;
  parts: { index: string; weight: number }[];
}

export interface BenchmarkCategorySetting {
  name: string;
  benchmark: string | null;
}

export interface BenchmarkPortfolioSetting {
  id: string;
  name: string;
  familyName: string;
  benchmark: string | null;
}

export interface BenchmarkSettings {
  defaultBenchmark: string;
  categories: BenchmarkCategorySetting[];
  portfolios: BenchmarkPortfolioSetting[];
}

export type ReportViewKind = 'Holdings' | 'Performance' | 'Holdings: Multi Period' | 'Performance: Multi Period';
export type ReportViewLevel = 'Family' | 'Portfolio' | 'Entity' | 'Group' | 'Global';

export interface ReportStudioView {
  id: string;
  name: string;
  kind: ReportViewKind;
  level: ReportViewLevel;
  description?: string;
}

export interface ReportStudioViews {
  popular: ReportStudioView[];
  mine: ReportStudioView[];
}

// Report Studio → "Open report log": one entry per report run.
export interface ReportLogEntry {
  id: string;
  viewId: string;
  viewName: string;
  kind: ReportViewKind;
  level: ReportViewLevel;
  familyName: string;
  status: 'Completed' | 'Running' | 'Failed';
  ranAt: string;
}

// Portfolio → Actions → Manage advisors / Tag advisor.
export interface Advisor {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// wrench → Custom Categories. One row per product (sub-asset-class) with its category / sub-category mapping.
export interface CustomCategoryRow {
  id: string;
  assetClass: string;
  product: string;
  category: string;
  subCategory: string;
  isDefault: boolean;
}

export interface CategoryMasterEntry {
  name: string;
  isDefault: boolean;
  subCategories: { name: string; isDefault: boolean }[];
}

export interface CustomCategories {
  rows: CustomCategoryRow[];
  master: CategoryMasterEntry[];
}
