import { ANALYTICS_URL, encodeAnalyticsContext } from '@mprofit/shared';

// Mirrors the live tenancy URL: /app/db/:dbId/f/:familyId/pms/:portfolioId/sum
export const portfolioPath = (dbId: string, familyId: string, portfolioId: string) => `/app/db/${dbId}/f/${familyId}/pms/${portfolioId}/sum`;
// Live's transaction-entry screen: .../pms/:portfolioId/trans/<ids>/cn/<id>. The replica keys it off the asset code.
export const contractNotePath = (dbId: string, familyId: string, portfolioId: string, assetCode: string) =>
  `/app/db/${dbId}/f/${familyId}/pms/${portfolioId}/trans/${assetCode}/cn`;
// Placeholder segment used before the tenant has created its first family or portfolio.
export const NONE = '-';
export const emptyWorkspacePath = (dbId: string, familyId = NONE) => portfolioPath(dbId, familyId, NONE);
export const LOGIN_PATH = '/login';
export const FORGOT_PATH = '/forgot-password';
export const ANALYTICS_ORIGIN = ANALYTICS_URL;

// Live Analytics opens /portfolio/today?p=<token>. Pages: today | holding | performance | summary | equity-exposure
export type AnalyticsPage = 'today' | 'holding' | 'performance' | 'summary' | 'equity-exposure';
export const analyticsPath = (dbId: string, familyId: string, portfolioId: string, page: AnalyticsPage = 'today') =>
  `${ANALYTICS_ORIGIN}/portfolio/${page}?p=${encodeAnalyticsContext({ dbId, familyId, portfolioId })}`;
