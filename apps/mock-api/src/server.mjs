// Dependency-free mock API. Cookie session, JSON routes under /api/*. Port 3001.
import http from 'node:http';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { users, databases, accessUsers } from './seed/users.mjs';
import { families, portfolios, assetClasses, holdings, indices, analyticsIndices, benchmarks, watchlist, categoryOf, indexCatalog, defaultSelectedIndices, benchmarkSettings, reportStudioViews, customCategoryRows, categoryMaster } from './seed/portfolios.mjs';
import { reportsCatalog, reportJobs } from './seed/reports.mjs';
import { globalReports, brokers, importTemplates, changelog, tasks, corporateActions, preferences, advisorProfile, autoTransferCharges, helpArticles } from './seed/misc.mjs';
import { attachStore, flush, markDirty } from './store.mjs';

const PORT = Number(process.env.PORT || 3001);
const cookieFlags = () => (process.env.NODE_ENV === 'production' ? '; Secure' : '');
const COOKIE = 'mp_sid';

// ---- in-memory state ---------------------------------------------------------------------------
const sessions = new Map(); // sid → { userId, createdAt, lastSeen }
const state = {
  families: [...families],
  portfolios: [...portfolios],
  holdings: structuredClone(holdings),
  accessUsers: [...accessUsers],
  reportJobs: [...reportJobs],
  tasks: [...tasks],
  corporateActions: [...corporateActions],
  preferences: { ...preferences },
  advisorProfile: { ...advisorProfile },
  autoTransferCharges: { ...autoTransferCharges },
  lastAccessed: new Map(), // userId → portfolioId
  recentPortfolios: new Map(), // userId → portfolioId[]
  transactions: [],
  branding: { logoUrl: null },
  watchlist: [...watchlist],
  analyticsPreferences: { zeroValues: true, pmsLineItem: true },
  benchmarkCode: 'NIFTY50TRI',
  selectedIndices: [...defaultSelectedIndices],
  benchmarkSettings: structuredClone(benchmarkSettings),
  savedBlends: [],
  reportViews: [],
  reportLog: [],
  advisors: [],
  customCategories: structuredClone(customCategoryRows),
  categoryMaster: structuredClone(categoryMaster),
};

// ---- helpers -----------------------------------------------------------------------------------
const round2 = (n) => Math.round(n * 100) / 100;
const capitalizeInitials = (s) => s.trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
const parseCookies = (h = '') => Object.fromEntries(h.split(';').map((c) => c.trim().split('=')).filter((p) => p[0]));
const json = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const readBody = (req) => new Promise((resolve) => {
  let data = '';
  req.on('data', (c) => (data += c));
  req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } });
});
const publicUser = (u) => ({ id: u.id, email: u.email, displayName: u.displayName, role: u.role });

function computeSummary(portfolioId, mode) {
  const p = state.portfolios.find((x) => x.id === portfolioId);
  if (!p) return null;
  const members = p.isGroup ? state.portfolios.filter((x) => x.familyId === p.familyId && !x.isGroup) : [p];
  const codes = new Set(assetClasses.filter((a) => a.mode === mode).map((a) => a.code));
  const rows = members.flatMap((m) => (state.holdings[m.id] || []).filter((h) => codes.has(h.assetClassCode)));
  const totals = rows.reduce((t, r) => ({
    amtInvested: t.amtInvested + r.amtInvested, todaysGain: t.todaysGain + r.todaysGain,
    unrealisedGain: t.unrealisedGain + r.unrealisedGain, currentValue: t.currentValue + r.currentValue,
  }), { amtInvested: 0, todaysGain: 0, unrealisedGain: 0, currentValue: 0 });
  const prev = totals.currentValue - totals.todaysGain;
  return {
    portfolio: p, mode, rows, asOn: new Date().toISOString(),
    totals: {
      amtInvested: round2(totals.amtInvested), todaysGain: round2(totals.todaysGain),
      todaysGainPct: prev ? round2((totals.todaysGain / prev) * 100) : 0,
      unrealisedGain: round2(totals.unrealisedGain),
      unrealisedGainPct: totals.amtInvested ? round2((totals.unrealisedGain / totals.amtInvested) * 100) : 0,
      currentValue: round2(totals.currentValue),
    },
  };
}

function assetAllocation(portfolioId) {
  const s = computeSummary(portfolioId, 'INV');
  if (!s) return null;
  const byClass = new Map();
  for (const r of s.rows) {
    const label = assetClasses.find((a) => a.code === r.assetClassCode)?.label ?? r.assetClassCode;
    const cur = byClass.get(label) || { assetClass: label, amtInvested: 0, unrealisedGain: 0, currentValue: 0 };
    cur.amtInvested += r.amtInvested; cur.unrealisedGain += r.unrealisedGain; cur.currentValue += r.currentValue;
    byClass.set(label, cur);
  }
  const rows = [...byClass.values()].map((r) => ({
    ...r, amtInvested: round2(r.amtInvested), unrealisedGain: round2(r.unrealisedGain), currentValue: round2(r.currentValue),
    gainPct: r.amtInvested ? round2((r.unrealisedGain / r.amtInvested) * 100) : 0,
    holdingPct: s.totals.currentValue ? round2((r.currentValue / s.totals.currentValue) * 100) : 0,
  })).sort((a, b) => b.currentValue - a.currentValue);
  return {
    asOn: s.asOn, currentValue: s.totals.currentValue, amtInvested: s.totals.amtInvested,
    unrealisedGain: s.totals.unrealisedGain, unrealisedGainPct: s.totals.amtInvested ? s.totals.unrealisedGainPct : null, rows,
  };
}

function performance(portfolioId) {
  const s = computeSummary(portfolioId, 'INV');
  if (!s) return null;
  const has = s.rows.length > 0;
  return {
    xirr: has ? round2(9.5 + (s.totals.unrealisedGainPct % 7)) : null,
    firstTransactionDate: has ? '2021-04-12' : null,
    currentValuation: s.totals.currentValue, totalInvestment: s.totals.amtInvested, totalWithdrawal: 0,
    totalGain: s.totals.unrealisedGain, realisedPl: 0, unrealisedPl: s.totals.unrealisedGain, totalIncome: 0,
    benchmark: { name: 'NIFTY 50', cagr: has ? 12.84 : null },
  };
}

const SECTORS = { 'Reliance Industries Ltd': 'Energy', 'HDFC Bank Ltd': 'Financial Services', 'ICICI Bank Ltd': 'Financial Services', 'Infosys Ltd': 'IT', 'Tata Consultancy Services Ltd': 'IT', 'Larsen & Toubro Ltd': 'Construction', 'Asian Paints Ltd': 'Consumer Durables', 'Titan Company Ltd': 'Consumer Durables', 'Zomato Ltd': 'Consumer Services', 'Tata Motors Ltd': 'Automobile' };
const CAPS = { 'Zomato Ltd': 'Mid Cap', 'Tata Motors Ltd': 'Large Cap' };

function equityExposure(portfolioId) {
  const s = computeSummary(portfolioId, 'INV');
  if (!s) return null;
  const eq = s.rows.filter((r) => r.assetClassCode === 'EQ');
  const eqTotal = eq.reduce((t, r) => t + r.currentValue, 0);
  const group = (key) => {
    const m = new Map();
    for (const r of eq) { const k = key(r); m.set(k, (m.get(k) || 0) + r.currentValue); }
    return [...m.entries()].map(([name, currentValue]) => ({
      name, currentValue: round2(currentValue),
      pctOfEquity: eqTotal ? round2((currentValue / eqTotal) * 100) : 0,
      pctOfPortfolio: s.totals.currentValue ? round2((currentValue / s.totals.currentValue) * 100) : 0,
    })).sort((a, b) => b.currentValue - a.currentValue);
  };
  return {
    asOn: s.asOn, currentValue: round2(eqTotal),
    byStock: group((r) => r.name), bySector: group((r) => SECTORS[r.name] ?? 'Others'), byMarketCap: group((r) => CAPS[r.name] ?? 'Large Cap'),
  };
}

function movers(portfolioId) {
  const s = computeSummary(portfolioId, 'INV');
  if (!s) return null;
  const eq = s.rows.filter((r) => r.assetClassCode === 'EQ').map((r) => ({ name: r.name, price: r.currentPrice, change: round2(r.todaysGain / r.qty), changePct: r.todaysGainPct }));
  const sorted = [...eq].sort((a, b) => b.changePct - a.changePct);
  return { gainers: sorted.filter((m) => m.changePct > 0).slice(0, 5), losers: sorted.filter((m) => m.changePct < 0).reverse().slice(0, 5) };
}

// Performance rows grouped by category or asset class (illustrative XIRR derived from unrealised gain %).
function performanceBreakdown(portfolioId) {
  const s = computeSummary(portfolioId, 'INV');
  if (!s) return null;
  const build = (keyOf) => {
    const m = new Map();
    for (const r of s.rows) {
      const k = keyOf(r);
      const cur = m.get(k) || { name: k, closingValuation: 0, totalInvestment: 0, totalWithdrawal: 0, totalGain: 0, realisedGain: 0, unrealisedGain: 0, totalIncome: 0 };
      cur.closingValuation += r.currentValue; cur.totalInvestment += r.amtInvested; cur.totalGain += r.unrealisedGain; cur.unrealisedGain += r.unrealisedGain;
      m.set(k, cur);
    }
    return [...m.values()].map((r) => ({
      ...r, closingValuation: round2(r.closingValuation), totalInvestment: round2(r.totalInvestment), totalGain: round2(r.totalGain), unrealisedGain: round2(r.unrealisedGain),
      xirr: r.totalInvestment ? round2(Math.max(-40, Math.min(60, (r.unrealisedGain / r.totalInvestment) * 100 / 2.6))) : null,
    })).sort((a, b) => b.closingValuation - a.closingValuation);
  };
  return {
    byCategory: build((r) => categoryOf[r.assetClassCode] ?? 'Others'),
    byAssetClass: build((r) => assetClasses.find((a) => a.code === r.assetClassCode)?.label ?? r.assetClassCode),
  };
}

// ---- router ------------------------------------------------------------------------------------
const routes = [];
const route = (method, pattern, handler, opts = {}) => routes.push({ method, re: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}/?$`), handler, auth: opts.auth !== false });

// auth
route('POST', '/api/Auth/Login', async (ctx) => {
  const { email = '', password = '' } = ctx.body;
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
  if (!u) return json(ctx.res, 401, { message: 'Invalid email or password' });
  const sid = crypto.randomBytes(16).toString('hex');
  sessions.set(sid, { userId: u.id, createdAt: Date.now(), lastSeen: Date.now() });
  json(ctx.res, 200, { user: publicUser(u), databases }, { 'Set-Cookie': `${COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax${cookieFlags()}` });
}, { auth: false });
route('POST', '/api/Auth/Logout', (ctx) => { sessions.delete(ctx.sid); json(ctx.res, 204, undefined, { 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0` }); }, { auth: false });
route('POST', '/api/Auth/ForgotPassword', (ctx) => json(ctx.res, 200, { message: `If an account exists for ${ctx.body.email ?? ''}, a reset link has been sent.` }), { auth: false });
route('GET', '/api/Auth/Me', (ctx) => json(ctx.res, 200, { user: publicUser(ctx.user), databases }));
route('GET', '/api/Auth/KeepAlive', (ctx) => json(ctx.res, 200, { ok: true, at: new Date().toISOString() }));
route('POST', '/api/Auth/ChangePassword', (ctx) => {
  if (ctx.body.currentPassword !== ctx.user.password) return json(ctx.res, 400, { message: 'Current password is incorrect' });
  ctx.user.password = ctx.body.newPassword; json(ctx.res, 204);
});

// databases / families / portfolios
route('GET', '/api/Databases', (ctx) => json(ctx.res, 200, databases));
route('GET', '/api/Databases/:dbId/Families', (ctx) => json(ctx.res, 200, state.families.filter((f) => f.dbId === ctx.params.dbId)));
route('POST', '/api/Databases/:dbId/Families', (ctx) => {
  const f = { id: crypto.randomBytes(8).toString('hex'), dbId: ctx.params.dbId, name: capitalizeInitials(ctx.body.name || 'New Family') };
  state.families.push(f);
  const grp = { id: `grp-${f.id}`, familyId: f.id, shortName: 'Family Group', fullName: `${f.name} Group`, pan: '', type: 'Investment', isGroup: true, isTrading: false, isPms: false };
  state.portfolios.push(grp); state.holdings[grp.id] = [];
  json(ctx.res, 201, f);
});
route('PUT', '/api/Families/:familyId', (ctx) => {
  const f = state.families.find((x) => x.id === ctx.params.familyId); if (!f) return json(ctx.res, 404, { message: 'Not found' });
  if (ctx.body.name) f.name = capitalizeInitials(ctx.body.name); json(ctx.res, 200, f);
});
route('GET', '/api/Families/:familyId/Portfolios', (ctx) => json(ctx.res, 200, state.portfolios.filter((p) => p.familyId === ctx.params.familyId)));
route('POST', '/api/Families/:familyId/Portfolios', (ctx) => {
  const b = ctx.body;
  const p = { id: crypto.randomBytes(8).toString('hex'), familyId: ctx.params.familyId, shortName: capitalizeInitials(b.shortName || 'New Portfolio'), fullName: capitalizeInitials(b.fullName || b.shortName || 'New Portfolio'), pan: (b.pan || '').toUpperCase(), type: b.type || 'Investment', isGroup: !!b.isGroup, isTrading: !!b.isTrading, isPms: !!b.isPms };
  state.portfolios.push(p); state.holdings[p.id] = []; json(ctx.res, 201, p);
});
route('PUT', '/api/Portfolios/:portfolioId', (ctx) => {
  const p = state.portfolios.find((x) => x.id === ctx.params.portfolioId); if (!p) return json(ctx.res, 404, { message: 'Not found' });
  Object.assign(p, { ...ctx.body, shortName: ctx.body.shortName ? capitalizeInitials(ctx.body.shortName) : p.shortName, fullName: ctx.body.fullName ? capitalizeInitials(ctx.body.fullName) : p.fullName, id: p.id, familyId: p.familyId });
  json(ctx.res, 200, p);
});
route('GET', '/api/Portfolios/:portfolioId', (ctx) => {
  const p = state.portfolios.find((x) => x.id === ctx.params.portfolioId); p ? json(ctx.res, 200, p) : json(ctx.res, 404, { message: 'Not found' });
});
route('GET', '/api/Portfolios/:portfolioId/Summary', (ctx) => {
  const s = computeSummary(ctx.params.portfolioId, ctx.query.get('mode') === 'FO' ? 'FO' : 'INV');
  if (!s) return json(ctx.res, 404, { message: 'Not found' });
  const recent = state.recentPortfolios.get(ctx.user.id) || [];
  state.recentPortfolios.set(ctx.user.id, [ctx.params.portfolioId, ...recent.filter((x) => x !== ctx.params.portfolioId)].slice(0, 10));
  state.lastAccessed.set(ctx.user.id, ctx.params.portfolioId);
  json(ctx.res, 200, s);
});
route('GET', '/api/Portfolios/:portfolioId/AssetAllocation', (ctx) => json(ctx.res, 200, assetAllocation(ctx.params.portfolioId)));
route('GET', '/api/Portfolios/:portfolioId/Performance', (ctx) => json(ctx.res, 200, performance(ctx.params.portfolioId)));
route('GET', '/api/Portfolios/:portfolioId/EquityExposure', (ctx) => json(ctx.res, 200, equityExposure(ctx.params.portfolioId)));
route('GET', '/api/Portfolios/:portfolioId/Xirr', (ctx) => {
  const perf = performance(ctx.params.portfolioId);
  json(ctx.res, 200, { portfolioId: ctx.params.portfolioId, xirr: perf?.xirr ?? null, withZeroHoldings: ctx.query.get('withZero') === 'true', firstTransactionDate: perf?.firstTransactionDate ?? null });
});
route('GET', '/api/Portfolios/:portfolioId/Transactions', (ctx) => json(ctx.res, 200, state.transactions.filter((t) => t.portfolioId === ctx.params.portfolioId)));
route('POST', '/api/Portfolios/:portfolioId/Transactions', (ctx) => {
  const t = { id: crypto.randomBytes(6).toString('hex'), portfolioId: ctx.params.portfolioId, ...ctx.body };
  state.transactions.push(t); json(ctx.res, 201, t);
});
route('GET', '/api/AssetClasses', (ctx) => json(ctx.res, 200, assetClasses));
route('GET', '/api/Market/Indices', (ctx) => {
  // small jitter so the sidebar looks alive between refreshes
  json(ctx.res, 200, indices.map((i) => { const j = (Math.random() - 0.5) * 6; return { ...i, value: round2(i.value + j), change: round2(i.change + j), changePct: round2(((i.change + j) / (i.value - i.change)) * 100) }; }));
});
route('GET', '/api/Search', (ctx) => {
  const q = (ctx.query.get('q') || '').toLowerCase();
  const type = ctx.query.get('type') || 'ALL';
  const recentIds = state.recentPortfolios.get(ctx.user.id) || [];
  let hits = state.portfolios.map((p) => ({ portfolioId: p.id, portfolioName: p.shortName, familyId: p.familyId, familyName: state.families.find((f) => f.id === p.familyId)?.name ?? '', type: p.type === 'F&O' ? 'F&O' : 'INV', isGroup: p.isGroup }));
  if (q) hits = hits.filter((h) => h.portfolioName.toLowerCase().includes(q) || h.familyName.toLowerCase().includes(q));
  if (type === 'RECENT') hits = recentIds.map((id) => hits.find((h) => h.portfolioId === id)).filter(Boolean);
  else if (type !== 'ALL') hits = hits.filter((h) => h.type === type);
  json(ctx.res, 200, hits);
});
route('GET', '/api/Users/Settings', (ctx) => json(ctx.res, 200, { lastAccessedPortfolioId: state.lastAccessed.get(ctx.user.id) ?? null, preferences: state.preferences }));
route('PUT', '/api/Users/Preferences', (ctx) => { Object.assign(state.preferences, ctx.body); json(ctx.res, 200, state.preferences); });
route('GET', '/api/Users/Recent', (ctx) => json(ctx.res, 200, (state.recentPortfolios.get(ctx.user.id) || []).map((id) => state.portfolios.find((p) => p.id === id)).filter(Boolean)));

// reports
route('GET', '/api/Reports/Catalog', (ctx) => json(ctx.res, 200, reportsCatalog));
route('GET', '/api/Reports/Global', (ctx) => json(ctx.res, 200, globalReports));
route('GET', '/api/Reports/Jobs', (ctx) => json(ctx.res, 200, state.reportJobs));
route('POST', '/api/Reports/Jobs', (ctx) => {
  const job = { id: crypto.randomBytes(6).toString('hex'), reportName: ctx.body.reportName || 'Report', portfolioName: ctx.body.portfolioName || '', status: 'Running', createdAt: new Date().toISOString(), format: ctx.body.format || 'PDF' };
  state.reportJobs.unshift(job);
  setTimeout(() => { job.status = 'Ready'; }, 2500);
  json(ctx.res, 202, job);
});

// tools
route('GET', '/api/AccessControl/Users', (ctx) => json(ctx.res, 200, { users: state.accessUsers, maxUsers: databases[0].maxUsers }));
route('POST', '/api/AccessControl/Users', (ctx) => { const u = { id: crypto.randomBytes(4).toString('hex'), email: ctx.body.email, type: ctx.body.type || 'User', access: ctx.body.access || 'All Families' }; state.accessUsers.push(u); json(ctx.res, 201, u); });
route('DELETE', '/api/AccessControl/Users/:id', (ctx) => { state.accessUsers = state.accessUsers.filter((u) => u.id !== ctx.params.id); json(ctx.res, 204); });
route('GET', '/api/CorporateActions', (ctx) => json(ctx.res, 200, state.corporateActions));
route('GET', '/api/Tools/AutoTransferCharges', (ctx) => json(ctx.res, 200, state.autoTransferCharges));
route('PUT', '/api/Tools/AutoTransferCharges', (ctx) => { Object.assign(state.autoTransferCharges, ctx.body); json(ctx.res, 200, state.autoTransferCharges); });
route('GET', '/api/Tools/Tasks', (ctx) => json(ctx.res, 200, state.tasks));
route('GET', '/api/Tools/AdvisorProfile', (ctx) => json(ctx.res, 200, state.advisorProfile));
route('PUT', '/api/Tools/AdvisorProfile', (ctx) => { Object.assign(state.advisorProfile, ctx.body); json(ctx.res, 200, state.advisorProfile); });
route('GET', '/api/Tools/Branding', (ctx) => json(ctx.res, 200, state.branding));
route('PUT', '/api/Tools/Branding', (ctx) => { Object.assign(state.branding, ctx.body); json(ctx.res, 200, state.branding); });
route('GET', '/api/Masters/Portfolios', (ctx) => json(ctx.res, 200, state.portfolios.map((p) => ({ ...p, familyName: state.families.find((f) => f.id === p.familyId)?.name ?? '' }))));

// import
route('GET', '/api/Import/Brokers', (ctx) => json(ctx.res, 200, brokers));
route('GET', '/api/Import/Templates', (ctx) => { const t = ctx.query.get('assetType'); json(ctx.res, 200, t ? importTemplates.filter((x) => x.assetType === t) : importTemplates); });
route('POST', '/api/Import/Upload', (ctx) => json(ctx.res, 202, { id: crypto.randomBytes(6).toString('hex'), status: 'Queued', message: 'File received. Processing will begin shortly.' }));

// analytics
const jitter = (i) => { const j = (Math.random() - 0.5) * 0.02 * i.value; const change = round2(i.change + j); return { ...i, value: round2(i.value + j), change, changePct: round2((change / (i.value - i.change)) * 100) }; };
// Quote for any catalogue index: seeded ones use real-looking values, the rest get a deterministic synthetic level.
const quoteFor = (name) => {
  const seeded = analyticsIndices.find((i) => i.name === name);
  if (seeded) return seeded;
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const value = 5000 + (h % 45000); const changePct = round2(((h % 400) - 200) / 100);
  return { code: name, name, value, change: round2((value * changePct) / 100), changePct };
};
route('GET', '/api/Market/AnalyticsIndices', (ctx) => json(ctx.res, 200, state.selectedIndices.map((n) => jitter(quoteFor(n)))));
route('GET', '/api/Market/IndexCatalog', (ctx) => json(ctx.res, 200, { selected: state.selectedIndices, indices: indexCatalog }));
route('PUT', '/api/Market/SelectedIndices', (ctx) => {
  const names = Array.isArray(ctx.body.names) ? ctx.body.names.filter((n) => indexCatalog.some((i) => i.name === n)).slice(0, 5) : [];
  if (names.length) state.selectedIndices = names;
  json(ctx.res, 200, { selected: state.selectedIndices, indices: indexCatalog });
});
route('GET', '/api/Market/Blends', (ctx) => json(ctx.res, 200, state.savedBlends));
route('POST', '/api/Market/Blends', (ctx) => {
  const b = { id: crypto.randomBytes(4).toString('hex'), name: ctx.body.name || 'Blend', parts: Array.isArray(ctx.body.parts) ? ctx.body.parts : [] };
  state.savedBlends.push(b); json(ctx.res, 201, b);
});
route('GET', '/api/Users/BenchmarkSettings', (ctx) => {
  const portfoliosWise = state.portfolios.filter((p) => !p.isGroup).map((p) => ({ id: p.id, name: p.shortName, familyName: state.families.find((f) => f.id === p.familyId)?.name ?? '', benchmark: null }));
  json(ctx.res, 200, { ...state.benchmarkSettings, portfolios: portfoliosWise });
});
route('PUT', '/api/Users/BenchmarkSettings', (ctx) => {
  if (typeof ctx.body.defaultBenchmark === 'string') state.benchmarkSettings.defaultBenchmark = ctx.body.defaultBenchmark;
  if (ctx.body.category && typeof ctx.body.category === 'string') {
    const c = state.benchmarkSettings.categories.find((x) => x.name === ctx.body.category);
    if (c) c.benchmark = ctx.body.benchmark ?? null;
  }
  json(ctx.res, 200, state.benchmarkSettings);
});
route('GET', '/api/ReportStudio/Views', (ctx) => json(ctx.res, 200, { popular: reportStudioViews, mine: state.reportViews }));
route('POST', '/api/ReportStudio/Views', (ctx) => {
  const v = { id: crypto.randomBytes(4).toString('hex'), name: ctx.body.name || 'Untitled report', kind: ctx.body.kind || 'Holdings', level: ctx.body.level || 'Family', description: ctx.body.description || '' };
  state.reportViews.push(v); json(ctx.res, 201, v);
});
route('DELETE', '/api/ReportStudio/Views/:id', (ctx) => { state.reportViews = state.reportViews.filter((v) => v.id !== ctx.params.id); json(ctx.res, 204); });
// "Copy to My Views" on a popular view.
route('POST', '/api/ReportStudio/Views/:id/Copy', (ctx) => {
  const src = reportStudioViews.find((v) => v.id === ctx.params.id) || state.reportViews.find((v) => v.id === ctx.params.id);
  if (!src) return json(ctx.res, 404, { message: 'View not found' });
  const v = { ...src, id: crypto.randomBytes(4).toString('hex'), name: `${src.name} (copy)` };
  state.reportViews.push(v); json(ctx.res, 201, v);
});
// "Open View" runs the report and records it in the log.
route('POST', '/api/ReportStudio/Views/:id/Run', (ctx) => {
  const src = reportStudioViews.find((v) => v.id === ctx.params.id) || state.reportViews.find((v) => v.id === ctx.params.id);
  if (!src) return json(ctx.res, 404, { message: 'View not found' });
  const fam = state.families.find((f) => f.id === ctx.body.familyId) || state.families[0];
  const entry = { id: crypto.randomBytes(4).toString('hex'), viewId: src.id, viewName: src.name, kind: src.kind, level: src.level, familyName: fam ? fam.name : '', status: 'Completed', ranAt: new Date().toISOString() };
  state.reportLog.unshift(entry); json(ctx.res, 201, entry);
});
route('GET', '/api/ReportStudio/Log', (ctx) => json(ctx.res, 200, state.reportLog));

// Portfolio → Actions → Manage advisors / Tag advisor.
route('GET', '/api/Advisors', (ctx) => json(ctx.res, 200, state.advisors));
route('POST', '/api/Advisors', (ctx) => {
  const a = { id: crypto.randomBytes(4).toString('hex'), name: capitalizeInitials(String(ctx.body.name || '')), email: String(ctx.body.email || ''), phone: String(ctx.body.phone || '') };
  state.advisors.push(a); json(ctx.res, 201, a);
});
route('PUT', '/api/Advisors/:id', (ctx) => {
  const a = state.advisors.find((x) => x.id === ctx.params.id);
  if (!a) return json(ctx.res, 404, { message: 'Advisor not found' });
  Object.assign(a, { name: ctx.body.name ?? a.name, email: ctx.body.email ?? a.email, phone: ctx.body.phone ?? a.phone }); json(ctx.res, 200, a);
});
route('DELETE', '/api/Advisors/:id', (ctx) => {
  state.advisors = state.advisors.filter((x) => x.id !== ctx.params.id);
  for (const p of state.portfolios) if (p.advisorId === ctx.params.id) p.advisorId = null;
  json(ctx.res, 204);
});
route('PUT', '/api/Portfolios/:portfolioId/Advisor', (ctx) => {
  const p = state.portfolios.find((x) => x.id === ctx.params.portfolioId);
  if (!p) return json(ctx.res, 404, { message: 'Portfolio not found' });
  p.advisorId = ctx.body.advisorId || null; json(ctx.res, 200, p);
});

// wrench → Custom Categories (+ Category Master).
route('GET', '/api/Users/CustomCategories', (ctx) => json(ctx.res, 200, { rows: state.customCategories, master: state.categoryMaster }));
route('PUT', '/api/Users/CustomCategories', (ctx) => {
  const updates = Array.isArray(ctx.body.rows) ? ctx.body.rows : [];
  for (const u of updates) {
    const r = state.customCategories.find((x) => x.id === u.id);
    if (!r) continue;
    const def = customCategoryRows.find((x) => x.id === u.id);
    r.category = String(u.category || r.category); r.subCategory = String(u.subCategory || r.subCategory);
    r.isDefault = !!def && def.category === r.category && def.subCategory === r.subCategory;
  }
  json(ctx.res, 200, { rows: state.customCategories, master: state.categoryMaster });
});
route('POST', '/api/Users/CustomCategories/Reset', (ctx) => { state.customCategories = structuredClone(customCategoryRows); json(ctx.res, 200, { rows: state.customCategories, master: state.categoryMaster }); });
route('POST', '/api/Users/CategoryMaster', (ctx) => {
  const name = capitalizeInitials(String(ctx.body.name || ''));
  if (!name) return json(ctx.res, 400, { message: 'Name is required' });
  if (ctx.body.parent) {
    const parent = state.categoryMaster.find((c) => c.name === ctx.body.parent);
    if (!parent) return json(ctx.res, 404, { message: 'Category not found' });
    parent.subCategories.push({ name, isDefault: false });
  } else state.categoryMaster.push({ name, isDefault: false, subCategories: [] });
  json(ctx.res, 201, state.categoryMaster);
});
route('GET', '/api/Market/Benchmarks', (ctx) => json(ctx.res, 200, { selected: state.benchmarkCode, benchmarks }));
route('PUT', '/api/Market/Benchmarks', (ctx) => { if (benchmarks.some((b) => b.code === ctx.body.code)) state.benchmarkCode = ctx.body.code; json(ctx.res, 200, { selected: state.benchmarkCode, benchmarks }); });
route('GET', '/api/Watchlist', (ctx) => json(ctx.res, 200, state.watchlist));
route('POST', '/api/Watchlist', (ctx) => { const w = { id: crypto.randomBytes(4).toString('hex'), name: ctx.body.name || 'Stock', price: Number(ctx.body.price) || 0, change: 0, changePct: 0 }; state.watchlist.push(w); json(ctx.res, 201, w); });
route('DELETE', '/api/Watchlist/:id', (ctx) => { state.watchlist = state.watchlist.filter((w) => w.id !== ctx.params.id); json(ctx.res, 204); });
route('PUT', '/api/Watchlist/Order', (ctx) => { const ids = Array.isArray(ctx.body.ids) ? ctx.body.ids : []; state.watchlist.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); json(ctx.res, 200, state.watchlist); });
route('GET', '/api/Portfolios/:portfolioId/Movers', (ctx) => json(ctx.res, 200, movers(ctx.params.portfolioId)));
route('GET', '/api/Portfolios/:portfolioId/PerformanceBreakdown', (ctx) => json(ctx.res, 200, performanceBreakdown(ctx.params.portfolioId)));
route('GET', '/api/Portfolios/:portfolioId/CorporateActions', (ctx) => {
  const s = computeSummary(ctx.params.portfolioId, 'INV');
  const names = new Set((s?.rows ?? []).filter((r) => r.assetClassCode === 'EQ').map((r) => r.name));
  json(ctx.res, 200, state.corporateActions.filter((c) => names.has(c.stockName)));
});
route('GET', '/api/Users/AnalyticsPreferences', (ctx) => json(ctx.res, 200, state.analyticsPreferences));
route('PUT', '/api/Users/AnalyticsPreferences', (ctx) => { Object.assign(state.analyticsPreferences, ctx.body); json(ctx.res, 200, state.analyticsPreferences); });

// misc
route('GET', '/api/ChangeLog', (ctx) => json(ctx.res, 200, changelog));
route('GET', '/api/Help/Articles', (ctx) => json(ctx.res, 200, helpArticles));

// ---- server ------------------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': req.headers.origin || '*', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' }); return res.end(); }
  if (req.headers.origin) { res.setHeader('Access-Control-Allow-Origin', req.headers.origin); res.setHeader('Access-Control-Allow-Credentials', 'true'); }
  const sid = parseCookies(req.headers.cookie)[COOKIE];
  const session = sid ? sessions.get(sid) : null;
  if (session) session.lastSeen = Date.now();
  const user = session ? users.find((u) => u.id === session.userId) : null;
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const m = url.pathname.match(r.re); if (!m) continue;
    if (r.auth && !user) return json(res, 401, { message: 'Unauthorized' });
    const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : {};
    try {
      const out = await r.handler({ req, res, params: m.groups || {}, query: url.searchParams, body, user, sid });
      if (req.method !== 'GET' && req.method !== 'OPTIONS') {
        markDirty();
        if (process.env.VERCEL) await flush();
      }
      return out;
    }
    catch (e) { console.error(e); return json(res, 500, { message: 'Internal error' }); }
  }
  json(res, 404, { message: `No route ${req.method} ${url.pathname}` });
});

function snapshot() {
  return {
    sessions: [...sessions.entries()],
    users,
    families: state.families,
    portfolios: state.portfolios,
    holdings: state.holdings,
    accessUsers: state.accessUsers,
    reportJobs: state.reportJobs,
    tasks: state.tasks,
    corporateActions: state.corporateActions,
    preferences: state.preferences,
    advisorProfile: state.advisorProfile,
    autoTransferCharges: state.autoTransferCharges,
    lastAccessed: [...state.lastAccessed.entries()],
    recentPortfolios: [...state.recentPortfolios.entries()],
    transactions: state.transactions,
    branding: state.branding,
    watchlist: state.watchlist,
    analyticsPreferences: state.analyticsPreferences,
    benchmarkCode: state.benchmarkCode,
    selectedIndices: state.selectedIndices,
    benchmarkSettings: state.benchmarkSettings,
    savedBlends: state.savedBlends,
    reportViews: state.reportViews,
    reportLog: state.reportLog,
    advisors: state.advisors,
    customCategories: state.customCategories,
    categoryMaster: state.categoryMaster,
  };
}

function applyPayload(payload) {
  sessions.clear();
  for (const [k, v] of payload.sessions || []) sessions.set(k, v);
  if (Array.isArray(payload.users)) { users.splice(0, users.length, ...payload.users); }
  const maps = { lastAccessed: 'lastAccessed', recentPortfolios: 'recentPortfolios' };
  for (const key of Object.keys(state)) {
    if (payload[key] === undefined) continue;
    if (maps[key]) {
      state[key].clear();
      for (const [k, v] of payload[key]) state[key].set(k, v);
    } else {
      state[key] = payload[key];
    }
  }
}

export async function ready() {
  if (ready.done) return;
  ready.done = (async () => {
    const payload = await attachStore(snapshot);
    if (payload) applyPayload(payload);
    else markDirty();
    await flush();
  })();
  return ready.done;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await ready();
  server.listen(PORT, '0.0.0.0', () => console.log(`[mock-api] listening on 0.0.0.0:${PORT}`));
}

export { server };
