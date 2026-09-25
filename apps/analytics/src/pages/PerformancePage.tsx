import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { fmtAmount, fmtDate, fmtDateTime, fmtPct, fmtRupee } from '@mprofit/shared';
import type { PerformanceBreakdown, PerformanceRow, PerformanceSnapshot } from '@mprofit/shared';
import { analyticsApi, type BenchmarksResponse } from '../api/analyticsApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { useOverlay, type Period } from '../state/OverlayContext';
import { DashboardTabs } from '../components/shell/Shell';
import { Card, ChevronSmall, DataTable, EmptyState, GainPill, Menu, SearchField, ToggleGroup, useSort } from '../components/ui/Primitives';
import { CalendarIcon, DownloadIcon, EyeIcon, InfoIcon, SackIcon, WalletIcon } from '../components/ui/Icons';
import { CompareBars, IndexCagrBars, XirrGauge } from '../components/charts/Charts';

const ALL_TO_DATE: Period = { kind: 'All to Date', label: 'All to Date' };

// Live: /portfolio/performance — snapshot, index CAGR, XIRR comparison, by-category / by-asset-class tables, advanced insights.
export function PerformancePage() {
  const { ctx, indices } = useWorkspace();
  const { open } = useOverlay();
  const [snap, setSnap] = useState<PerformanceSnapshot | null>(null);
  const [breakdown, setBreakdown] = useState<PerformanceBreakdown | null>(null);
  const [bench, setBench] = useState<BenchmarksResponse | null>(null);
  const [period, setPeriod] = useState<Period>(ALL_TO_DATE);
  // Live gates heavy XIRR computations behind "View Chart" / "View Table" / "Calculate" CTAs (blurred sample underneath).
  const [revealed, setRevealed] = useState<{ compare: boolean; category: boolean; assetClass: boolean; advanced: boolean }>({ compare: false, category: false, assetClass: false, advanced: false });
  const [refreshedAt, setRefreshedAt] = useState(new Date().toISOString());

  useEffect(() => {
    setSnap(null); setBreakdown(null); setRevealed({ compare: false, category: false, assetClass: false, advanced: false });
    void analyticsApi.performance(ctx.portfolioId).then(setSnap);
  }, [ctx.portfolioId]);
  useEffect(() => { void analyticsApi.benchmarks().then(setBench); }, []);
  const loadBreakdown = () => { void analyticsApi.performanceBreakdown(ctx.portfolioId).then((b) => { setBreakdown(b); setRefreshedAt(new Date().toISOString()); }); };
  const reveal = (k: keyof typeof revealed) => { setRevealed((r) => ({ ...r, [k]: true })); if ((k === 'category' || k === 'assetClass') && !breakdown) loadBreakdown(); };

  const selectedBench = bench?.benchmarks.find((b) => b.code === bench.selected) ?? null;
  const pickPeriod = () => open({ kind: 'periodPicker', value: period, onPick: setPeriod });

  return (
    <>
      <DashboardTabs right={(
        <span className="an-period">
          <span className="an-viewby-label">Period</span>
          <button type="button" className="an-outline-select" onClick={pickPeriod}>{period.label}<ChevronSmall /></button>
        </span>
      )} />
      <div className="an-content performanceContainer">
        <div className="an-section-head">
          <h2 className="an-section-title">Performance Snapshot</h2>
          <Menu align="right" trigger={() => <button type="button" className="an-outline-select an-outline-select-sm"><DownloadIcon size={24} />Download<ChevronSmall /></button>} items={[{ label: 'Snapshot' }, { label: 'Performance Report' }]} />
        </div>

        <div className="an-perf-grid">
          <Card className="an-snapshot-card">
            <div className="an-snapshot-left">
              <div className="an-xirr-card">
                <p className="an-xirr-value">{snap?.xirr === null || snap?.xirr === undefined ? 'N/A' : fmtPct(snap.xirr)}</p>
                <span className="an-xirr-title">XIRR</span>
                <span className="an-xirr-period">{period.label}</span>
                <XirrGauge xirr={snap?.xirr ?? null} />
              </div>
              <div className="an-total-gain">
                <span className="an-mini-label">Total Gain <InfoIcon /></span>
                <span className="an-mini-value">{snap ? fmtRupee(snap.totalGain) : ''}</span>
                {snap && snap.totalInvestment > 0 && <GainPill pct={(snap.totalGain / snap.totalInvestment) * 100} />}
              </div>
            </div>
            <div className="an-snapshot-right">
              <div className="an-fact-card">
                <div className="an-fact"><span className="an-sq-icon an-sq-icon-lg"><CalendarIcon /></span><span className="an-fact-label">First Transaction Date</span></div>
                <span className="an-fact-value">{snap?.firstTransactionDate ? fmtDate(snap.firstTransactionDate) : 'N/A'}</span>
                <hr />
                <div className="an-fact"><span className="an-sq-icon an-sq-icon-lg"><WalletIcon /></span><span className="an-fact-label">Current Valuation</span></div>
                <span className="an-fact-value">{snap ? fmtRupee(snap.currentValuation) : ''}</span>
              </div>
              <div className="an-fact-card an-fact-card-outline">
                <div className="an-fact-row"><div><span className="an-mini-label">Total Investment</span><span className="an-fact-value an-fact-value-sm">{snap ? fmtRupee(snap.totalInvestment) : ''}</span></div><SackIcon size={28} /></div>
                <hr />
                <div className="an-fact-row"><div><span className="an-mini-label">Total Withdrawal</span><span className="an-fact-value an-fact-value-sm">{snap ? fmtRupee(snap.totalWithdrawal) : ''}</span></div><SackIcon size={28} /></div>
              </div>
            </div>
            <hr className="an-snapshot-hr" />
            <div className="an-pl-row">
              <div><span className="an-fact-label">Realised P&amp;L</span><span className="an-pl-value">{snap ? fmtRupee(snap.realisedPl) : ''}</span></div>
              <span className="an-vr" />
              <div><span className="an-fact-label">Unrealised P&amp;L</span><span className="an-pl-value">{snap ? fmtRupee(snap.unrealisedPl) : ''}</span></div>
              <span className="an-vr" />
              <div><span className="an-fact-label">Total Income</span><span className="an-pl-value">{snap ? fmtRupee(snap.totalIncome) : ''}</span></div>
            </div>
          </Card>

          <Card className="an-cagr-card apptour-performance-indiceschart">
            <div className="an-card-head-row an-card-head-row-tight">
              <div className="an-card-head-text">
                <h3>My XIRR vs. Index CAGR <InfoIcon /></h3>
                <p className="an-asof">{period.label}</p>
              </div>
              <button type="button" className="an-outline-select" onClick={() => open({ kind: 'changeIndices' })}>Change Indices<ChevronSmall /></button>
            </div>
            <IndexCagrBars portfolioXirr={snap?.xirr ?? null} indices={indices.map((i) => ({ name: i.name, cagr: cagrFor(i.code, i.changePct) }))} />
          </Card>
        </div>

        <Card className="an-compare-card">
          <div className="an-card-head-row an-card-head-row-tight">
            <div className="an-card-head-text">
              <h3 className="an-h22">XIRR Comparison</h3>
              <p className="an-desc">This chart shows how your XIRR compares against equivalent cashflows in the index <InfoIcon /></p>
            </div>
            <button type="button" className="an-outline-select" onClick={() => open({ kind: 'changeBenchmark' })}>Change Benchmark<ChevronSmall /></button>
          </div>
          <Gate revealed={revealed.compare} title="Compare your XIRR against the Index" cta="View Chart" onReveal={() => reveal('compare')}>
            <CompareBars rows={[
              { label: 'My XIRR', value: snap?.xirr ?? null, color: '#5f854c' },
              { label: `Benchmark XIRR`, value: selectedBench?.cagr ?? snap?.benchmark.cagr ?? null, color: '#12131a' },
            ]} />
          </Gate>
        </Card>

        <BreakdownSection title="Performance by Category" first="Category" rows={breakdown?.byCategory ?? null} revealed={revealed.category} onReveal={() => reveal('category')} refreshedAt={refreshedAt} onRefresh={loadBreakdown}
          gateTitle="View XIRR by Category" gateText="Get a detailed view of your annualized return for each category along with key performance metrics including total gain and income earned." />
        <BreakdownSection title="Performance by Asset Class" first="Asset Class" rows={breakdown?.byAssetClass ?? null} revealed={revealed.assetClass} onReveal={() => reveal('assetClass')} refreshedAt={refreshedAt} onRefresh={loadBreakdown}
          gateTitle="View XIRR by Asset Class" gateText="Get a detailed view of your annualized return for each asset class along with key performance metrics including total gain and income earned." />

        <AdvancedInsights xirr={snap?.xirr ?? null} benchmark={selectedBench?.name ?? snap?.benchmark.name ?? ''} revealed={revealed.advanced} onReveal={() => reveal('advanced')} />
      </div>
    </>
  );
}

// Live shows a blurred sample behind a centred CTA until the user asks for the (expensive) calculation.
function Gate({ revealed, title, text, cta, onReveal, children }: { revealed: boolean; title: string; text?: string; cta: string; onReveal: () => void; children: ReactNode }) {
  if (revealed) return <>{children}</>;
  return (
    <div className="an-gate">
      <div className="an-gate-sample" aria-hidden="true">{children}</div>
      <div className="an-gate-overlay">
        <GateArt />
        <h4>{title}</h4>
        {text && <p>{text}</p>}
        <button type="button" className="an-btn-dark" onClick={onReveal}><EyeIcon size={20} />{cta}</button>
      </div>
    </div>
  );
}

function GateArt() {
  return (
    <svg className="an-gate-art" width="233" height="101" viewBox="0 0 233 101" fill="none">
      <rect x="62" y="0" width="98" height="30" rx="3" fill="#fff" stroke="#c3dcbc" />
      <circle cx="78" cy="15" r="8" fill="#5f854c" /><path d="M92 20l10-8 8 5 12-9 12 4 14-8" stroke="#5f854c" strokeWidth="1.5" fill="none" /><rect x="92" y="24" width="60" height="2" fill="#c3dcbc" />
      <rect x="0" y="42" width="98" height="30" rx="3" fill="#fff" stroke="#c3dcbc" />
      <circle cx="16" cy="57" r="8" fill="#5f854c" /><path d="M30 62l10-8 8 5 12-9 12 4 14-8" stroke="#5f854c" strokeWidth="1.5" fill="none" /><rect x="30" y="66" width="60" height="2" fill="#c3dcbc" />
    </svg>
  );
}

function BreakdownSection({ title, first, rows, revealed, onReveal, refreshedAt, onRefresh, gateTitle, gateText }: {
  title: string; first: string; rows: PerformanceRow[] | null; revealed: boolean; onReveal: () => void; refreshedAt: string; onRefresh: () => void; gateTitle: string; gateText: string;
}) {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'Summary' | 'Details'>('Details');
  const data = useMemo(() => (rows ?? SAMPLE_ROWS).filter((r) => r.name.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const { sort, onSort, sorted } = useSort(data, { key: 'closingValuation', dir: 'desc' });
  const detail = mode === 'Details';
  return (
    <>
      <div className="an-section-head an-section-head-gap">
        <h2 className="an-section-title">{title}</h2>
        <span className="an-section-tools">
          <SearchField value={q} onChange={setQ} className="an-search-md" />
          <ToggleGroup options={['Summary', 'Details']} value={mode} onChange={setMode} />
        </span>
      </div>
      <Card className="an-table-card an-table-card-flush">
        <Gate revealed={revealed} title={gateTitle} text={gateText} cta="View Table" onReveal={onReveal}>
          <DataTable
            rowKey={(r) => r.name}
            sort={sort} onSort={onSort}
            columns={[
              { key: 'name', label: first, width: detail ? '11%' : '30%' },
              { key: 'closingValuation', label: 'CLOSING VALUATION', align: 'right', render: (r) => fmtAmount(r.closingValuation) },
              { key: 'xirr', label: 'XIRR', align: 'right', sortable: false, render: (r) => (r.xirr === null ? 'N/A' : fmtPct(r.xirr)) },
              ...(detail ? [
                { key: 'totalInvestment', label: 'TOTAL INVESTMENT', align: 'right' as const, render: (r: PerformanceRow) => fmtAmount(r.totalInvestment) },
                { key: 'totalWithdrawal', label: 'TOTAL WITHDRAWAL', align: 'right' as const, render: (r: PerformanceRow) => fmtAmount(r.totalWithdrawal) },
              ] : []),
              { key: 'totalGain', label: 'TOTAL GAIN', align: 'right', render: (r) => fmtAmount(r.totalGain) },
              ...(detail ? [
                { key: 'realisedGain', label: 'REALISED GAIN', align: 'right' as const, render: (r: PerformanceRow) => <span className="an-cell-gain">{fmtAmount(r.realisedGain)}<GainPill pct={r.realisedGain >= 0 ? 0 : -1} /></span> },
                { key: 'unrealisedGain', label: 'UNREALISED GAIN', align: 'right' as const, render: (r: PerformanceRow) => <span className="an-cell-gain">{fmtAmount(r.unrealisedGain)}<GainPill pct={r.totalInvestment ? (r.unrealisedGain / r.totalInvestment) * 100 : 0} /></span> },
              ] : []),
              { key: 'totalIncome', label: 'Total Income', align: 'right', render: (r) => fmtAmount(r.totalIncome) },
            ]}
            rows={sorted}
            empty={<EmptyState title="No data available" text="There is no data to display at this time." />}
          />
          {revealed && (
            <div className="an-refresh-row">
              <button type="button" className="an-refresh-btn" aria-label="Refresh" onClick={onRefresh}><RefreshIcon /></button>
              <span>Last refreshed <b>{fmtDateTime(refreshedAt)}</b></span>
            </div>
          )}
        </Gate>
      </Card>
    </>
  );
}

function RefreshIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5f6f57" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 1 0 -2.34 5.66M20 4v7h-7" />
    </svg>
  );
}

function AdvancedInsights({ xirr, benchmark, revealed, onReveal }: { xirr: number | null; benchmark: string; revealed: boolean; onReveal: () => void }) {
  const [mode, setMode] = useState<'Historical' | 'FY-wise'>('Historical');
  const periods = mode === 'Historical' ? ['All to Date', '1 Year', '2 Years', '3 Years', '5 Years'] : ['FY 22-23', 'FY 23-24', 'FY 24-25', 'FY 25-26', 'FY 26-27'];
  // Illustrative per-period series derived from the all-to-date XIRR (backend will supply real values).
  const mine = periods.map((_, i) => (xirr === null ? null : Math.round((xirr + (i % 2 ? -1.8 : 1.2) * i) * 100) / 100));
  const idx = periods.map((_, i) => (xirr === null ? null : Math.round((12.4 + (i % 2 ? 1.1 : -0.7) * i) * 100) / 100));
  return (
    <Card className="an-adv-card apptour-performance-advancedchart">
      <div className="an-card-head-row an-card-head-row-tight">
        <h3 className="an-h22">Advanced Performance Insights</h3>
        <ToggleGroup options={['Historical', 'FY-wise']} value={mode} onChange={setMode} variant="dark" />
      </div>
      <Gate revealed={revealed} title="View your historical XIRR performance" text="Track your annualized return across different time periods. You can view both historical (1 yr, 2 yr, 3 yr) XIRR and financial year-wise XIRR." cta="Calculate" onReveal={onReveal}>
        <GroupedBars periods={periods} mine={mine} idx={idx} />
      </Gate>
      <hr className="an-adv-hr" />
      <div className="an-adv-legend">
        <span className="an-legend-item"><span className="an-legend-dot" style={{ background: '#ffb598' }} />My Stocks &amp; Mutual Funds</span>
        <button type="button" className="an-outline-select an-outline-select-sm"><span className="an-legend-dot" style={{ background: '#b1dbff' }} />{benchmark}<ChevronSmall /></button>
      </div>
      <p className="an-note">Please note: XIRR is available from the starting date of your investment. For example, if you started your first investment 3 years ago, you will view your All to Date, 1 year and 2 year XIRR.</p>
    </Card>
  );
}

// Grouped column chart (My XIRR vs benchmark) for the Advanced Performance Insights card.
function GroupedBars({ periods, mine, idx }: { periods: string[]; mine: (number | null)[]; idx: (number | null)[] }) {
  const W = 919; const H = 400; const top = 20; const bottom = 60; const left = 60;
  const vals = [...mine, ...idx].filter((v): v is number => v !== null);
  const max = Math.max(40, ...vals.map((v) => Math.abs(v)));
  const ticks = [-20, -5, 10, 25, 40].map((t) => (t / 40) * max);
  const y = (v: number) => top + ((max - v) / (2 * max)) * (H - top - bottom);
  const step = (W - left) / periods.length;
  return (
    <svg className="an-grouped" viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      {ticks.map((t) => <g key={t}><line x1={left} x2={W} y1={y(t)} y2={y(t)} stroke="#ebecf2" /><text x={left - 10} y={y(t) + 4} textAnchor="end" fontSize="13" fill="#64677a">{Math.round(t)}%</text></g>)}
      {periods.map((p, i) => {
        const cx = left + step * i + step / 2; const m = mine[i]; const b = idx[i];
        return (
          <g key={p}>
            {m !== null && <rect x={cx - 34} y={Math.min(y(0), y(m))} width={28} height={Math.abs(y(m) - y(0))} rx={4} fill="#ffb598" />}
            {b !== null && <rect x={cx + 6} y={Math.min(y(0), y(b))} width={28} height={Math.abs(y(b) - y(0))} rx={4} fill="#b1dbff" />}
            <text x={cx} y={H - 30} textAnchor="middle" fontSize="14" fill="#64677a">{p}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Illustrative CAGR per index (backend will supply). Keeps the demo chart populated from live index changes.
const cagrFor = (code: string, changePct: number) => Math.round((11 + (code.length % 5) * 1.3 + changePct) * 100) / 100;

// Sample rows rendered blurred under the "View Table" gate (same values live shows in its placeholder).
const SAMPLE_ROWS: PerformanceRow[] = ['Stocks', 'Mutual Funds', 'Property', 'Private Equity', 'FDs', 'Loans'].map((name, i) => {
  const sign = i % 2 ? -1 : 1;
  return { name, closingValuation: 0, xirr: sign * 24.13, totalInvestment: 50000.47, totalWithdrawal: 37132.42, totalGain: sign * 20000.12, realisedGain: sign * 30000.11, unrealisedGain: -sign * 9999.99, totalIncome: 0 };
});
