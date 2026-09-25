import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CustomCategories, CustomCategoryRow } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useWorkspace } from '../state/WorkspaceContext';
import { useOverlay } from '../state/OverlayContext';
import { BackToDashboard } from '../components/shell/Shell';
import { Card, ChevronSmall, EmptyState, Menu } from '../components/ui/Primitives';
import { ArrowLeftIcon, ChevronDownIcon, DocIcon, EquityExposureIcon, InfoIcon, PlusIcon, SlidersIcon, TrendIcon } from '../components/ui/Icons';

type Mode = 'By Asset Class' | 'By Asset';

// Live: wrench → Custom Categories (/portfolio/custom-categories). Accordion per asset class listing
// PRODUCT → CATEGORY → SUB-CATEGORY. Footer: CATEGORY MASTER (→ /manage) · Edit categorisation.
export function CustomCategoriesPage() {
  const { sub } = useWorkspace();
  if (sub === 'manage') return <CategoryMaster />;
  return <CategoriesList />;
}

function CategoriesList() {
  const { goPage } = useWorkspace();
  const [data, setData] = useState<CustomCategories | null>(null);
  const [mode, setMode] = useState<Mode>('By Asset Class');
  const [filter, setFilter] = useState('All');
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, { category: string; subCategory: string }>>({});
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => analyticsApi.customCategories().then(setData), []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }, [toast]);

  const assetClasses = useMemo(() => [...new Set((data?.rows ?? []).map((r) => r.assetClass))], [data]);
  const categories = useMemo(() => (data?.master ?? []).map((m) => m.name), [data]);
  const subsFor = (cat: string) => (data?.master ?? []).find((m) => m.name === cat)?.subCategories.map((s) => s.name) ?? [];
  const filterOptions = ['All', 'Default only', 'Customised only'];

  const rowsFor = (ac: string) => (data?.rows ?? []).filter((r) => r.assetClass === ac && (filter === 'All' || (filter === 'Default only' ? r.isDefault : !r.isDefault)));
  const groups: { name: string; rows: CustomCategoryRow[] }[] = mode === 'By Asset Class'
    ? assetClasses.map((ac) => ({ name: ac, rows: rowsFor(ac) })).filter((g) => g.rows.length > 0 || filter === 'All')
    : [{ name: 'All products', rows: (data?.rows ?? []).filter((r) => filter === 'All' || (filter === 'Default only' ? r.isDefault : !r.isDefault)) }];

  const toggle = (n: string) => setOpenSet((s) => { const x = new Set(s); if (x.has(n)) x.delete(n); else x.add(n); return x; });
  const startEdit = () => { setEditing(true); setOpenSet(new Set(groups.map((g) => g.name))); setDraft(Object.fromEntries((data?.rows ?? []).map((r) => [r.id, { category: r.category, subCategory: r.subCategory }]))); };
  const save = async () => {
    const changed = (data?.rows ?? []).filter((r) => draft[r.id] && (draft[r.id].category !== r.category || draft[r.id].subCategory !== r.subCategory)).map((r) => ({ id: r.id, ...draft[r.id] }));
    if (changed.length) setData(await analyticsApi.saveCustomCategories(changed));
    setEditing(false); setToast(changed.length ? `${changed.length} mapping${changed.length > 1 ? 's' : ''} updated.` : 'No changes.');
  };
  const reset = async () => { setData(await analyticsApi.resetCustomCategories()); setEditing(false); setToast('Categorisation reset to defaults.'); };

  return (
    <div className="an-content customCategoriesContainer">
      <BackToDashboard />
      <div className="an-page-head">
        <h2 className="an-page-title">Custom Categories</h2>
        <span className="an-page-tools">
          <Menu align="right" trigger={(o) => <button type="button" className={`an-select ${o ? 'open' : ''}`} style={{ height: 36, fontSize: 14 }}><SlidersIcon size={18} bg="transparent" color="#64677a" />{filter}<ChevronSmall /></button>} items={filterOptions.map((f) => ({ label: f, onSelect: () => setFilter(f), trailing: f === filter ? <span className="an-menu-check">✓</span> : undefined }))} />
          <div className="an-toggle-hard" role="group">
            {(['By Asset Class', 'By Asset'] as Mode[]).map((m) => <button key={m} type="button" className={mode === m ? 'active' : ''} aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>)}
          </div>
        </span>
      </div>

      {data && groups.length === 0 && <Card style={{ marginTop: 20 }}><EmptyState title="Nothing to show" text="No products match the current filter." /></Card>}
      {groups.map((g) => {
        const isOpen = openSet.has(g.name);
        return (
          <section key={g.name} className={`an-accordion ${isOpen ? 'open' : ''}`}>
            <button type="button" className="an-accordion-head" aria-expanded={isOpen} onClick={() => toggle(g.name)}>
              <span className="an-acc-icon"><AssetGlyph name={g.name} /></span>
              <span>{g.name}</span>
              <span className="an-acc-chev"><ChevronDownIcon size={22} color="#64677a" /></span>
            </button>
            {isOpen && (
              <div className="an-accordion-body">
                <div className="an-map-table">
                  <div className="an-map-head"><span>Product</span><span>Category <InfoIcon size={14} color="#babdcc" /></span><span>Sub-Category <InfoIcon size={14} color="#babdcc" /></span></div>
                  {g.rows.map((r) => {
                    const d = draft[r.id] ?? { category: r.category, subCategory: r.subCategory };
                    return (
                      <div key={r.id} className="an-map-row">
                        <span><span className="an-map-product">{r.product}</span>{mode === 'By Asset' && <small className="an-muted" style={{ marginLeft: 8 }}>{r.assetClass}</small>}</span>
                        <span className="an-map-cell"><span className="an-map-arrow">⟶</span>{editing ? (
                          <select value={d.category} onChange={(e) => setDraft((s) => ({ ...s, [r.id]: { category: e.target.value, subCategory: subsFor(e.target.value)[0] ?? '' } }))}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
                        ) : r.category}</span>
                        <span className="an-map-cell"><span className="an-map-arrow">⟶</span>{editing ? (
                          <select value={d.subCategory} onChange={(e) => setDraft((s) => ({ ...s, [r.id]: { ...d, subCategory: e.target.value } }))}>{subsFor(d.category).map((c) => <option key={c}>{c}</option>)}</select>
                        ) : r.subCategory}</span>
                      </div>
                    );
                  })}
                  {g.rows.length === 0 && <div className="an-map-row an-muted">No products in this asset class.</div>}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div className="an-sticky-foot">
        {editing ? (
          <>
            <button type="button" className="an-btn-text an-btn-danger" onClick={() => void reset()}>Reset to default</button>
            <button type="button" className="an-btn-text" onClick={() => setEditing(false)}>Cancel</button>
            <button type="button" className="an-btn-solid" onClick={() => void save()}>Save</button>
          </>
        ) : (
          <>
            <button type="button" className="an-btn-outline" onClick={() => goPage('custom-categories', 'manage')}>Category Master</button>
            <button type="button" className="an-btn-solid" onClick={startEdit}>Edit categorisation</button>
          </>
        )}
      </div>
      {toast && <div className="an-toast">{toast}</div>}
    </div>
  );
}

// Small glyph per asset class header (live uses one icon per class; badge text for SIF/NCD-type classes).
function AssetGlyph({ name }: { name: string }) {
  if (name === 'SIF' || name === 'NCD' || name === 'FD' || name === 'AIF' || name === 'PMS' || name === 'PPF') return <span className="an-acc-badge">{name}</span>;
  if (name.startsWith('Stocks')) return <EquityExposureIcon size={22} color="#12131a" />;
  if (name.startsWith('Mutual')) return <TrendIcon size={22} />;
  return <DocIcon size={20} />;
}

// ---- Category Master (/custom-categories/manage) --------------------------------------------------------
function CategoryMaster() {
  const { goPage } = useWorkspace();
  const { open } = useOverlay();
  const [data, setData] = useState<CustomCategories | null>(null);
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const load = useCallback(() => analyticsApi.customCategories().then(setData), []);
  useEffect(() => { void load(); }, [load]);
  const toggle = (n: string) => setOpenSet((s) => { const x = new Set(s); if (x.has(n)) x.delete(n); else x.add(n); return x; });
  return (
    <div className="an-content categoryMasterContainer">
      <div className="an-rv-head">
        <span className="an-rv-title">
          <button type="button" className="an-icon-btn" aria-label="Back" onClick={() => goPage('custom-categories')}><ArrowLeftIcon /></button>
          Category Master
        </span>
        <button type="button" className="an-btn-solid" onClick={() => open({ kind: 'addCategory', onAdded: () => void load() })}><PlusIcon size={18} color="#fff" />Add category</button>
      </div>
      {(data?.master ?? []).map((m) => {
        const isOpen = openSet.has(m.name);
        return (
          <section key={m.name} className={`an-accordion ${isOpen ? 'open' : ''}`}>
            <button type="button" className="an-accordion-head" aria-expanded={isOpen} onClick={() => toggle(m.name)}>
              <span>{m.name}</span>
              {m.isDefault && <span className="an-chip">Default</span>}
              <span className="an-acc-chev"><ChevronDownIcon size={22} color="#64677a" /></span>
            </button>
            {isOpen && (
              <div className="an-accordion-body">
                <div className="an-map-table">
                  <div className="an-map-head" style={{ gridTemplateColumns: '1fr 120px' }}><span>Sub-category</span><span>Type</span></div>
                  {m.subCategories.map((s) => <div key={s.name} className="an-map-row" style={{ gridTemplateColumns: '1fr 120px' }}><span>{s.name}</span><span className="an-muted">{s.isDefault ? 'Default' : 'Custom'}</span></div>)}
                </div>
                <button type="button" className="an-btn-text" style={{ marginTop: 8 }} onClick={() => open({ kind: 'addCategory', parent: m.name, onAdded: () => void load() })}>+ Add sub-category</button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
