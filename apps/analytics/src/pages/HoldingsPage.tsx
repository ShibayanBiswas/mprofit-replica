import { useEffect, useMemo, useState } from 'react';
import { fmtAmount, fmtDate, fmtRupee } from '@mprofit/shared';
import type { AssetAllocation, AssetAllocationRow } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useWorkspace, type ViewBy } from '../state/WorkspaceContext';
import { DashboardTabs } from '../components/shell/Shell';
import { Card, DataTable, EmptyState, GainPill, Menu, SearchField, SelectButton, ToggleGroup, useSort } from '../components/ui/Primitives';
import { ArrowDownRedIcon, DownloadIcon, PercentIcon, TrendIcon } from '../components/ui/Icons';
import { Donut, PieLegend } from '../components/charts/Charts';

type Basis = 'Current Value' | 'Amount Invested';

// Live: /portfolio/holding — "Portfolio Asset Allocation" donut + KPI tiles + "Current Holdings" table.
export function HoldingsPage() {
  const { ctx, summary, viewBy, setViewBy } = useWorkspace();
  const [alloc, setAlloc] = useState<AssetAllocation | null>(null);
  const [basis, setBasis] = useState<Basis>('Current Value');
  const [q, setQ] = useState('');

  useEffect(() => { setAlloc(null); void analyticsApi.assetAllocation(ctx.portfolioId).then(setAlloc); }, [ctx.portfolioId]);

  // "View by Category" folds asset classes into their category (mirrors the mock API's categoryOf map through labels).
  const rows: AssetAllocationRow[] = useMemo(() => {
    const src = alloc?.rows ?? [];
    if (viewBy === 'Asset Class') return src;
    const m = new Map<string, AssetAllocationRow>();
    for (const r of src) {
      const k = categoryForLabel(r.assetClass);
      const cur = m.get(k) ?? { assetClass: k, amtInvested: 0, unrealisedGain: 0, gainPct: 0, currentValue: 0, holdingPct: 0 };
      cur.amtInvested += r.amtInvested; cur.unrealisedGain += r.unrealisedGain; cur.currentValue += r.currentValue; cur.holdingPct += r.holdingPct;
      m.set(k, cur);
    }
    return [...m.values()].map((r) => ({ ...r, gainPct: r.amtInvested ? Math.round((r.unrealisedGain / r.amtInvested) * 10000) / 100 : 0 }));
  }, [alloc, viewBy]);

  const filtered = useMemo(() => rows.filter((r) => r.assetClass.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const { sort, onSort, sorted } = useSort(filtered, { key: 'currentValue', dir: 'desc' });
  const slices = rows.map((r) => ({ name: r.assetClass, value: basis === 'Current Value' ? r.currentValue : r.amtInvested }));
  const total = basis === 'Current Value' ? alloc?.currentValue ?? 0 : alloc?.amtInvested ?? 0;
  const asOn = fmtDate(alloc?.asOn ?? summary?.asOn ?? new Date().toISOString());
  const gainPct = alloc?.unrealisedGainPct ?? null;
  const first = viewBy === 'Category' ? 'CATEGORY' : 'ASSET CLASS';

  return (
    <>
      <DashboardTabs right={<span className="an-viewby"><span className="an-viewby-label">View by</span><ToggleGroup options={['Category', 'Asset Class'] as ViewBy[]} value={viewBy} onChange={setViewBy} /></span>} />
      <div className="an-content holdingContainer">
        <div className="an-holdings-top">
          <Card className="an-alloc-card an-alloc-card-h apptour-holding-assetallocation">
            <div className="an-card-head-row an-card-head-row-tight">
              <div className="an-card-head-text">
                <h3>Portfolio Asset Allocation <Menu align="left" className="an-inline-menu" trigger={() => <button type="button" className="an-icon-btn an-dl-btn" aria-label="Download"><DownloadIcon size={24} /></button>} items={[{ label: 'Download as PDF' }, { label: 'Download as Excel' }]} /></h3>
                <p className="an-asof">as on {asOn}</p>
              </div>
              <SelectButton className="an-basis-select" value={basis} options={['Current Value', 'Amount Invested']} onChange={(v) => setBasis(v as Basis)} />
            </div>
            <div className="an-donut-wrap"><Donut slices={slices} total={total} label={basis} size={310} /></div>
            <PieLegend slices={slices} total={total} />
          </Card>
          <div className="an-kpi-grid">
            <Card className="an-kpi">
              <span className="an-kpi-label">Amount invested</span>
              <span className="an-kpi-value">{fmtRupee(alloc?.amtInvested ?? 0)}</span>
              <span className="an-kpi-asof">as on {asOn}</span>
            </Card>
            <Card className="an-kpi an-kpi-cv">
              <span className="an-kpi-label">Current value</span>
              <span className="an-kpi-value">{fmtRupee(alloc?.currentValue ?? 0)}</span>
              <span className="an-kpi-asof">as on {asOn}</span>
              <svg className="an-kpi-art" viewBox="0 0 170 182" width="120" height="128"><circle cx="142.5" cy="42.5" r="75.5" fill="#eaf4df" /></svg>
            </Card>
            <Card className="an-kpi an-kpi-wide">
              <div className="an-ug-left">
                <span className="an-sq-icon an-sq-icon-lg"><TrendIcon size={26} /></span>
                <span className="an-kpi-value">{fmtRupee(alloc?.unrealisedGain ?? 0)}</span>
                <span className="an-kpi-label">Unrealised gain</span>
              </div>
              <div className={`an-ug-right ${gainPct !== null && gainPct < 0 ? 'down' : ''}`}>
                <div className="an-ug-right-head">
                  <span className="an-sq-icon an-sq-icon-lg an-sq-icon-dark"><PercentIcon /></span>
                  {gainPct === null ? <ArrowDownRedIcon size={30} /> : <GainPill pct={gainPct} />}
                </div>
                <span className="an-kpi-label">Unrealised gain percentage</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="an-section-head">
          <h2 className="an-section-title">Current Holdings</h2>
          <SearchField value={q} onChange={setQ} className="an-search-wide" />
        </div>
        <Card className="an-table-card">
          <DataTable
            rowKey={(r) => r.assetClass}
            sort={sort} onSort={onSort}
            columns={[
              { key: 'assetClass', label: first, width: '22%' },
              { key: 'amtInvested', label: 'AMOUNT INVESTED', align: 'right', render: (r) => fmtAmount(r.amtInvested) },
              { key: 'unrealisedGain', label: 'UNREALISED GAIN', align: 'right', render: (r) => <span className="an-cell-gain">{fmtAmount(r.unrealisedGain)}<GainPill pct={r.gainPct} /></span> },
              { key: 'currentValue', label: 'CURRENT VALUE', align: 'right', render: (r) => fmtAmount(r.currentValue) },
              { key: 'holdingPct', label: 'HOLDING', align: 'right', width: '11%', render: (r) => `${r.holdingPct.toFixed(2)}%` },
            ]}
            rows={sorted}
            empty={<EmptyState title="No data available" text="There is no data to display at this time." />}
          />
        </Card>
      </div>
    </>
  );
}

// Asset-class label → category (kept in sync with the mock API's categoryOf).
const CATEGORY: Record<string, string> = {
  'Stocks & ETFs': 'Stocks', 'Mutual Funds (Equity)': 'Mutual Funds', 'Mutual Funds (Debt)': 'Mutual Funds', SIF: 'Mutual Funds', Banks: 'Banks', 'NPS / ULIP': 'NPS / ULIP',
  Insurance: 'Insurance', 'Private Equity': 'Private Equity', FDs: 'FDs', 'Traded Bonds': 'Bonds', 'NCD/Debentures': 'Bonds', 'Deposits/Loans': 'Deposits', 'PPF/EPF': 'PPF / EPF',
  'Post Office': 'Post Office', Gold: 'Gold', Silver: 'Silver', Jewellery: 'Jewellery', Property: 'Property', Art: 'Art', AIF: 'AIF', Loans: 'Loans',
};
export const categoryForLabel = (label: string) => CATEGORY[label] ?? label;
