import { useEffect, useMemo, useState } from 'react';
import type { AssetAllocation } from '@mprofit/shared';
import { fmtAmount, fmtDateTime, fmtPct } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { Caret, Dropdown } from '../components/Dropdown';

const PALETTE = ['#4fc3f7', '#ffb74d', '#81c784', '#e57373', '#ba68c8', '#fff176', '#90a4ae', '#f06292', '#7986cb', '#a1887f'];

// Tools → Dashboard: navy full-screen Asset Allocation (01-dashboard/10-tools-dashboard.png)
export function DashboardSheet({ onClose }: { onClose: () => void }) {
  const { family, families, portfolios, portfolio, selectFamily } = useWorkspace();
  const [view, setView] = useState<'asset' | 'portfolio'>('asset');
  const [data, setData] = useState<AssetAllocation | null>(null);
  const [tick, setTick] = useState(0);
  const group = useMemo(() => portfolios.find((p) => p.isGroup) ?? portfolio, [portfolios, portfolio]);

  useEffect(() => { if (group) void classicApi.assetAllocation(group.id).then(setData); }, [group, tick]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows = data?.rows ?? [];
  const gradient = rows.length ? `conic-gradient(${rows.map((_r, i) => `${PALETTE[i % PALETTE.length]} 0 ${rows.slice(0, i + 1).reduce((t, x) => t + x.holdingPct, 0)}%`).join(', ')})` : '#0b3560';

  return (
    <div className="dash-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dash" role="dialog" aria-modal="true">
      <button type="button" className="modal-close dark-x" style={{ color: '#fff', right: 16, top: 8 }} aria-label="Close" onClick={onClose}><span className="material-icons">close</span></button>
      <div className="dash-header">
        <div>
          <div className="total-lbl" style={{ fontSize: 11 }}>Family</div>
          <Dropdown trigger={() => <button type="button" className="switch-tab" style={{ background: '#fff', color: 'var(--navy)', border: 0, height: 30, fontSize: 18, fontWeight: 600 }}>{family?.name}<Caret /></button>}
            entries={families.map((f) => ({ type: 'item' as const, label: f.name, onSelect: () => selectFamily(f.id) }))} />
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="dash-title">Asset Allocation <span className="dash-asof">as on {data ? fmtDateTime(data.asOn) : ''}</span></div>
          <div className="dash-sub">Family: {family?.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div className="dash-switch">
            <button type="button" className={`switch-tab ${view === 'asset' ? 'active' : ''}`} style={{ background: view === 'asset' ? '#fff' : 'transparent', color: view === 'asset' ? 'var(--navy)' : '#fff', border: '1px solid #fff' }} onClick={() => setView('asset')}>Asset-wise</button>
            <button type="button" className={`switch-tab ${view === 'portfolio' ? 'active' : ''}`} style={{ background: view === 'portfolio' ? '#fff' : 'transparent', color: view === 'portfolio' ? 'var(--navy)' : '#fff', border: '1px solid #fff' }} onClick={() => setView('portfolio')}>Portfolio-wise</button>
          </div>
          <div className="dash-switch dash-tools" style={{ marginLeft: 0 }}>
            <span className="material-icons" role="button" aria-label="Print" onClick={() => window.print()}>print</span>
            <span className="material-icons" role="button" aria-label="Refresh" onClick={() => setTick((t) => t + 1)}>refresh</span>
          </div>
        </div>
      </div>
      <div className="dash-main">
        <div className="dash-chart">
          {rows.length > 0 && <div className="donut" style={{ background: gradient }} />}
          {rows.length > 0 && (
            <ul className="donut-legend">{rows.map((r, i) => <li key={r.assetClass}><i style={{ background: PALETTE[i % PALETTE.length] }} />{r.assetClass} — {fmtPct(r.holdingPct)}</li>)}</ul>
          )}
        </div>
        <div className="total-summary">
          <div className="total-item"><div className="total-lbl">Current Value</div><div className="total-value">₹ {fmtAmount(data?.currentValue ?? 0)}</div></div>
          <div className="total-item"><div className="total-lbl">Amount Invested</div><div className="total-value">₹ {fmtAmount(data?.amtInvested ?? 0)}</div></div>
          <div className="total-item"><div className="total-lbl">Unrealised Gain</div><div className="total-value">₹ {fmtAmount(data?.unrealisedGain ?? 0)}</div></div>
          <div className="total-item"><div className="total-lbl">Unrealised Gain %</div><div className="total-value">{data?.unrealisedGainPct == null ? '' : fmtPct(data.unrealisedGainPct)}</div></div>
        </div>
      </div>
      <table className="dash-table">
        <thead><tr><th>{view === 'asset' ? 'Asset Class' : 'Portfolio'}</th><th>Amt. Invested</th><th>Unrealised Gain</th><th>Gain %</th><th>Current Value</th><th>Holding</th></tr></thead>
        <tbody>
          {view === 'asset' ? rows.map((r) => (
            <tr key={r.assetClass}><td>{r.assetClass}</td><td>{fmtAmount(r.amtInvested)}</td><td>{fmtAmount(r.unrealisedGain)}</td><td>{fmtPct(r.gainPct)}</td><td>{fmtAmount(r.currentValue)}</td><td>{fmtPct(r.holdingPct)}</td></tr>
          )) : portfolios.filter((p) => !p.isGroup).map((p) => <PortfolioRow key={p.id} id={p.id} name={p.shortName} total={data?.currentValue ?? 0} />)}
          <tr className="total-row"><td>Total</td><td>{fmtAmount(data?.amtInvested ?? 0)}</td><td>{fmtAmount(data?.unrealisedGain ?? 0)}</td><td>{data?.unrealisedGainPct == null ? '' : fmtPct(data.unrealisedGainPct)}</td><td>{fmtAmount(data?.currentValue ?? 0)}</td><td>100.00%</td></tr>
        </tbody>
      </table>
    </div>
    </div>
  );
}

function PortfolioRow({ id, name, total }: { id: string; name: string; total: number }) {
  const [a, setA] = useState<AssetAllocation | null>(null);
  useEffect(() => { void classicApi.assetAllocation(id).then(setA); }, [id]);
  if (!a) return <tr><td>{name}</td><td colSpan={5} /></tr>;
  return <tr><td>{name}</td><td>{fmtAmount(a.amtInvested)}</td><td>{fmtAmount(a.unrealisedGain)}</td><td>{a.unrealisedGainPct == null ? '' : fmtPct(a.unrealisedGainPct)}</td><td>{fmtAmount(a.currentValue)}</td><td>{fmtPct(total ? (a.currentValue / total) * 100 : 0)}</td></tr>;
}
