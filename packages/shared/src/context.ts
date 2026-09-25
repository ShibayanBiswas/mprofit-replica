// Analytics tenancy token. Live uses /portfolio/today?p=<opaque>; we encode db/family/portfolio in the same slot.

export interface AnalyticsContext {
  dbId: string;
  familyId: string;
  portfolioId: string;
}

const toBase64Url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));

export function encodeAnalyticsContext(ctx: AnalyticsContext): string {
  return toBase64Url(`${ctx.dbId}|${ctx.familyId}|${ctx.portfolioId}`);
}

export function decodeAnalyticsContext(token: string | null | undefined): AnalyticsContext | null {
  if (!token) return null;
  try {
    const [dbId, familyId, portfolioId] = fromBase64Url(token).split('|');
    if (!dbId || !familyId || !portfolioId) return null;
    return { dbId, familyId, portfolioId };
  } catch {
    return null;
  }
}
