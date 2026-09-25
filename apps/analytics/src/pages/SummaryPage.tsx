import { useEffect, useMemo, useState } from 'react';
import { fmtAmount, fmtRupee } from '@mprofit/shared';
import type { AssetClass, HoldingRow } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { useOverlay } from '../state/OverlayContext';
import { ReportStudioButton } from '../components/shell/Shell';
import { ChevronSmall, EmptyState, GainPill, Menu, SearchField, ToggleGroup } from '../components/ui/Primitives';
import { ChevronDownIcon, DocIcon, ExpandIcon, SlidersIcon, SortIcon, TriangleIcon } from '../components/ui/Icons';
import { categoryForLabel } from './HoldingsPage';

type ViewBy = 'Asset' | 'Category';
type SortKey = 'name' | 'qty' | 'amtInvested' | 'currentPrice' | 'todaysGain' | 'unrealisedGain' | 'currentValue';

// Live: /portfolio/summary — rail collapses, "<Portfolio name>" + View by Asset | Category, Actions / Preferences / Report Studio,
// grouped holdings table with Expand all, sticky "Net worth" footer.
export function SummaryPage() {
  const { summary, portfolio, preferences, goPage } = useWorkspace();
  const { open } = useOverlay();
  const [viewBy, setViewBy] = useState<ViewBy>('Asset');
  const [q, setQ] = useState('');
  const [classes, setClasses] = useState<AssetClass[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'currentValue', dir: 'desc' });

  useEffect(() => { void analyticsApi.assetClasses().then(setClasses); }, []);
  const labelFor = useMemo(() => { const m = new Map(classes.map((c) => [c.code, c.label])); return (code: string) => m.get(code) ?? code; }, [classes]);

  const rows = useMemo(() => {
    const src = (summary?.rows ?? []).filter((r) => (preferences?.zeroValues ?? true) || r.currentValue !== 0);
    return src.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  }, [summary, q, preferences]);

  const groups = useMemo(() => {
    const m = new Map<string, HoldingRow[]>();
    for (const r of rows) {
      const label = labelFor(r.assetClassCode);
      const k = viewBy === 'Asset' ? label : categoryForLabel(label);
      m.set(k, [...(m.get(k) ?? []), r]);
    }
    const cmp = (a: HoldingRow, b: HoldingRow) => { const av = sort.key === 'name' ? a.name : a[sort.key]; const bv = sort.key === 'name' ? b.name : b[sort.key]; const c = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv)); return sort.dir === 'asc' ? c : -c; };
    return [...m.entries()].map(([name, items]) => ({
      name,
      items: [...items].sort(cmp),
      qty: items.reduce((t, r) => t + r.qty, 0),
      amtInvested: items.reduce((t, r) => t + r.amtInvested, 0),
      todaysGain: items.reduce((t, r) => t + r.todaysGain, 0),
      unrealisedGain: items.reduce((t, r) => t + r.unrealisedGain, 0),
      currentValue: items.reduce((t, r) => t + r.currentValue, 0),
    })).sort((a, b) => (sort.dir === 'asc' ? a.currentValue - b.currentValue : b.currentValue - a.currentValue));
  }, [rows, viewBy, labelFor, sort]);

  const allOpen = groups.length > 0 && groups.every((g) => openGroups.has(g.name));
  const toggleAll = () => setOpenGroups(allOpen ? new Set() : new Set(groups.map((g) => g.name)));
  const toggle = (name: string) => setOpenGroups((s) => { const n = new Set(s); if (n.has(name)) n.delete(name); else n.add(name); return n; });
  const onSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const totals = summary?.totals;
  const name = portfolio ? (portfolio.isGroup ? portfolio.shortName : portfolio.fullName || portfolio.shortName) : '';
  const pct = (gain: number, base: number) => (base ? Math.round((gain / base) * 10000) / 100 : 0);

  const Th = ({ k, label, sub, align = 'right' }: { k: SortKey; label: string; sub?: string; align?: 'left' | 'right' }) => (
    <th style={{ textAlign: align }} className="sortable" onClick={() => onSort(k)}>
      <span className="an-th"><span className="an-th-text">{label}{sub && <small>{sub}</small>}</span><SortIcon active={sort.key === k} dir={sort.dir} /></span>
    </th>
  );

  return (
    <div className="an-content summaryContainer">
      <div className="an-summary-head">
        <h2 className="an-summary-title">{name}</h2>
        <span className="an-viewby"><span className="an-viewby-label">View by</span><ToggleGroup options={['Asset', 'Category'] as ViewBy[]} value={viewBy} onChange={setViewBy} /></span>
      </div>
      <div className="an-summary-tools">
        <SearchField value={q} onChange={setQ} className="an-search-md" />
        <span className="an-summary-tools-right">
          <Menu align="right" trigger={(o) => <button type="button" className={`an-outline-select an-outline-select-sm ${o ? 'open' : ''}`}><DocIcon size={20} />Actions<ChevronSmall /></button>}
            items={[{ label: 'Tag advisor', onSelect: () => open({ kind: 'tagAdvisor' }) }, { label: 'Manage advisors', onSelect: () => goPage('advisors') }]} />
          <button type="button" className="an-outline-select an-outline-select-sm" onClick={() => open({ kind: 'preferences' })}><SlidersIcon size={20} bg="transparent" color="#12131a" />Preferences<ChevronSmall /></button>
          <ReportStudioButton />
        </span>
      </div>

      <div className="an-card an-summary-table">
        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><button type="button" className="an-tree-toggle" title={allOpen ? 'Collapse all' : 'Expand all'} aria-label="Expand all" onClick={toggleAll}><ExpandIcon /></button></th>
                <Th k="name" label="Assets" align="left" />
                <Th k="qty" label="Qty" sub="Avg. Pur. Price" />
                <Th k="amtInvested" label="Amount Invested" />
                <Th k="currentPrice" label="Current Price" />
                <Th k="todaysGain" label="Today's Gain" />
                <Th k="unrealisedGain" label="Unrealised Gain" />
                <Th k="currentValue" label="Current Value" />
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr className="an-empty-row"><td colSpan={8}><EmptyState title="No data available" text="There is no data to display at this time." /></td></tr>
              ) : groups.map((g) => (
                <GroupRows key={g.name} group={g} open={openGroups.has(g.name)} onToggle={() => toggle(g.name)} pct={pct} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="an-networth">
        <span className="an-networth-label">Net worth</span>
        <span className="an-cell" />
        <span className="an-cell">{fmtRupee(totals?.amtInvested ?? 0)}</span>
        <span className="an-cell" />
        <span className="an-cell an-cell-two">{fmtRupee(totals?.todaysGain ?? 0)}<GainPill pct={totals?.todaysGainPct ?? 0} /></span>
        <span className="an-cell an-cell-two">{fmtRupee(totals?.unrealisedGain ?? 0)}{totals && totals.amtInvested > 0 ? <GainPill pct={totals.unrealisedGainPct} /> : <span className="an-pill down"><TriangleIcon size={12} color="#c94c40" down /></span>}</span>
        <span className="an-cell">{fmtRupee(totals?.currentValue ?? 0)}</span>
      </div>
    </div>
  );
}

interface Group { name: string; items: HoldingRow[]; qty: number; amtInvested: number; todaysGain: number; unrealisedGain: number; currentValue: number }

function GroupRows({ group, open, onToggle, pct }: { group: Group; open: boolean; onToggle: () => void; pct: (g: number, b: number) => number }) {
  return (
    <>
      <tr className="an-row-group">
        <td><button type="button" className="an-tree-toggle" aria-label={open ? 'Collapse' : 'Expand'} onClick={onToggle} style={{ transform: open ? 'rotate(180deg)' : undefined }}><ChevronDownIcon size={20} color="#12131a" /></button></td>
        <td>{group.name}</td>
        <td style={{ textAlign: 'right' }} />
        <td style={{ textAlign: 'right' }}>{fmtAmount(group.amtInvested)}</td>
        <td style={{ textAlign: 'right' }} />
        <td style={{ textAlign: 'right' }}><span className="an-cell-gain">{fmtAmount(group.todaysGain)}<GainPill pct={pct(group.todaysGain, group.currentValue - group.todaysGain)} /></span></td>
        <td style={{ textAlign: 'right' }}><span className="an-cell-gain">{fmtAmount(group.unrealisedGain)}<GainPill pct={pct(group.unrealisedGain, group.amtInvested)} /></span></td>
        <td style={{ textAlign: 'right' }}>{fmtAmount(group.currentValue)}</td>
      </tr>
      {open && group.items.map((r) => (
        <tr key={r.id} className="an-row-child">
          <td />
          <td>{r.name}</td>
          <td style={{ textAlign: 'right' }}><span className="an-cell-two">{fmtAmount(r.qty)}<small>{fmtAmount(r.avgPrice)}</small></span></td>
          <td style={{ textAlign: 'right' }}>{fmtAmount(r.amtInvested)}</td>
          <td style={{ textAlign: 'right' }}>{fmtAmount(r.currentPrice)}</td>
          <td style={{ textAlign: 'right' }}><span className="an-cell-gain">{fmtAmount(r.todaysGain)}<GainPill pct={r.todaysGainPct} /></span></td>
          <td style={{ textAlign: 'right' }}><span className="an-cell-gain">{fmtAmount(r.unrealisedGain)}<GainPill pct={r.unrealisedGainPct} /></span></td>
          <td style={{ textAlign: 'right' }}>{fmtAmount(r.currentValue)}</td>
        </tr>
      ))}
    </>
  );
}
