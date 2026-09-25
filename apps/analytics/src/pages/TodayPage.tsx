import { useEffect, useMemo, useState } from 'react';
import { fmtAmount, fmtDate, fmtRupee, fmtSigned, fmtSignedPct } from '@mprofit/shared';
import type { AssetAllocation, CorporateAction, Movers, WatchlistItem } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { useOverlay } from '../state/OverlayContext';
import { DashboardTabs, ReportStudioButton } from '../components/shell/Shell';
import { Card, DataTable, EmptyState, GainPill, SearchField, useSort } from '../components/ui/Primitives';
import { BarsIcon, CheckCircleIcon, DragIcon, EditIcon, EyeIcon, LeaderboardIcon, SearchIcon, SlidersIcon, TriangleIcon } from '../components/ui/Icons';
import { Donut, IndexBars, PieLegend } from '../components/charts/Charts';

export function TodayPage() {
  const { ctx, portfolio, summary, indices } = useWorkspace();
  const { open } = useOverlay();
  const [alloc, setAlloc] = useState<AssetAllocation | null>(null);
  const [movers, setMovers] = useState<Movers | null>(null);
  const [watch, setWatch] = useState<WatchlistItem[]>([]);
  const [actions, setActions] = useState<CorporateAction[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    setAlloc(null); setMovers(null);
    void analyticsApi.assetAllocation(ctx.portfolioId).then(setAlloc);
    void analyticsApi.movers(ctx.portfolioId).then(setMovers);
    void analyticsApi.corporateActions(ctx.portfolioId).then(setActions);
  }, [ctx.portfolioId]);
  useEffect(() => { void analyticsApi.watchlist().then(setWatch); }, []);

  const totals = summary?.totals;
  const name = portfolio ? (portfolio.isGroup ? portfolio.shortName : portfolio.fullName || portfolio.shortName) : '';
  const rows = useMemo(() => (alloc?.rows ?? []).filter((r) => r.assetClass.toLowerCase().includes(q.toLowerCase())), [alloc, q]);
  const { sort, onSort, sorted } = useSort(rows, { key: 'currentValue', dir: 'desc' });
  // Today's gain per asset-class label (AssetAllocation rows are keyed by label).
  const todayByLabel = useMemo(() => {
    const m = new Map<string, { gain: number; cur: number }>();
    for (const r of summary?.rows ?? []) {
      const k = labelForCode(r.assetClassCode);
      const cur = m.get(k) ?? { gain: 0, cur: 0 };
      m.set(k, { gain: cur.gain + r.todaysGain, cur: cur.cur + r.currentValue });
    }
    return m;
  }, [summary]);

  return (
    <>
      <DashboardTabs right={<ReportStudioButton />} />
      <div className="an-content todayContainer">
        <div className="an-grid-2">
          <Card className="an-hero apptour-today-currentvalue">
            <span className="an-kind-badge">{portfolio?.isGroup ? 'Group' : 'Portfolio'}</span>
            <h1 className="an-hero-name">{name}</h1>
            <div className="an-hero-cv"><span className="an-label">Current Value</span><span className="an-hero-amt">{fmtRupee(totals?.currentValue ?? 0)}</span></div>
            <HeroArt />
          </Card>
          <Card className="an-gain-card apptour-today-currentgain">
            <div className="an-gain-row">
              <span className="an-label an-label-lg">Today's gain</span>
              <span className="an-gain-val">{fmtRupee(totals?.todaysGain ?? 0)}<GainPill pct={totals?.todaysGainPct ?? 0} /></span>
            </div>
            <hr />
            <div className="an-gain-row">
              <span className="an-label an-label-lg">Unrealised gain</span>
              <span className="an-gain-val">{fmtRupee(totals?.unrealisedGain ?? 0)}{totals && totals.amtInvested > 0 ? <GainPill pct={totals.unrealisedGainPct} /> : <span className="an-pill down"><TriangleIcon size={12} color="#c94c40" down /></span>}</span>
            </div>
          </Card>
        </div>

        <div className="an-grid-2 an-grid-2-tall">
          <Card className="an-perf-card apptour-today-todaysperformance">
            <div className="an-card-head-row">
              <BarsIcon />
              <div className="an-card-head-text">
                <h3>Today's Performance</h3>
                <p>See how your Stocks &amp; ETFs are moving today compared to market indices</p>
              </div>
              <button type="button" className="an-icon-btn" aria-label="Change Indices" onClick={() => open({ kind: 'changeIndices' })}><SlidersIcon /></button>
            </div>
            <IndexBars items={indices.map((i) => ({ name: i.name, changePct: i.changePct }))} portfolioPct={summary && summary.rows.some((r) => r.assetClassCode === 'EQ') ? eqTodayPct(summary.rows) : null} />
          </Card>
          <Card className="an-alloc-card apptour-today-assetallocation">
            <div className="an-card-head-text">
              <h3>Asset Allocation</h3>
              <p className="an-asof">as on {fmtDate(alloc?.asOn ?? summary?.asOn ?? new Date().toISOString())}</p>
            </div>
            <div className="an-donut-wrap"><Donut slices={(alloc?.rows ?? []).map((r) => ({ name: r.assetClass, value: r.currentValue }))} total={alloc?.currentValue ?? 0} size={340} /></div>
            <PieLegend slices={(alloc?.rows ?? []).map((r) => ({ name: r.assetClass, value: r.currentValue }))} total={alloc?.currentValue ?? 0} />
          </Card>
        </div>

        <h2 className="an-section-title">Stock insights</h2>
        <div className="an-grid-2 an-grid-insights">
          <Card className="an-movers-card">
            <div className="an-card-head-row">
              <span className="an-sq-icon"><LeaderboardIcon /></span>
              <h3>Today's Movers</h3>
            </div>
            {!movers || (movers.gainers.length === 0 && movers.losers.length === 0) ? (
              <EmptyState art={<MoversArt />} title="No Stocks in your portfolio" text="Add stocks in your portfolio to track the daily performance of your stocks" />
            ) : (
              <div className="an-movers">
                <MoverList title="Top Gainers" items={movers.gainers} />
                <MoverList title="Top Losers" items={movers.losers} />
              </div>
            )}
          </Card>
          <Card className="an-watch-card">
            <div className="an-card-head-row">
              <span className="an-sq-icon"><EyeIcon color="#12131a" /></span>
              <h3>Watchlist</h3>
              <span className="an-card-actions">
                <button type="button" className="an-icon-btn" aria-label="search" onClick={() => open({ kind: 'watchlistSearch' })}><SearchIcon size={28} color="#12131a" /></button>
                <button type="button" className="an-icon-btn" aria-label="edit" onClick={() => open({ kind: 'watchlistEdit' })}><EditIcon /></button>
              </span>
            </div>
            <ul className="an-watchlist">
              {watch.map((w) => (
                <li key={w.id}>
                  <DragIcon />
                  <span className="an-watch-name">{w.name}</span>
                  <span className="an-watch-price">{fmtAmount(w.price)}</span>
                  <span className={`an-watch-chg ${w.change >= 0 ? 'up' : 'down'}`}>
                    <span><TriangleIcon size={12} color={w.change >= 0 ? '#5f854c' : '#c94c40'} down={w.change < 0} />{fmtSigned(w.change).replace('+', '')}</span>
                    <small>({fmtSignedPct(w.changePct)})</small>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="an-section-head apptour-today-currentportfolio">
          <h2 className="an-section-title">My Current Portfolio</h2>
          <SearchField value={q} onChange={setQ} className="an-search-wide" />
        </div>
        <DataTable
          rowKey={(r) => r.assetClass}
          sort={sort} onSort={onSort}
          columns={[
            { key: 'assetClass', label: 'Asset Class', width: '34%' },
            { key: 'todaysGain', label: "Today's Gain", align: 'right', render: (r) => {
              const t = todayByLabel.get(r.assetClass) ?? { gain: 0, cur: 0 };
              const prev = t.cur - t.gain;
              const pct = prev ? Math.round((t.gain / prev) * 10000) / 100 : 0;
              return <span className="an-cell-gain">{fmtAmount(t.gain)}<GainPill pct={pct} /></span>;
            } },
            { key: 'unrealisedGain', label: 'Unrealised Gain', align: 'right', render: (r) => <span className="an-cell-gain">{fmtAmount(r.unrealisedGain)}<GainPill pct={r.gainPct} /></span> },
            { key: 'currentValue', label: 'Current Value', align: 'right', render: (r) => fmtAmount(r.currentValue) },
          ]}
          rows={sorted}
          empty={<div className="an-table-empty" />}
        />

        <Card className="an-ca-card">
          <h3 className="an-ca-title">Corporate Actions</h3>
          {actions.length === 0 ? (
            <EmptyState art={<CorpArt />} title="No corporate actions yet" text="Recent and upcoming corporate actions for your current stocks will appear here" />
          ) : (
            <ul className="an-ca-list">
              {actions.map((a) => (
                <li key={a.id}><CheckCircleIcon /><div><div className="an-ca-stock">{a.stockName}</div><div className="an-ca-meta">{a.type} · Ex-date {fmtDate(a.exDate)} · {a.action}</div></div><span className={`an-chip ${a.applied ? 'ok' : ''}`}>{a.applied ? 'Applied' : 'Upcoming'}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function eqTodayPct(rows: { assetClassCode: string; todaysGain: number; currentValue: number }[]): number {
  const eq = rows.filter((r) => r.assetClassCode === 'EQ');
  const gain = eq.reduce((t, r) => t + r.todaysGain, 0);
  const prev = eq.reduce((t, r) => t + r.currentValue, 0) - gain;
  return prev ? Math.round((gain / prev) * 10000) / 100 : 0;
}

// Mirrors the mock API's asset-class label mapping (kept tiny; the table only needs the join key).
const LABELS: Record<string, string> = { EQ: 'Stocks & ETFs', MFEQ: 'Mutual Funds (Equity)', MFDT: 'Mutual Funds (Debt)', SIF: 'SIF', BNK: 'Banks', ULP: 'NPS / ULIP', INS: 'Insurance', PE: 'Private Equity', FD: 'FDs', BND: 'Traded Bonds', NCD: 'NCD/Debentures', CD: 'Deposits/Loans', PPF: 'PPF/EPF', PO: 'Post Office', GLD: 'Gold', SLV: 'Silver', JWL: 'Jewellery', PR: 'Property', ART: 'Art', AIF: 'AIF', LN: 'Loans' };
const labelForCode = (c: string) => LABELS[c] ?? c;

function MoverList({ title, items }: { title: string; items: { name: string; price: number; change: number; changePct: number }[] }) {
  return (
    <div className="an-mover-list">
      <h4>{title}</h4>
      {items.length === 0 && <p className="an-muted">None today</p>}
      <ul>
        {items.map((m) => (
          <li key={m.name}><span className="an-watch-name">{m.name}</span><span className="an-watch-price">{fmtAmount(m.price)}</span><span className={`an-watch-chg ${m.change >= 0 ? 'up' : 'down'}`}><span><TriangleIcon size={12} color={m.change >= 0 ? '#5f854c' : '#c94c40'} down={m.change < 0} />{fmtSigned(m.change).replace('+', '')}</span><small>({fmtSignedPct(m.changePct)})</small></span></li>
        ))}
      </ul>
    </div>
  );
}

// ---- Illustrations (white-label replacements for the live static SVGs) --------------------------
function HeroArt() {
  return (
    <svg className="an-hero-art" width="105" height="119" viewBox="0 0 105 119" fill="none" opacity="0.4">
      <path d="M10 92c12-22 34-30 60-24l18 5c6 2 8 8 4 12l-2 2H50" stroke="#64677a" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 96c14 8 30 12 46 10l30-6" stroke="#64677a" strokeWidth="3" strokeLinecap="round" />
      <rect x="22" y="38" width="30" height="22" rx="3" stroke="#5f854c" strokeWidth="2.5" />
      <path d="M27 54l7-8 6 5 9-11" stroke="#5f854c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 40l14-12 14 12v18H62V40Z" stroke="#64677a" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="72" y="48" width="8" height="10" fill="#64677a" />
    </svg>
  );
}

function MoversArt() {
  return (
    <svg width="220" height="170" viewBox="0 0 220 170" fill="none">
      <ellipse cx="118" cy="90" rx="88" ry="70" fill="#eaf4df" />
      <g><rect x="24" y="36" width="96" height="34" rx="4" fill="#fff" stroke="#c8ccd6" /><circle cx="42" cy="53" r="8" fill="#5f854c" /><path d="M38 53l4 4 5-7" stroke="#fff" strokeWidth="1.6" /><path d="M58 58l10-10 8 6 12-12 10 6" stroke="#64677a" strokeWidth="1.5" /><rect x="58" y="63" width="40" height="2" fill="#c8ccd6" /></g>
      <g><rect x="78" y="80" width="96" height="34" rx="4" fill="#fff" stroke="#c8ccd6" /><circle cx="96" cy="97" r="8" fill="#5f854c" /><path d="M92 97l4 4 5-7" stroke="#fff" strokeWidth="1.6" /><path d="M112 104l10-10 8 6 12-12 10 6" stroke="#64677a" strokeWidth="1.5" /><rect x="112" y="107" width="40" height="2" fill="#c8ccd6" /></g>
      <g><rect x="34" y="124" width="96" height="34" rx="4" fill="#fff" stroke="#c8ccd6" /><circle cx="52" cy="141" r="8" fill="#5f854c" /><path d="M48 141l4 4 5-7" stroke="#fff" strokeWidth="1.6" /><path d="M68 148l10-10 8 6 12-12 10 6" stroke="#64677a" strokeWidth="1.5" /><rect x="68" y="151" width="40" height="2" fill="#c8ccd6" /></g>
    </svg>
  );
}

function CorpArt() {
  return (
    <svg width="220" height="120" viewBox="0 0 220 120" fill="none">
      <rect x="60" y="10" width="128" height="34" rx="4" fill="#fff" stroke="#c8ccd6" />
      <circle cx="80" cy="27" r="9" fill="#5f854c" /><path d="M76 27l3 3 6-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="98" y="21" width="60" height="4" rx="2" fill="#a3c293" /><rect x="98" y="30" width="44" height="4" rx="2" fill="#dfe3ea" />
      <rect x="60" y="56" width="128" height="34" rx="4" fill="#eaf4df" />
      <rect x="10" y="64" width="128" height="34" rx="4" fill="#fff" stroke="#c8ccd6" />
      <circle cx="30" cy="81" r="9" fill="#5f854c" /><path d="M26 81l3 3 6-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="48" y="75" width="60" height="4" rx="2" fill="#a3c293" /><rect x="48" y="84" width="44" height="4" rx="2" fill="#dfe3ea" />
    </svg>
  );
}
