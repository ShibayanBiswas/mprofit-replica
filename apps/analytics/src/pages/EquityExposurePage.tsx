import { useEffect, useMemo, useState } from 'react';
import { fmtAmount, fmtDate } from '@mprofit/shared';
import type { EquityExposure, EquityExposureRow } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { Card, DataTable, EmptyState, Menu, SearchField, ToggleGroup, useSort } from '../components/ui/Primitives';
import { ArrowLeftIcon, DownloadIcon } from '../components/ui/Icons';
import { Donut, PieLegend } from '../components/charts/Charts';

type ViewBy = 'Stock' | 'Sector' | 'Market Cap';

// Live: /portfolio/equity-exposure — "← <Portfolio> / Equity Exposure" crumb, View by Stock | Sector | Market Cap,
// look-through donut card, "<View>-wise Details" table.
export function EquityExposurePage() {
  const { ctx, portfolio, goPage, summary } = useWorkspace();
  const [data, setData] = useState<EquityExposure | null>(null);
  const [viewBy, setViewBy] = useState<ViewBy>('Stock');
  const [q, setQ] = useState('');

  useEffect(() => { setData(null); void analyticsApi.equityExposure(ctx.portfolioId).then(setData); }, [ctx.portfolioId]);

  const rows: EquityExposureRow[] = useMemo(() => {
    const src = viewBy === 'Stock' ? data?.byStock : viewBy === 'Sector' ? data?.bySector : data?.byMarketCap;
    return (src ?? []).filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  }, [data, viewBy, q]);
  const { sort, onSort, sorted } = useSort(rows, { key: 'pctOfEquity', dir: 'desc' });
  const slices = rows.map((r) => ({ name: r.name, value: r.currentValue }));
  const name = portfolio ? portfolio.shortName : '';
  const first = viewBy === 'Stock' ? 'STOCK' : viewBy === 'Sector' ? 'SECTOR' : 'MARKET CAP';

  return (
    <div className="an-content equityExposureContainer">
      <div className="an-crumb-row">
        <div className="an-crumbs">
          <button type="button" className="an-icon-btn" aria-label="Back" onClick={() => goPage('today')}><ArrowLeftIcon /></button>
          <span>{name}</span>
          <span className="an-crumb-sep">/</span>
          <span className="an-crumb-current">Equity Exposure</span>
        </div>
        <span className="an-viewby"><span className="an-viewby-label">View by</span><ToggleGroup options={['Stock', 'Sector', 'Market Cap'] as ViewBy[]} value={viewBy} onChange={setViewBy} /></span>
      </div>

      <Card className="an-eq-card">
        <div className="an-card-head-row an-card-head-row-tight">
          <div className="an-card-head-text">
            <h3>Equity Exposure across Stocks, Mutual Funds and ETFs <Menu align="left" className="an-inline-menu" trigger={() => <button type="button" className="an-icon-btn an-dl-btn" aria-label="Download"><DownloadIcon size={24} /></button>} items={[{ label: 'Download as PDF' }, { label: 'Download as Excel' }]} /></h3>
            <p className="an-asof">as on {fmtDate(data?.asOn ?? summary?.asOn ?? new Date().toISOString())}</p>
          </div>
        </div>
        <div className="an-donut-wrap"><Donut slices={slices} total={data?.currentValue ?? 0} label="Current Value" size={310} /></div>
        <PieLegend slices={slices.slice(0, 10)} total={data?.currentValue ?? 0} />
      </Card>

      <div className="an-section-head">
        <h2 className="an-section-title">{viewBy}-wise Details</h2>
        <SearchField value={q} onChange={setQ} className="an-search-wide" />
      </div>
      <Card className="an-table-card">
        <DataTable
          rowKey={(r) => r.name}
          sort={sort} onSort={onSort}
          columns={[
            { key: 'name', label: first, width: '34%' },
            { key: 'currentValue', label: 'CURRENT VALUE', align: 'right', render: (r) => fmtAmount(r.currentValue) },
            { key: 'pctOfEquity', label: '% OF EQUITY EXPOSURE', align: 'right', render: (r) => `${r.pctOfEquity.toFixed(2)}%` },
            { key: 'pctOfPortfolio', label: '% OF PORTFOLIO', align: 'right', render: (r) => `${r.pctOfPortfolio.toFixed(2)}%` },
          ]}
          rows={sorted}
          empty={<div className="an-table-empty" />}
        />
        {sorted.length === 0 && <div style={{ position: 'absolute', inset: '56px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}><EmptyState title="No equity exposure" text="Add stocks, ETFs or equity mutual funds to see your look-through exposure." /></div>}
      </Card>
    </div>
  );
}
