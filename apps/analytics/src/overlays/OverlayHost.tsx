import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CONTACT_US, capitalizeInitials, fmtAmount, initials } from '@mprofit/shared';
import type { Blend, Family, IndexCatalog, ReportViewKind, ReportViewLevel, WatchlistItem } from '@mprofit/shared';
import { analyticsApi, type BenchmarksResponse } from '../api/analyticsApi';
import { useOverlay, type Overlay, type Period, type PeriodKind } from '../state/OverlayContext';
import { useWorkspace } from '../state/WorkspaceContext';
import { useSession } from '../state/SessionContext';
import { Dialog, SearchField, Switch } from '../components/ui/Primitives';
import { DragIcon, GroupIcon, PersonIcon } from '../components/ui/Icons';

// Renders the top of the overlay stack. Each dialog mirrors the live MUI dialog it replaces.
export function OverlayHost() {
  const { stack, close } = useOverlay();
  useCloseOnLogout();
  const top = stack[stack.length - 1];
  if (!top) return null;
  return <OverlayView overlay={top} onClose={close} />;
}

function OverlayView({ overlay, onClose }: { overlay: Overlay; onClose: () => void }) {
  switch (overlay.kind) {
    case 'familyPicker': return <FamilyPicker onClose={onClose} />;
    case 'preferences': return <PreferencesDialog onClose={onClose} />;
    case 'changeIndices': return <ChangeIndicesDialog onClose={onClose} />;
    case 'changeBenchmark': return <ChangeBenchmarkDialog onClose={onClose} />;
    case 'periodPicker': return <PeriodPicker value={overlay.value} onPick={overlay.onPick} onClose={onClose} />;
    case 'helpCenter': return <HelpCenter onClose={onClose} />;
    case 'contactSupport': return <ContactSupport onClose={onClose} />;
    case 'appTour': return <AppTour onClose={onClose} />;
    case 'tagAdvisor': return <TagAdvisor onClose={onClose} />;
    case 'addAdvisor': return <AddAdvisor onAdded={overlay.onAdded} onClose={onClose} />;
    case 'watchlistEdit': return <WatchlistEdit onChanged={overlay.onChanged} onClose={onClose} />;
    case 'watchlistSearch': return <WatchlistSearch onChanged={overlay.onChanged} onClose={onClose} />;
    case 'newReportView': return <NewReportView onClose={onClose} />;
    case 'saveView': return <SaveView onSave={overlay.onSave} onClose={onClose} />;
    case 'selectIndex': return <SelectIndex current={overlay.current} onPick={overlay.onPick} onClose={onClose} />;
    case 'addCategory': return <AddCategory parent={overlay.parent} onAdded={overlay.onAdded} onClose={onClose} />;
    case 'addPortfolio': return <AddPortfolio variant={overlay.variant} onClose={onClose} />;
    case 'confirm': return <Confirm title={overlay.title} body={overlay.body} cta={overlay.cta} danger={overlay.danger} onConfirm={overlay.onConfirm} onClose={onClose} />;
    case 'info': return <Dialog title={overlay.title} onClose={onClose} footer={<button type="button" className="an-btn-solid" onClick={onClose}>OK</button>}><p>{overlay.body}</p></Dialog>;
    default: {
      const _exhaustive: never = overlay;
      return _exhaustive;
    }
  }
}

// ---- Family picker (rail tile / swap icon) -------------------------------------------------------
function FamilyPicker({ onClose }: { onClose: () => void }) {
  const { families, ctx, selectFamily } = useWorkspace();
  const [q, setQ] = useState('');
  const list = useMemo(() => families.filter((f: Family) => f.name.toLowerCase().includes(q.toLowerCase())), [families, q]);
  return (
    <Dialog title="Switch Family" onClose={onClose} width={440}>
      <SearchField value={q} onChange={setQ} placeholder="Search families" className="an-search-md" autoFocus />
      <ul className="an-family-list" style={{ marginTop: 12 }}>
        {list.map((f) => (
          <li key={f.id}>
            <button type="button" className={f.id === ctx.familyId ? 'current' : ''} onClick={() => { void selectFamily(f.id).then(onClose); }}>
              <span className="an-family-initials">{initials(f.name, 2)}</span>{f.name}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="an-muted" style={{ padding: 12 }}>No families found</li>}
      </ul>
    </Dialog>
  );
}

// ---- Preferences (Portfolio page) -------------------------------------------------------------------
function PreferencesDialog({ onClose }: { onClose: () => void }) {
  const { preferences, setPreferences } = useWorkspace();
  const [zero, setZero] = useState(preferences?.zeroValues ?? true);
  const [pms, setPms] = useState(preferences?.pmsLineItem ?? true);
  const done = async () => { const p = await analyticsApi.savePreferences({ zeroValues: zero, pmsLineItem: pms }); setPreferences(p); onClose(); };
  return (
    <Dialog title="Preferences" onClose={onClose} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" onClick={() => void done()}>Done</button></>}>
      <Switch label="Zero Values" checked={zero} onChange={setZero} />
      <Switch label="Show PMS as a line-item in Groups (BETA)" checked={pms} onChange={setPms} />
    </Dialog>
  );
}

// ---- Change indices (Today / Performance) -------------------------------------------------------------
function ChangeIndicesDialog({ onClose }: { onClose: () => void }) {
  const [cat, setCat] = useState<IndexCatalog | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { void analyticsApi.indexCatalog().then((c) => { setCat(c); setSel(c.selected); }); }, []);
  const toggle = (name: string) => setSel((s) => (s.includes(name) ? s.filter((n) => n !== name) : s.length >= 5 ? s : [...s, name]));
  const save = async () => { await analyticsApi.selectIndices(sel); window.dispatchEvent(new Event('an:indices-changed')); onClose(); };
  const list = (cat?.indices ?? []).filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog title="Change Indices" onClose={onClose} width={460} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" disabled={sel.length === 0} onClick={() => void save()}>Save</button></>}>
      <p className="an-muted" style={{ marginBottom: 12 }}>Select up to 5 indices to compare against ({sel.length}/5 selected).</p>
      <SearchField value={q} onChange={setQ} placeholder="Search indices" className="an-search-md" />
      <ul className="an-check-list" style={{ marginTop: 8, maxHeight: 320, overflow: 'auto' }}>
        {list.map((i) => (
          <li key={i.code}><input type="checkbox" id={`idx-${i.code}`} checked={sel.includes(i.name)} onChange={() => toggle(i.name)} /><label htmlFor={`idx-${i.code}`}>{i.name}</label></li>
        ))}
      </ul>
    </Dialog>
  );
}

// ---- Change benchmark (Performance → XIRR Comparison) -------------------------------------------------
function ChangeBenchmarkDialog({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<BenchmarksResponse | null>(null);
  const [code, setCode] = useState('');
  useEffect(() => { void analyticsApi.benchmarks().then((b) => { setData(b); setCode(b.selected); }); }, []);
  const save = async () => { await analyticsApi.selectBenchmark(code); window.dispatchEvent(new Event('an:benchmark-changed')); onClose(); };
  return (
    <Dialog title="Change Benchmark" onClose={onClose} width={440} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" onClick={() => void save()}>Save</button></>}>
      <ul className="an-radio-list">
        {(data?.benchmarks ?? []).map((b) => (
          <li key={b.code}><input type="radio" name="bench" id={`b-${b.code}`} checked={code === b.code} onChange={() => setCode(b.code)} /><label htmlFor={`b-${b.code}`}>{b.name}</label></li>
        ))}
      </ul>
    </Dialog>
  );
}

// ---- Period picker (Performance → Period) --------------------------------------------------------------
const PERIOD_KINDS: PeriodKind[] = ['All to Date', 'All to Custom Date', 'Financial Year', 'Year', 'Month', 'Trailing', 'Custom'];
function PeriodPicker({ value, onPick, onClose }: { value: Period; onPick: (p: Period) => void; onClose: () => void }) {
  const [kind, setKind] = useState<PeriodKind>(value.kind);
  const [from, setFrom] = useState(value.from ?? '');
  const [to, setTo] = useState(value.to ?? '');
  const [fy, setFy] = useState('2025-26');
  const [trail, setTrail] = useState('1 Year');
  const now = new Date();
  const fys = Array.from({ length: 6 }, (_, i) => { const y = now.getFullYear() - i; return `${y}-${String(y + 1).slice(2)}`; });
  const apply = () => {
    let label = kind as string;
    if (kind === 'Financial Year') label = `FY ${fy}`;
    else if (kind === 'Trailing') label = `Trailing ${trail}`;
    else if (kind === 'All to Custom Date') label = to ? `All to ${to}` : 'All to Custom Date';
    else if (kind === 'Custom') label = from && to ? `${from} – ${to}` : 'Custom';
    else if (kind === 'Year') label = `${now.getFullYear()}`;
    else if (kind === 'Month') label = now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    onPick({ kind, label, from: from || undefined, to: to || undefined }); onClose();
  };
  return (
    <Dialog title="Select a time period" onClose={onClose} width={520} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" onClick={apply}>Apply</button></>}>
      <ul className="an-radio-list an-period-grid">
        {PERIOD_KINDS.map((k) => <li key={k}><input type="radio" name="period" id={`p-${k}`} checked={kind === k} onChange={() => setKind(k)} /><label htmlFor={`p-${k}`}>{k}</label></li>)}
      </ul>
      {kind === 'Financial Year' && <div className="an-field" style={{ marginTop: 16 }}><label>Financial year</label><select value={fy} onChange={(e) => setFy(e.target.value)}>{fys.map((f) => <option key={f}>{f}</option>)}</select></div>}
      {kind === 'Trailing' && <div className="an-field" style={{ marginTop: 16 }}><label>Trailing period</label><select value={trail} onChange={(e) => setTrail(e.target.value)}>{['1 Month', '3 Months', '6 Months', '1 Year', '2 Years', '3 Years', '5 Years'].map((t) => <option key={t}>{t}</option>)}</select></div>}
      {(kind === 'Custom' || kind === 'All to Custom Date') && (
        <div className="an-rv-grid" style={{ marginTop: 16 }}>
          {kind === 'Custom' && <div className="an-field"><label>From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>}
          <div className="an-field"><label>To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
      )}
    </Dialog>
  );
}

// ---- Help Center / Contact Support / App Tour (user menu) -----------------------------------------------
const HELP_TOPICS = [
  { title: 'Getting started with Analytics', text: 'Dashboard, Portfolio and Equity Exposure at a glance.' },
  { title: 'Reading the Today dashboard', text: 'Current value, gains, index comparison and asset allocation.' },
  { title: 'Understanding XIRR and benchmarks', text: 'How annualised returns are compared with index CAGR.' },
  { title: 'Custom categories', text: 'Re-map products into your own categories and sub-categories.' },
  { title: 'Report Studio (BETA)', text: 'Build reusable holdings and performance views.' },
];
function HelpCenter({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const list = HELP_TOPICS.filter((t) => `${t.title} ${t.text}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Dialog title="Help Center" onClose={onClose} width={480}>
      <SearchField value={q} onChange={setQ} placeholder="Search help" className="an-search-md" autoFocus />
      <ul className="an-help-list" style={{ marginTop: 12 }}>
        {list.map((t) => <li key={t.title}>{t.title}<small>{t.text}</small></li>)}
      </ul>
    </Dialog>
  );
}
function ContactSupport({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Contact Us" onClose={onClose} width={420}>
      {CONTACT_US.map((c) => (
        <div key={c.email} className="an-contact-card">
          <span className="an-contact-role">{c.role}</span>
          <span className="an-contact-name">{c.name}</span>
          <a className="an-contact-email" href={`mailto:${c.email}`}>{c.email}</a>
        </div>
      ))}
    </Dialog>
  );
}
const TOUR = [
  ['Portfolio selector', 'Switch between families, groups and portfolios from the drawer tile.'],
  ['Dashboard', 'Today / Holdings / Performance tabs summarise the selected portfolio.'],
  ['Portfolio', 'Asset-level holdings with expandable groups and a live net worth bar.'],
  ['Equity Exposure', 'Look-through exposure across stocks, mutual funds and ETFs.'],
  ['Report Studio', 'Build and run reusable report views (BETA).'],
];
function AppTour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const last = i === TOUR.length - 1;
  return (
    <Dialog title="App Tour" onClose={onClose} width={440} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Skip</button><button type="button" className="an-btn-solid" onClick={() => (last ? onClose() : setI(i + 1))}>{last ? 'Done' : 'Next'}</button></>}>
      <div className="an-tour-step"><span className="an-tour-num">{i + 1}</span><div><div className="an-contact-name">{TOUR[i][0]}</div><p className="an-muted">{TOUR[i][1]}</p></div></div>
    </Dialog>
  );
}

// ---- Advisors -------------------------------------------------------------------------------------------
function TagAdvisor({ onClose }: { onClose: () => void }) {
  const { ctx, portfolio, reloadPortfolios } = useWorkspace();
  const { open } = useOverlay();
  const [advisors, setAdvisors] = useState<{ id: string; name: string }[]>([]);
  const [sel, setSel] = useState<string>((portfolio as { advisorId?: string } | null)?.advisorId ?? '');
  useEffect(() => { void analyticsApi.advisors().then(setAdvisors); }, []);
  const save = async () => { await analyticsApi.tagAdvisor(ctx.portfolioId, sel || null); await reloadPortfolios(); onClose(); };
  return (
    <Dialog title="Tag advisor" onClose={onClose} width={420} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" onClick={() => void save()}>Save</button></>}>
      <p className="an-muted" style={{ marginBottom: 12 }}>Portfolio: <b>{portfolio?.fullName || portfolio?.shortName}</b></p>
      <div className="an-field"><label>Advisor</label>
        <select value={sel} onChange={(e) => setSel(e.target.value)}>
          <option value="">None</option>
          {advisors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <button type="button" className="an-btn-text" style={{ marginTop: 12 }} onClick={() => open({ kind: 'addAdvisor', onAdded: () => void analyticsApi.advisors().then(setAdvisors) })}>+ Add advisor</button>
    </Dialog>
  );
}
function AddAdvisor({ onAdded, onClose }: { onAdded?: () => void; onClose: () => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); await analyticsApi.addAdvisor({ name: capitalizeInitials(name), email, phone }); onAdded?.(); onClose(); };
  return (
    <Dialog title="Add advisor" onClose={onClose} width={440} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="submit" form="add-advisor" className="an-btn-solid" disabled={!name.trim()}>Add</button></>}>
      <form id="add-advisor" onSubmit={(e) => void submit(e)}>
        <div className="an-field"><label>Advisor name</label><input value={name} onChange={(e) => setName(e.target.value)} autoFocus required /></div>
        <div className="an-field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="an-field"><label>Phone number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </form>
    </Dialog>
  );
}

// ---- Watchlist ----------------------------------------------------------------------------------------
function WatchlistEdit({ onChanged, onClose }: { onChanged?: () => void; onClose: () => void }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  useEffect(() => { void analyticsApi.watchlist().then(setItems); }, []);
  const move = (i: number, d: -1 | 1) => setItems((s) => { const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const remove = async (id: string) => { await analyticsApi.removeFromWatchlist(id); setItems((s) => s.filter((w) => w.id !== id)); };
  const save = async () => { await analyticsApi.reorderWatchlist(items.map((w) => w.id)); onChanged?.(); onClose(); };
  return (
    <Dialog title="Edit Watchlist" onClose={onClose} width={520} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" onClick={() => void save()}>Done</button></>}>
      <ul className="an-watchlist" style={{ marginTop: 0 }}>
        {items.map((w, i) => (
          <li key={w.id}>
            <DragIcon />
            <span className="an-watch-name">{w.name}</span>
            <span className="an-watch-price">{fmtAmount(w.price)}</span>
            <span className="an-row-actions">
              <button type="button" className="an-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="an-icon-btn" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="an-icon-btn an-btn-danger" aria-label="Remove" onClick={() => void remove(w.id)}>×</button>
            </span>
          </li>
        ))}
        {items.length === 0 && <li className="an-muted">Your watchlist is empty.</li>}
      </ul>
    </Dialog>
  );
}
function WatchlistSearch({ onChanged, onClose }: { onChanged?: () => void; onClose: () => void }) {
  const [q, setQ] = useState(''); const [price, setPrice] = useState('');
  const add = async (e: FormEvent) => { e.preventDefault(); if (!q.trim()) return; await analyticsApi.addToWatchlist(q.trim(), Number(price) || 0); onChanged?.(); onClose(); };
  return (
    <Dialog title="Add to Watchlist" onClose={onClose} width={440} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="submit" form="wl-add" className="an-btn-solid" disabled={!q.trim()}>Add</button></>}>
      <form id="wl-add" onSubmit={(e) => void add(e)}>
        <div className="an-field"><label>Stock name</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stocks" autoFocus /></div>
        <div className="an-field"><label>Last price (optional)</label><input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
      </form>
    </Dialog>
  );
}

// ---- Report Studio ------------------------------------------------------------------------------------
const KINDS: ReportViewKind[] = ['Holdings', 'Performance', 'Holdings: Multi Period', 'Performance: Multi Period'];
const LEVELS: ReportViewLevel[] = ['Family', 'Portfolio', 'Entity', 'Group', 'Global'];
function NewReportView({ onClose }: { onClose: () => void }) {
  const { goPage } = useWorkspace();
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [kind, setKind] = useState<ReportViewKind>('Holdings'); const [level, setLevel] = useState<ReportViewLevel>('Family');
  const create = async (e: FormEvent) => { e.preventDefault(); const v = await analyticsApi.createReportView({ name: name.trim(), description: desc.trim() || undefined, kind, level }); onClose(); goPage('custom-report-builder', 'edit', { view: v.id }); };
  return (
    <Dialog title="New Report View" onClose={onClose} width={520} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="submit" form="new-view" className="an-btn-solid" disabled={!name.trim()}>Create</button></>}>
      <form id="new-view" onSubmit={(e) => void create(e)}>
        <div className="an-field"><label>View name</label><input value={name} onChange={(e) => setName(e.target.value)} autoFocus required /></div>
        <div className="an-field"><label>Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div className="an-rv-grid" style={{ marginTop: 16 }}>
          <div className="an-field"><label>View type</label><select value={kind} onChange={(e) => setKind(e.target.value as ReportViewKind)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></div>
          <div className="an-field"><label>Level</label><select value={level} onChange={(e) => setLevel(e.target.value as ReportViewLevel)}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></div>
        </div>
      </form>
    </Dialog>
  );
}
function SaveView({ onSave, onClose }: { onSave: (name: string, description: string) => Promise<void> | void; onClose: () => void }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); await onSave(name.trim(), desc.trim()); onClose(); };
  return (
    <Dialog title="Save as new view" onClose={onClose} width={480} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="submit" form="save-view" className="an-btn-solid" disabled={!name.trim()}>Save</button></>}>
      <form id="save-view" onSubmit={(e) => void submit(e)}>
        <div className="an-field"><label>View name</label><input value={name} onChange={(e) => setName(e.target.value)} autoFocus required /></div>
        <div className="an-field"><label>Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      </form>
    </Dialog>
  );
}

// ---- Benchmark Settings → Select Index (Single Index | Blends) ------------------------------------------
function SelectIndex({ current, onPick, onClose }: { current: string | null; onPick: (name: string) => Promise<void> | void; onClose: () => void }) {
  const [tab, setTab] = useState<'Single Index' | 'Blends'>('Single Index');
  const [cat, setCat] = useState<IndexCatalog | null>(null);
  const [blends, setBlends] = useState<Blend[]>([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(current);
  const [newBlend, setNewBlend] = useState<{ name: string; parts: { index: string; weight: number }[] } | null>(null);
  useEffect(() => { void analyticsApi.indexCatalog().then(setCat); void analyticsApi.blends().then(setBlends); }, []);
  const indices = (cat?.indices ?? []).filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  const total = newBlend?.parts.reduce((t, p) => t + (Number(p.weight) || 0), 0) ?? 0;
  const saveBlend = async () => {
    if (!newBlend || !newBlend.name.trim() || total !== 100) return;
    const b = await analyticsApi.createBlend(newBlend.name.trim(), newBlend.parts.filter((p) => p.index));
    setBlends((s) => [...s, b]); setSel(b.name); setNewBlend(null);
  };
  return (
    <Dialog title="Select Index" onClose={onClose} width={520} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className="an-btn-solid" disabled={!sel} onClick={() => { if (sel) void Promise.resolve(onPick(sel)).then(onClose); }}>Apply</button></>}>
      <div className="an-dialog-tabs">
        {(['Single Index', 'Blends'] as const).map((t) => <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Single Index' ? (
        <>
          <SearchField value={q} onChange={setQ} placeholder="Search indices" className="an-search-md" />
          <ul className="an-radio-list" style={{ marginTop: 8, maxHeight: 300, overflow: 'auto' }}>
            {indices.map((i) => <li key={i.code}><input type="radio" name="si" id={`si-${i.code}`} checked={sel === i.name} onChange={() => setSel(i.name)} /><label htmlFor={`si-${i.code}`}>{i.name}</label></li>)}
          </ul>
        </>
      ) : newBlend ? (
        <>
          <div className="an-field"><label>Blend name</label><input value={newBlend.name} onChange={(e) => setNewBlend({ ...newBlend, name: e.target.value })} autoFocus /></div>
          {newBlend.parts.map((p, i) => (
            <div key={i} className="an-blend-row">
              <select value={p.index} onChange={(e) => setNewBlend({ ...newBlend, parts: newBlend.parts.map((x, j) => (j === i ? { ...x, index: e.target.value } : x)) })} style={{ height: 36, border: '1px solid #c4c4c4', borderRadius: 4 }}>
                <option value="">Select index</option>{(cat?.indices ?? []).map((ix) => <option key={ix.code}>{ix.name}</option>)}
              </select>
              <input type="number" min={0} max={100} value={p.weight} onChange={(e) => setNewBlend({ ...newBlend, parts: newBlend.parts.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) } : x)) })} style={{ height: 36, border: '1px solid #c4c4c4', borderRadius: 4, padding: '0 8px' }} />
              <button type="button" className="an-icon-btn an-btn-danger" aria-label="Remove" onClick={() => setNewBlend({ ...newBlend, parts: newBlend.parts.filter((_, j) => j !== i) })}>×</button>
            </div>
          ))}
          <button type="button" className="an-btn-text" style={{ marginTop: 8 }} onClick={() => setNewBlend({ ...newBlend, parts: [...newBlend.parts, { index: '', weight: 0 }] })}>+ Add index</button>
          <div className="an-blend-total">Total weight: {total}% {total !== 100 && '(must equal 100%)'}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" className="an-btn-text" onClick={() => setNewBlend(null)}>Back</button>
            <button type="button" className="an-btn-outline" disabled={total !== 100 || !newBlend.name.trim()} onClick={() => void saveBlend()}>Save blend</button>
          </div>
        </>
      ) : (
        <>
          <ul className="an-radio-list">
            {blends.map((b) => <li key={b.id}><input type="radio" name="bl" id={`bl-${b.id}`} checked={sel === b.name} onChange={() => setSel(b.name)} /><label htmlFor={`bl-${b.id}`}>{b.name} <small className="an-muted">({b.parts.map((p) => `${p.weight}% ${p.index}`).join(', ')})</small></label></li>)}
            {blends.length === 0 && <li className="an-muted">No blends yet.</li>}
          </ul>
          <button type="button" className="an-btn-outline" style={{ marginTop: 12 }} onClick={() => setNewBlend({ name: '', parts: [{ index: '', weight: 50 }, { index: '', weight: 50 }] })}>+ Create blend</button>
        </>
      )}
    </Dialog>
  );
}

// ---- Category Master → Add category / sub-category ------------------------------------------------------
function AddCategory({ parent, onAdded, onClose }: { parent?: string; onAdded?: () => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); await analyticsApi.addCategory(capitalizeInitials(name), parent); onAdded?.(); onClose(); };
  return (
    <Dialog title={parent ? `Add sub-category to ${parent}` : 'Add category'} onClose={onClose} width={420} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="submit" form="add-cat" className="an-btn-solid" disabled={!name.trim()}>Add</button></>}>
      <form id="add-cat" onSubmit={(e) => void submit(e)}><div className="an-field"><label>{parent ? 'Sub-category name' : 'Category name'}</label><input value={name} onChange={(e) => setName(e.target.value)} autoFocus required /></div></form>
    </Dialog>
  );
}

// ---- Add portfolio / group (from the drawer dropdown) ----------------------------------------------------
function AddPortfolio({ variant, onClose }: { variant: 'Portfolio' | 'Group'; onClose: () => void }) {
  const { ctx, reloadPortfolios, selectPortfolio } = useWorkspace();
  const [name, setName] = useState(''); const [pan, setPan] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/Families/${ctx.familyId}/Portfolios`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shortName: capitalizeInitials(name), fullName: capitalizeInitials(name), pan, isGroup: variant === 'Group', type: 'Investment' }) });
    const p = (await res.json()) as { id: string };
    await reloadPortfolios(); onClose(); selectPortfolio(p.id);
  };
  return (
    <Dialog title={`Add ${variant}`} onClose={onClose} width={440} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="submit" form="add-pf" className="an-btn-solid" disabled={!name.trim()}>Add</button></>}>
      <form id="add-pf" onSubmit={(e) => void submit(e)}>
        <div className="an-field"><label>{variant} name</label><input value={name} onChange={(e) => setName(e.target.value)} autoFocus required /></div>
        {variant === 'Portfolio' && <div className="an-field"><label>PAN (optional)</label><input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} /></div>}
        <p className="an-muted" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>{variant === 'Group' ? <GroupIcon color="#64677a" /> : <PersonIcon color="#64677a" />}Added to the current family.</p>
      </form>
    </Dialog>
  );
}

// ---- Generic confirm ------------------------------------------------------------------------------------
function Confirm({ title, body, cta = 'Confirm', danger, onConfirm, onClose }: { title: string; body: string; cta?: string; danger?: boolean; onConfirm: () => Promise<void> | void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); onClose(); } };
  return (
    <Dialog title={title} onClose={onClose} width={420} footer={<><button type="button" className="an-btn-text" onClick={onClose}>Cancel</button><button type="button" className={`an-btn-solid ${danger ? 'an-btn-danger-solid' : ''}`} style={danger ? { background: '#c94c40' } : undefined} disabled={busy} onClick={() => void go()}>{cta}</button></>}>
      <p>{body}</p>
    </Dialog>
  );
}

// Any open dialog is dismissed when the session ends (Classic logout in another tab).
function useCloseOnLogout() {
  const { status } = useSession();
  const { closeAll } = useOverlay();
  useEffect(() => { if (status === 'anonymous') closeAll(); }, [status, closeAll]);
}
