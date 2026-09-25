import { CLASSIC_URL, encodeAnalyticsContext, type AnalyticsContext } from '@mprofit/shared';

// Live: app.mprofit.in/portfolio/<page>[/<sub>]?p=<token>. Pages mirror the live router.
// today | holding | performance      → Dashboard (tab strip)
// summary                            → Portfolio (rail collapses)
// equity-exposure                    → live keeps /holding and flips a mode bit inside the token; we use an explicit segment
// custom-report-builder/view         → Report Studio (BETA) list · /edit → View Builder · /log → View Log
// custom-categories                  → wrench → Custom Categories · /manage → Category Master
// default-benchmark                  → wrench → Benchmark Settings
// advisors                           → Portfolio → Actions → Manage advisors
export type AnalyticsPage = 'today' | 'holding' | 'performance' | 'summary' | 'equity-exposure' | 'custom-report-builder' | 'custom-categories' | 'default-benchmark' | 'advisors';
export const PAGES: AnalyticsPage[] = ['today', 'holding', 'performance', 'summary', 'equity-exposure', 'custom-report-builder', 'custom-categories', 'default-benchmark', 'advisors'];

export const pagePath = (page: AnalyticsPage, ctx: AnalyticsContext, sub?: string, extra?: Record<string, string>) => {
  const q = new URLSearchParams({ p: encodeAnalyticsContext(ctx), ...(extra ?? {}) });
  return `/portfolio/${page}${sub ? `/${sub}` : ''}?${q.toString()}`;
};

// "Classic View" returns to the Classic SPA on the same db/family/portfolio.
export const classicPath = (ctx: AnalyticsContext) => `${CLASSIC_URL}/app/db/${ctx.dbId}/f/${ctx.familyId}/pms/${ctx.portfolioId}/sum`;
export const CLASSIC_LOGIN = `${CLASSIC_URL}/login`;

export function isPage(s: string | undefined): s is AnalyticsPage {
  return !!s && (PAGES as string[]).includes(s);
}

export const isDashboardPage = (p: AnalyticsPage) => p === 'today' || p === 'holding' || p === 'performance';
// Pages whose sidebar starts collapsed to the 65px rail (live: Portfolio, Report Studio, Advisors).
export const isRailPage = (p: AnalyticsPage) => p === 'summary' || p === 'custom-report-builder' || p === 'advisors';
