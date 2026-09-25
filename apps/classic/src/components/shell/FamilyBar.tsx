import { useEffect, useMemo, useRef, useState } from 'react';
import type { SearchHit } from '@mprofit/shared';
import { classicApi } from '../../api/classicApi';
import { useOverlay } from '../../state/OverlayContext';
import { useWorkspace } from '../../state/WorkspaceContext';
import { Caret } from '../Dropdown';
import { useNavigate } from 'react-router-dom';
import { portfolioPath } from '../../app/routes';

type SearchTab = 'RECENT' | 'ALL' | 'INV' | 'ACT' | 'F&O';
const SEARCH_TABS: SearchTab[] = ['RECENT', 'ALL', 'INV', 'ACT', 'F&O'];

// Family bar (56px): "<Family name> ▾" selector on the left, "Search Portfolios and Families" on the right.
export function FamilyBar() {
  const { family, dbId } = useWorkspace();
  return (
    <div className="family-bar">
      <FamilySelector />
      <PortfolioSearch dbId={dbId} currentFamilyName={family?.name ?? ''} />
    </div>
  );
}

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  return ref;
}

function FamilySelector() {
  const { family, families, dbId, selectFamily } = useWorkspace();
  const { open: openOverlay } = useOverlay();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'RECENT' | 'ALL'>('RECENT');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const ref = useOutsideClose(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    void classicApi.search(q, tab === 'RECENT' ? 'RECENT' : 'ALL').then(setHits).catch(() => setHits([]));
  }, [open, q, tab]);

  const filteredFamilies = useMemo(() => families.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())), [families, q]);

  return (
    <div ref={ref} className={`dd family-dd ${open ? 'open' : ''}`}>
      <button type="button" className="family-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {family?.name ?? 'Select Family'}<Caret />
      </button>
      {open && (
        <div className="dd-menu dd-left">
          <div className="fam-edit-row" style={{ height: 40, paddingTop: 0 }}>
            <button type="button" className="family-btn" style={{ paddingLeft: 0 }} onClick={() => setOpen(false)}>{family?.name ?? 'Select Family'}<Caret /></button>
          </div>
          <div className="fam-edit-row" style={{ height: 30 }}>
            {family && <span className="fam-edit-btn" onClick={() => { setOpen(false); openOverlay({ kind: 'editFamily' }); }}><i className="fas fa-pencil-alt" />Edit Family</span>}
            <span className="fam-edit-btn" onClick={() => { setOpen(false); openOverlay({ kind: 'addFamily' }); }}><span className="fam-add-icon">+</span>Add Family</span>
          </div>
          <div className="fam-search"><input placeholder="Search Families" value={q} onChange={(e) => setQ(e.target.value)} autoFocus /></div>
          <div className="fam-tabs">
            <div className="fam-tab-heading">
              <span className={`famtab-item ${tab === 'RECENT' ? 'active' : ''}`} onClick={() => setTab('RECENT')}>RECENT</span>
              <span className={`famtab-item ${tab === 'ALL' ? 'active' : ''}`} onClick={() => setTab('ALL')}>ALL</span>
            </div>
          </div>
          <div className="famtab-scroll">
            <table className="famtab-table">
              <thead><tr><td>Family</td><td>Portfolio</td></tr></thead>
              <tbody>
                {tab === 'RECENT' ? hits.map((h) => (
                  <tr key={h.portfolioId} onClick={() => { setOpen(false); navigate(portfolioPath(dbId, h.familyId, h.portfolioId)); }}>
                    <td>{h.familyName}</td><td>{h.portfolioName}</td>
                  </tr>
                )) : filteredFamilies.map((f) => (
                  <tr key={f.id} onClick={() => { setOpen(false); void selectFamily(f.id); }}>
                    <td>{f.name}</td><td />
                  </tr>
                ))}
                {(tab === 'RECENT' ? hits.length === 0 : filteredFamilies.length === 0) && <tr><td colSpan={2} style={{ color: '#999' }}>No results</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioSearch({ dbId }: { dbId: string; currentFamilyName: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<SearchTab>('RECENT');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const ref = useOutsideClose(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    void classicApi.search(q, tab).then(setHits).catch(() => setHits([]));
  }, [open, q, tab]);

  return (
    <div ref={ref} className="search-bar">
      <input className="port-search-input" placeholder="Search Portfolios and Families" value={q} onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true); }} />
      {open && (
        <div className="port-search-res">
          <div className="port-search-tabs">
            {SEARCH_TABS.map((t) => <span key={t} className={`famtab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</span>)}
          </div>
          <div className="port-search-container">
            <table className="port-row">
              <thead><tr><th>Portfolio</th><th>Family</th><th>Type</th></tr></thead>
              <tbody>
                {hits.map((h) => (
                  <tr key={h.portfolioId} onClick={() => { setOpen(false); setQ(''); navigate(portfolioPath(dbId, h.familyId, h.portfolioId)); }}>
                    <td>{h.portfolioName}</td>
                    <td>{h.familyName}</td>
                    <td>{h.isGroup && <span className="material-icons">group</span>}{h.type}</td>
                  </tr>
                ))}
                {hits.length === 0 && <tr><td colSpan={3} style={{ color: '#999' }}>No portfolios found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
