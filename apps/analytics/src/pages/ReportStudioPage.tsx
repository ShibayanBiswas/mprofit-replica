import { useCallback, useEffect, useMemo, useState } from 'react';
import { fmtDateTime } from '@mprofit/shared';
import type { ReportLogEntry, ReportStudioView, ReportStudioViews } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { useOverlay } from '../state/OverlayContext';
import { Card, ChevronSmall, DataTable, EmptyState, Menu, SearchField } from '../components/ui/Primitives';
import { ArrowLeftIcon, ChevronRightIcon, DocIcon, DotsIcon, GroupIcon, ListIcon, PersonIcon, PlusIcon, TrendIcon } from '../components/ui/Icons';

type Tab = 'My views' | 'Popular views';
const KIND_FILTER = ['All Views', 'Holdings', 'Performance', 'Holdings: Multi Period', 'Performance: Multi Period'];
const LEVEL_FILTER = ['All Levels', 'Family', 'Portfolio', 'Entity', 'Group', 'Global'];

// Live: /portfolio/custom-report-builder/view (list) · /edit?view=<id> (builder) · /log (report log).
export function ReportStudioPage() {
  const { sub, query } = useWorkspace();
  if (sub === 'edit') return <ViewBuilder viewId={query.get('view')} />;
  if (sub === 'log') return <ViewLog />;
  return <ViewList />;
}

function ViewList() {
  const { goPage, ctx } = useWorkspace();
  const { open } = useOverlay();
  const [views, setViews] = useState<ReportStudioViews | null>(null);
  const [tab, setTab] = useState<Tab>('Popular views');
  const [kind, setKind] = useState(KIND_FILTER[0]);
  const [level, setLevel] = useState(LEVEL_FILTER[0]);
  const [q, setQ] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => analyticsApi.reportViews().then(setViews), []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (views && views.mine.length > 0 && tab === 'Popular views' && !sessionStorage.getItem('an:rs-tab')) { /* live lands on My views when user has any */ setTab('My views'); sessionStorage.setItem('an:rs-tab', '1'); } }, [views, tab]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }, [toast]);

  const list = useMemo(() => {
    const src = (tab === 'My views' ? views?.mine : views?.popular) ?? [];
    return src.filter((v) => (kind === 'All Views' || v.kind === kind) && (level === 'All Levels' || v.level === level) && v.name.toLowerCase().includes(q.toLowerCase()));
  }, [views, tab, kind, level, q]);

  const run = async (v: ReportStudioView) => { await analyticsApi.runReportView(v.id, ctx.familyId); setToast(`"${v.name}" queued — see the report log.`); };
  const copy = async (v: ReportStudioView) => { await analyticsApi.copyReportView(v.id); await load(); setTab('My views'); setToast(`Copied to My views as "${v.name} (copy)".`); };
  const del = (v: ReportStudioView) => open({ kind: 'confirm', title: 'Delete view', body: `Delete "${v.name}"? This cannot be undone.`, cta: 'Delete', danger: true, onConfirm: async () => { await analyticsApi.deleteReportView(v.id); await load(); } });

  return (
    <div className="an-content reportStudioContainer">
      <div className="an-rs-head">
        <button type="button" className="an-icon-btn" aria-label="Back" onClick={() => goPage('today')}><ChevronRightIcon left size={16} color="#12131a" /></button>
        <h2 className="an-rs-title">Report Studio</h2>
        <span className="an-rs-beta">BETA</span>
      </div>
      <div className="an-rs-toolbar">
        <div className="an-rs-toolbar-left">
          <div className="an-rs-tabs" role="tablist">
            {(['My views', 'Popular views'] as Tab[]).map((t) => <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
          </div>
          <Menu className="an-rs-filter" align="left" trigger={(o) => <button type="button" className={`an-select ${o ? 'open' : ''}`}><DocIcon size={18} />{kind}<ChevronSmall /></button>} items={KIND_FILTER.map((k) => ({ label: k, onSelect: () => setKind(k), trailing: k === kind ? <span className="an-menu-check">✓</span> : undefined }))} />
          <Menu className="an-rs-filter" align="left" trigger={(o) => <button type="button" className={`an-select ${o ? 'open' : ''}`}><GroupIcon size={18} color="#12131a" />{level}<ChevronSmall /></button>} items={LEVEL_FILTER.map((l) => ({ label: l, onSelect: () => setLevel(l), trailing: l === level ? <span className="an-menu-check">✓</span> : undefined }))} />
        </div>
        <div className="an-rs-toolbar-right">
          <SearchField value={q} onChange={setQ} className="an-search-md" />
          <button type="button" className="an-btn-solid" onClick={() => open({ kind: 'newReportView' })}><PlusIcon size={18} color="#fff" />New Report View</button>
          <button type="button" className="an-icon-btn an-topbar-icon" style={{ margin: 0, background: '#eaf4df' }} aria-label="Open report log" title="Report log" onClick={() => goPage('custom-report-builder', 'log')}><ListIcon size={22} /></button>
        </div>
      </div>

      <div className="an-rs-grid">
        {!views ? null : list.length === 0 ? (
          <Card className="an-rs-empty"><EmptyState title={tab === 'My views' ? 'No views yet' : 'No views match'} text={tab === 'My views' ? 'Create a new report view or copy one from Popular views.' : 'Try a different filter or search.'} /></Card>
        ) : list.map((v) => (
          <Card key={v.id} className="an-rs-card">
            <span className="an-sq-icon"><DocIcon /></span>
            <Menu align="right" className="an-rs-menu-btn" trigger={() => <button type="button" className="an-icon-btn" aria-label="View options"><DotsIcon size={22} color="#12131a" /></button>}
              items={[
                { label: 'Open View', onSelect: () => goPage('custom-report-builder', 'edit', { view: v.id }) },
                { label: 'Run report', onSelect: () => void run(v) },
                { label: tab === 'My views' ? 'Duplicate' : 'Copy to My views', onSelect: () => void copy(v) },
                ...(tab === 'My views' ? [{ label: 'Delete', onSelect: () => del(v) }] : []),
              ]} />
            <button type="button" className="an-rs-card-name" style={{ textAlign: 'left' }} onClick={() => goPage('custom-report-builder', 'edit', { view: v.id })}>{v.name}</button>
            <div className="an-rs-chips">
              <span className={`an-rs-chip ${v.kind.startsWith('Performance') ? 'perf' : ''} ${v.kind.includes('Multi') ? 'multi' : ''}`}>{v.kind.startsWith('Performance') ? <TrendIcon size={12} /> : <ClockGlyph />}{v.kind}</span>
              <span className="an-rs-chip">{v.level === 'Portfolio' || v.level === 'Entity' ? <PersonIcon size={12} color="#12131a" /> : <GroupIcon size={12} color="#12131a" />}{v.level}</span>
            </div>
            <button type="button" className="an-rs-open" onClick={() => goPage('custom-report-builder', 'edit', { view: v.id })}>Open View</button>
          </Card>
        ))}
      </div>
      {toast && <div className="an-toast">{toast}</div>}
    </div>
  );
}

function ClockGlyph() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12131a" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

// ---- Builder ---------------------------------------------------------------------------------------------
const COLUMNS: Record<'Holdings' | 'Performance', string[]> = {
  Holdings: ['Asset', 'Quantity', 'Avg. Purchase Price', 'Amount Invested', 'Current Price', "Today's Gain", 'Unrealised Gain', 'Current Value', '% Holding', 'Category', 'Sub-Category', 'Sector', 'Market Cap', 'Advisor'],
  Performance: ['Entity', 'Opening Valuation', 'Total Investment', 'Total Withdrawal', 'Closing Valuation', 'Realised Gain', 'Unrealised Gain', 'Total Income', 'Total Gain', 'XIRR', 'Benchmark XIRR', 'Advisor'],
};

function ViewBuilder({ viewId }: { viewId: string | null }) {
  const { goPage, ctx, families } = useWorkspace();
  const { open } = useOverlay();
  const [view, setView] = useState<ReportStudioView | null>(null);
  const [cols, setCols] = useState<string[]>([]);
  const [familyId, setFamilyId] = useState(ctx.familyId);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void analyticsApi.reportViews().then((all) => {
      const v = [...all.mine, ...all.popular].find((x) => x.id === viewId) ?? null;
      setView(v);
      if (v) setCols(COLUMNS[v.kind.startsWith('Performance') ? 'Performance' : 'Holdings'].slice(0, 8));
    });
  }, [viewId]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }, [toast]);

  const all = view ? COLUMNS[view.kind.startsWith('Performance') ? 'Performance' : 'Holdings'] : [];
  const toggleCol = (c: string) => setCols((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const run = async () => { if (!view) return; await analyticsApi.runReportView(view.id, familyId); setToast('Report queued — opening the log.'); setTimeout(() => goPage('custom-report-builder', 'log'), 800); };
  const saveAs = () => open({ kind: 'saveView', onSave: async (name, description) => { if (!view) return; const v = await analyticsApi.createReportView({ name, description: description || undefined, kind: view.kind, level: view.level }); goPage('custom-report-builder', 'edit', { view: v.id }); } });

  return (
    <div className="an-content reportBuilderContainer">
      <div className="an-rv-head">
        <span className="an-rv-title">
          <button type="button" className="an-icon-btn" aria-label="Back to Report Studio" onClick={() => goPage('custom-report-builder', 'view')}><ArrowLeftIcon /></button>
          {view?.name ?? 'Report view'}
          {view && <span className="an-rs-chip">{view.kind}</span>}
          {view && <span className="an-rs-chip">{view.level}</span>}
        </span>
        <span className="an-rv-actions">
          <button type="button" className="an-btn-outline" onClick={saveAs}>Save as new view</button>
          <button type="button" className="an-btn-solid" disabled={!view} onClick={() => void run()}>Run report</button>
        </span>
      </div>

      {!view ? (
        <Card className="an-rv-card"><EmptyState title="View not found" text="This report view no longer exists. Go back to Report Studio to pick another." /></Card>
      ) : (
        <Card className="an-rv-card">
          <div className="an-rv-grid">
            <div className="an-field"><label>Family</label>
              <select value={familyId} onChange={(e) => setFamilyId(e.target.value)}>{families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
            </div>
            <div className="an-field"><label>Level</label><input value={view.level} readOnly /></div>
            <div className="an-field"><label>View type</label><input value={view.kind} readOnly /></div>
            <div className="an-field"><label>Description</label><input value={view.description ?? ''} readOnly placeholder="—" /></div>
          </div>
          <div className="an-rv-columns">
            <h4>Columns ({cols.length}/{all.length})</h4>
            <div className="an-rv-col-list">
              {all.map((c) => <button key={c} type="button" className={`an-rv-col ${cols.includes(c) ? 'on' : ''}`} aria-pressed={cols.includes(c)} onClick={() => toggleCol(c)}>{cols.includes(c) ? '✓ ' : ''}{c}</button>)}
            </div>
          </div>
          <div className="an-rv-preview">
            <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Preview</h4>
            <div className="an-table-wrap" style={{ border: '1px solid #ebecf2', borderRadius: 6 }}>
              <table className="an-table"><thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody><tr className="an-empty-row"><td colSpan={Math.max(1, cols.length)}><EmptyState title="Run the report to populate this view" text="Results are generated for the selected family and listed in the report log." /></td></tr></tbody></table>
            </div>
          </div>
        </Card>
      )}
      {toast && <div className="an-toast">{toast}</div>}
    </div>
  );
}

// ---- Report log ------------------------------------------------------------------------------------------
function ViewLog() {
  const { goPage } = useWorkspace();
  const [log, setLog] = useState<ReportLogEntry[]>([]);
  useEffect(() => {
    const load = () => void analyticsApi.reportLog().then(setLog);
    load(); const t = setInterval(load, 3000); return () => clearInterval(t);
  }, []);
  return (
    <div className="an-content reportLogContainer">
      <div className="an-rv-head">
        <span className="an-rv-title">
          <button type="button" className="an-icon-btn" aria-label="Back to Report Studio" onClick={() => goPage('custom-report-builder', 'view')}><ArrowLeftIcon /></button>
          Report log
        </span>
      </div>
      <Card className="an-table-card an-adv-table">
        <DataTable<ReportLogEntry>
          rowKey={(r) => r.id}
          columns={[
            { key: 'viewName', label: 'VIEW', sortable: false },
            { key: 'kind', label: 'TYPE', sortable: false, render: (r: ReportLogEntry) => `${r.kind} · ${r.level}` },
            { key: 'familyName', label: 'FAMILY', sortable: false },
            { key: 'ranAt', label: 'RUN AT', sortable: false, render: (r: ReportLogEntry) => fmtDateTime(r.ranAt) },
            { key: 'status', label: 'STATUS', sortable: false, align: 'right', render: (r: ReportLogEntry) => <span className={`an-chip ${r.status === 'Completed' ? 'ok' : ''}`}>{r.status}</span> },
          ]}
          rows={log}
          empty={<EmptyState title="No reports yet" text="Run a view from Report Studio and it will appear here." />}
        />
      </Card>
    </div>
  );
}