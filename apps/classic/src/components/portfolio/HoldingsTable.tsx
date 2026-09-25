import { useMemo, useState } from 'react';
import { fmtAmount, fmtSignedPct } from '@mprofit/shared';
import type { HoldingRow } from '@mprofit/shared';
import { useOverlay } from '../../state/OverlayContext';
import { useWorkspace } from '../../state/WorkspaceContext';
import { Caret } from '../Dropdown';

type SortKey = 'name' | 'qty' | 'amtInvested' | 'currentPrice' | 'todaysGain' | 'unrealisedGain' | 'currentValue';

interface Props { externalQuery: string }

// Holdings grid: header (50px) → rows (50px) → NET WORTH footer (50px). Column widths fixed via <colgroup>.
export function HoldingsTable({ externalQuery }: Props) {
  const { summary, summaryLoading, mode, activeAssetCode, family, portfolio, preferences, assetClasses } = useWorkspace();
  const { open } = useOverlay();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'name', dir: 1 });
  const decimals = preferences?.decimals ?? 'Show';
  const query = (externalQuery || q).toLowerCase();

  const rows = useMemo(() => {
    const all = summary?.rows ?? [];
    const filtered = all.filter((r) => r.assetClassCode === activeAssetCode && (!query || r.name.toLowerCase().includes(query)))
      .filter((r) => preferences?.zeroHoldings === 'Show' || r.qty !== 0);
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      const cmp = typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv);
      return cmp * sort.dir;
    });
  }, [summary, activeAssetCode, query, sort, preferences]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  const totals = summary?.totals;
  const isFo = mode === 'FO';
  const activeLabel = assetClasses.find((a) => a.code === activeAssetCode)?.label ?? '';

  // Empty state escalates with what the tenant is missing: family → portfolio → transactions.
  const cta = !family ? { label: 'Add Family', onClick: () => open({ kind: 'addFamily' as const }) }
    : !portfolio || portfolio.isGroup ? { label: 'Add Portfolio', onClick: () => open({ kind: 'addPortfolio' as const, variant: 'Portfolio' as const }) }
      : { label: 'Add a transaction', onClick: () => open({ kind: 'addTransaction' as const }) };
  const emptyCta = (
    <button type="button" className="btn-add-trans" onClick={cta.onClick}>
      <span className="btn-add-trans-icon">+</span><span className="add-trans-label">{cta.label}</span>
    </button>
  );

  return (
    <div className="stocks-group">
      <table className="sum-table">
        <colgroup><col className="c-dd" /><col className="c-first" /><col className="c-sort" /><col className="c-qty" /><col className="c-inv" /><col className="c-price" /><col className="c-today" /><col className="c-unreal" /><col className="c-value" /><col className="c-end" /></colgroup>
        <thead>
          <tr className="stock-heading">
            <td className="col-dropdown"><i className="fas fa-minus-circle" /></td>
            <td className="col-first">
              <div className="asset-search-container">
                <input className="asset-search-box" placeholder={isFo ? 'Search Instruments' : 'Search Assets'} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search assets" />
              </div>
            </td>
            <td className="sort-arrows"><span className="sort-arrow-both" onClick={() => toggleSort('name')}>▲<br />▼</span></td>
            <td><p onClick={() => toggleSort('qty')}>Qty.</p><p className="text-blue">{isFo ? 'Cost/unit' : 'Avg. Pur. Price'}</p></td>
            {isFo ? (
              <>
                <td><p>Current</p><p>Price</p></td>
                <td><p>Mark to</p><p>Market</p></td>
                <td><p>Unrealised</p><p>P / L</p></td>
                <td><p>Realised</p><p>P / L</p></td>
                <td><p>Total</p><p>P / L</p></td>
              </>
            ) : (
              <>
                <td><p onClick={() => toggleSort('amtInvested')}>Amt.</p><p onClick={() => toggleSort('amtInvested')}>Invested</p></td>
                <td><p onClick={() => toggleSort('currentPrice')}>Current</p><p onClick={() => toggleSort('currentPrice')}>Price</p></td>
                <td><p onClick={() => toggleSort('todaysGain')}>Today’s</p><p onClick={() => toggleSort('todaysGain')}>Gain</p></td>
                <td><p onClick={() => toggleSort('unrealisedGain')}>Unrealised</p><p onClick={() => toggleSort('unrealisedGain')}>Gain</p></td>
                <td><p onClick={() => toggleSort('currentValue')}>Current</p><p onClick={() => toggleSort('currentValue')}>Value</p></td>
              </>
            )}
            <td />
          </tr>
        </thead>
      </table>

      <div className="sum-body-wrap">
        {summaryLoading && !summary ? <div className="blank-state">Loading…</div> : rows.length === 0 ? (
          <div>
            {/* Live puts the empty-state CTA in a 74px table row, indented past the 40px dropdown column. */}
            {!isFo && (
              <table className="sum-table">
                <colgroup><col className="c-dd" /><col className="c-first" /><col className="c-sort" /><col className="c-qty" /><col className="c-inv" /><col className="c-price" /><col className="c-today" /><col className="c-unreal" /><col className="c-value" /><col className="c-end" /></colgroup>
                <tbody>
                  <tr>
                    <td className="col-dropdown" />
                    <td className="col-first" colSpan={9}>{emptyCta}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {query && <div className="blank-state">No {activeLabel} matching “{externalQuery || q}”.</div>}
          </div>
        ) : (
          <table className="sum-table">
            <colgroup><col className="c-dd" /><col className="c-first" /><col className="c-sort" /><col className="c-qty" /><col className="c-inv" /><col className="c-price" /><col className="c-today" /><col className="c-unreal" /><col className="c-value" /><col className="c-end" /></colgroup>
            <tbody>
              {rows.map((r) => <Row key={r.id} r={r} decimals={decimals} isFo={isFo} onOpen={() => open({ kind: 'viewAllTransactions' })} />)}
            </tbody>
          </table>
        )}
      </div>

      <div className="stock-total">
        <table className="sum-table">
          <colgroup><col className="c-dd" /><col className="c-first" /><col className="c-sort" /><col className="c-qty" /><col className="c-inv" /><col className="c-price" /><col className="c-today" /><col className="c-unreal" /><col className="c-value" /><col className="c-end" /></colgroup>
          <tbody>
            {isFo ? (
              <>
                <tr style={{ height: 25 }}><td /><td className="col-first" colSpan={2}><span className="nw-label" style={{ fontSize: 12, fontWeight: 400 }}>Less Total Charges (GST, STT, others)</span></td><td colSpan={6} /><td /></tr>
                <tr style={{ height: 25 }}><td /><td className="col-first" colSpan={2}><span className="nw-label" style={{ fontSize: 14 }}>Total Profit / Loss</span></td><td colSpan={6} /><td /></tr>
              </>
            ) : (
              <tr style={{ height: 50 }}>
                <td />
                <td className="col-first" colSpan={2}><p className="bottam-bold">NET WORTH<span className="qcircle" title="Net worth of holdings shown across all asset classes in this view">i</span></p></td>
                <td />
                <td>{totals ? fmtAmount(totals.amtInvested, decimals) : '0.00'}</td>
                <td />
                <td>
                  <span className={`stacked ${totals && totals.todaysGain < 0 ? 'gain-neg' : totals && totals.todaysGain > 0 ? 'gain-pos' : ''}`}>
                    <span className="top">{totals ? fmtAmount(totals.todaysGain, decimals) : '0.00'}</span>
                    <span className="bottom">{totals ? fmtSignedPct(totals.todaysGainPct).replace('+', '') : '0.00%'}</span>
                  </span>
                </td>
                <td className={totals && totals.unrealisedGain < 0 ? 'gain-neg' : totals && totals.unrealisedGain > 0 ? 'gain-pos' : ''}>{totals ? fmtAmount(totals.unrealisedGain, decimals) : '0.00'}</td>
                <td>{totals ? fmtAmount(totals.currentValue, decimals) : '0.00'}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ r, decimals, isFo, onOpen }: { r: HoldingRow; decimals: 'Show' | 'Hide'; isFo: boolean; onOpen: () => void }) {
  const gainCls = (n: number) => (n > 0 ? 'gain-pos' : n < 0 ? 'gain-neg' : '');
  return (
    <tr className="stock-row" onClick={onOpen}>
      <td className="col-dropdown"><Caret /></td>
      <td className="col-first" title={r.name}>{r.name}</td>
      <td />
      <td><p>{r.qty.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</p><p className="s-margin">{fmtAmount(r.avgPrice, decimals)}</p></td>
      {isFo ? (
        <>
          <td>{fmtAmount(r.currentPrice, decimals)}</td>
          <td>{fmtAmount(r.currentValue, decimals)}</td>
          <td className={gainCls(r.unrealisedGain)}>{fmtAmount(r.unrealisedGain, decimals)}</td>
          <td>0.00</td>
          <td className={gainCls(r.unrealisedGain)}>{fmtAmount(r.unrealisedGain, decimals)}</td>
        </>
      ) : (
        <>
          <td>{fmtAmount(r.amtInvested, decimals)}</td>
          <td>{fmtAmount(r.currentPrice, decimals)}</td>
          <td className={gainCls(r.todaysGain)}><p>{fmtAmount(r.todaysGain, decimals)}</p><p className="s-margin">{fmtSignedPct(r.todaysGainPct).replace('+', '')}</p></td>
          <td className={gainCls(r.unrealisedGain)}><p>{fmtAmount(r.unrealisedGain, decimals)}</p><p className="s-margin">{fmtSignedPct(r.unrealisedGainPct).replace('+', '')}</p></td>
          <td>{fmtAmount(r.currentValue, decimals)}</td>
        </>
      )}
      <td />
    </tr>
  );
}
