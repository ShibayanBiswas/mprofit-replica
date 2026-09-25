import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AccessUser, CorporateAction, Portfolio, TaskItem } from '@mprofit/shared';
import { fmtDateSlash } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { ToolPanel } from '../components/Sheet';
import { Caret, Dropdown } from '../components/Dropdown';
import { PrimaryButton, GhostButton } from '../components/Modal';
import { useOverlay } from '../state/OverlayContext';
import { useWorkspace } from '../state/WorkspaceContext';
import { portfolioPath } from '../app/routes';

// ---- Access Control (05-settings/01-access-control.png) ----------------------------------------
export function AccessControlSheet({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [max, setMax] = useState(0);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState('');
  const load = () => classicApi.accessUsers().then((r) => { setUsers(r.users); setMax(r.maxUsers); });
  useEffect(() => { void load(); }, []);
  const add = async () => { if (!email.trim()) return; await classicApi.addAccessUser({ email, type: 'User', access: 'All Families' }); setEmail(''); setAdding(false); await load(); };
  const remove = async (id: string) => { await classicApi.removeAccessUser(id); await load(); };
  const shown = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()));
  return (
    <ToolPanel title="Access Control" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <span className="tool-count">Active Users: &nbsp;{users.length} / {max}</span>
        <button type="button" className="btn btn-navy btn-xs" onClick={() => setAdding(true)}>Add New User</button>
      </div>
      {adding && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input className="form-control" style={{ maxWidth: 320 }} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          <PrimaryButton className="btn-sm" onClick={() => void add()}>Save</PrimaryButton><GhostButton className="btn-sm" onClick={() => setAdding(false)}>Cancel</GhostButton>
        </div>
      )}
      <div className="asset-search-container" style={{ marginBottom: 20 }}><input className="asset-search-box" style={{ width: 200, height: 28, fontSize: 13 }} placeholder="Search Users" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, minHeight: 320 }}>
        <table className="data-table">
          <thead><tr><th>User</th><th>Type</th><th>Access</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id}><td>{u.email}</td><td>{u.type}{u.type !== 'Owner' && <Caret />}</td><td>{u.type === 'Owner' ? '' : u.access}</td>
                <td style={{ textAlign: 'right' }}>{u.type !== 'Owner' && <Dropdown align="right" trigger={() => <Caret />} entries={[{ type: 'item', label: 'Remove user', onSelect: () => void remove(u.id) }]} />}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolPanel>
  );
}

// ---- Portfolio Masters (05-settings/02-portfolio-masters.png) -------------------------------------
export function PortfolioMastersSheet({ onClose }: { onClose: () => void }) {
  const { dbId, families } = useWorkspace();
  const { open, closeAll } = useOverlay();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Portfolios' | 'Families' | 'Categories'>('Portfolios');
  const [rows, setRows] = useState<(Portfolio & { familyName: string })[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { void classicApi.masters().then(setRows); }, []);
  const shown = useMemo(() => rows.filter((r) => `${r.familyName} ${r.shortName} ${r.fullName}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const goTo = (p: Portfolio) => { closeAll(); navigate(portfolioPath(dbId, p.familyId, p.id)); };
  return (
    <ToolPanel title="Manage your Family and Portfolio masters" onClose={onClose} footer={(
      <>
        <select className="form-control form-select" style={{ maxWidth: 240 }}><option>Select Bulk Template</option><option>Set PMS Categorisation</option><option>Set Trading Flag</option><option>Update PAN</option></select>
        <span className="spacer" />
        <button type="button" className="btn btn-navy btn-sm" onClick={() => open({ kind: 'addFamily' })}>Add Family</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => open({ kind: 'notice', title: 'Masters Log', description: 'Recent changes to family and portfolio masters.' })}>View Masters Log</button>
      </>
    )}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div className="tool-subtabs" style={{ marginBottom: 0 }}>
          {(['Portfolios', 'Families', 'Categories'] as const).map((t) => <span key={t} className={`tool-subtab ${tab === t ? 'active' : ''}`} style={{ fontSize: 14 }} onClick={() => setTab(t)}>{t}</span>)}
        </div>
        <span className="spacer" style={{ flex: 1 }} />
        <div className="asset-search-container"><input className="asset-search-box" style={{ width: 200, height: 28, fontSize: 13 }} placeholder={`Search ${tab}`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, minHeight: 300 }}>
        {tab === 'Portfolios' && (
          <table className="data-table">
            <thead><tr><th>Family Name</th><th>Portfolio Short Name</th><th>Portfolio Full Name</th><th>PAN</th><th>Type</th><th>Is Group?</th><th>Edit</th><th>View</th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id}><td>{p.familyName}</td><td>{p.shortName}</td><td>{p.isGroup ? '' : p.fullName}</td><td>{p.pan}</td><td>{p.type}</td><td>{p.isGroup ? 'Yes' : 'No'}</td>
                  <td><button type="button" className="btn btn-navy btn-xs" onClick={() => open({ kind: 'notice', title: 'Edit Portfolio', description: `Edit details for ${p.shortName}.` })}>Edit Details</button></td>
                  <td><button type="button" className="btn btn-navy btn-xs" onClick={() => goTo(p)}>Go to Portfolio</button></td></tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'Families' && (
          <table className="data-table">
            <thead><tr><th>Family Name</th><th>Portfolios</th><th>Edit</th></tr></thead>
            <tbody>{families.map((f) => <tr key={f.id}><td>{f.name}</td><td>{rows.filter((r) => r.familyId === f.id).length}</td><td><button type="button" className="btn btn-navy btn-xs" onClick={() => open({ kind: 'editFamily' })}>Edit Details</button></td></tr>)}</tbody>
          </table>
        )}
        {tab === 'Categories' && <div className="empty-hint" style={{ padding: 30 }}>No categories defined. Use the bulk template to categorise portfolios.</div>}
      </div>
    </ToolPanel>
  );
}

// ---- Corporate Actions (07-misc/01-corporate-actions.png) ---------------------------------------
export function CorporateActionsSheet({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  const [tab, setTab] = useState<'Current Holdings' | 'All Holdings'>('Current Holdings');
  const [rows, setRows] = useState<CorporateAction[]>([]);
  const [end, setEnd] = useState(() => new Date());
  useEffect(() => { void classicApi.corporateActions().then(setRows); }, []);
  const start = new Date(end); start.setDate(start.getDate() - 10);
  const shift = (days: number) => setEnd((d) => { const n = new Date(d); n.setDate(n.getDate() + days); return n; });
  return (
    <ToolPanel title="Corporate Actions for your stock holdings" titleTip="Corporate actions detected for stocks in your portfolios" onClose={onClose}
      headerLinks={<span className="hdr-link" onClick={() => open({ kind: 'notice', title: 'Corporate Actions Log', description: 'Corporate actions applied to your portfolios.' })}>Open Log</span>}
      footer={(
        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Corporate actions for your current stock holdings</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => shift(-3650)}>Go to Oldest</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => shift(-10)}>Older</button>
            <span style={{ fontSize: 14 }}>From {fmtDateSlash(start.toISOString())} to {fmtDateSlash(end.toISOString())}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => shift(10)}>Newer</button>
            <span className="spacer" style={{ flex: 1 }} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => open({ kind: 'notice', title: 'Add Corporate Action Manually', description: 'Record a bonus, split, merger or demerger for a stock in this portfolio.' })}>Add Manually</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => open({ kind: 'notice', title: 'Mutual Fund Corporate Actions', description: 'Scheme mergers and renames detected for your mutual funds.' })}>Mutual Funds</button>
          </div>
          <div style={{ fontSize: 10, textDecoration: 'underline', marginTop: 12 }}>Disclaimer</div>
        </div>
      )}>
      <div className="tool-subtabs">
        {(['Current Holdings', 'All Holdings'] as const).map((t) => <span key={t} className={`tool-subtab ${tab === t ? 'active' : ''}`} style={{ fontSize: 14 }} onClick={() => setTab(t)}>{t}<span className="tip" title="Filter by holdings">?</span></span>)}
      </div>
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, minHeight: 260 }}>
        <table className="data-table">
          <thead><tr><th>Type</th><th>Ex-Date</th><th>Stock Name</th><th>Action</th><th style={{ textAlign: 'right' }}>Applied <span className="tip" title="Whether the action has been applied to your holdings">?</span></th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td>{r.type}</td><td>{fmtDateSlash(r.exDate)}</td><td>{r.stockName}</td><td>{r.action}</td><td style={{ textAlign: 'right' }}>{r.applied ? 'Yes' : 'No'}</td></tr>)}</tbody>
        </table>
      </div>
    </ToolPanel>
  );
}

// ---- My Tasks (07-misc/08-my-tasks.png) ------------------------------------------------------------
export function MyTasksSheet({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'Pending' | 'Completed'>('Pending');
  const [filter, setFilter] = useState('All Tasks');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => { void classicApi.tasks().then(setTasks); }, [tick]);
  const shown = tasks.filter((t) => (tab === 'Pending' ? t.status !== 'Completed' : t.status === 'Completed') && (filter === 'All Tasks' || t.type === filter));
  return (
    <ToolPanel title="My Tasks" onClose={onClose}
      headerLinks={<Dropdown align="right" trigger={() => <span className="hdr-link" style={{ marginRight: 0, padding: '0 30px', borderLeft: '1px solid #e5e5e5', height: 60, display: 'inline-flex', alignItems: 'center', minWidth: 320, justifyContent: 'space-between' }}>Filter: {filter}<Caret /></span>}
        entries={['All Tasks', 'Import', 'Report', 'Reconciliation'].map((f) => ({ type: 'item' as const, label: f, onSelect: () => setFilter(f) }))} />}
      footer={(
        <>
          <div className="pager"><button type="button" className="btn btn-ghost btn-sm">Previous</button><span className="page">1</span><button type="button" className="btn btn-ghost btn-sm">Next</button></div>
          <span className="spacer" />
          <button type="button" className="btn btn-navy btn-sm">Show Tasks for All Users</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}><i className="fas fa-chevron-left" style={{ marginRight: 6 }} />Back</button>
        </>
      )}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="tool-subtabs" style={{ marginBottom: 16 }}>
          {(['Pending', 'Completed'] as const).map((t) => <span key={t} className={`tool-subtab ${tab === t ? 'active' : ''}`} style={{ fontSize: 14 }} onClick={() => setTab(t)}>{t}</span>)}
        </div>
        <span style={{ flex: 1 }} />
        <span className="material-icons" role="button" aria-label="Refresh" style={{ color: 'var(--navy-2)', cursor: 'pointer' }} onClick={() => setTick((t) => t + 1)}>refresh</span>
      </div>
      <div style={{ border: '1px solid #e5e5e5', borderRadius: 4, minHeight: 300 }}>
        <table className="data-table">
          <thead><tr><th>Status</th><th>Type</th><th>Date Created</th><th>Period</th><th>Details</th></tr></thead>
          <tbody>
            {shown.map((t) => <tr key={t.id}><td>{t.status}</td><td>{t.type}</td><td>{fmtDateSlash(t.dateCreated)}</td><td>{t.period}</td><td>{t.details}</td></tr>)}
            {shown.length === 0 && <tr><td colSpan={5} style={{ background: '#f5f7fa', fontWeight: 600 }}>No {tab.toLowerCase()} tasks found</td></tr>}
          </tbody>
        </table>
      </div>
    </ToolPanel>
  );
}

// ---- Reconcile Holdings (07-misc/05-reconcile-holdings.png) ------------------------------------------
export function ReconcileSheet({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  const [file, setFile] = useState('');
  return (
    <div className="sheet-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-header">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10 }}><i className="fas fa-search" style={{ color: 'var(--navy)' }} /><input style={{ border: 0, outline: 0, fontSize: 15, flex: 1 }} placeholder="Search for reconciliation files, example: holding statements / AUM files..." /></div>
          <span className="crumb" style={{ borderLeft: '1px solid #e5e5e5', cursor: 'pointer' }} onClick={() => open({ kind: 'notice', title: 'Recon Log', description: 'Past reconciliations and their results.' })}>Recon Log</span>
          <Dropdown align="right" trigger={() => <span className="crumb" style={{ height: 46, cursor: 'pointer' }}>Tools<Caret /></span>} entries={[{ type: 'item', label: 'Recon Favourites', onSelect: () => undefined }, { type: 'item', label: 'Download Recon Template', onSelect: () => undefined }]} />
          <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}><span className="material-icons">close</span></button>
        </div>
        <div className="sheet-body">
          <div style={{ width: '50%', borderRight: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 46, background: '#f0f3f7', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, color: '#9da8b5' }}><i className="fas fa-search" /><span>Search My Recon Favourites</span></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
              <span className="material-icons" style={{ fontSize: 96, color: '#3f8b5e' }}>find_in_page</span>
              <h3 style={{ fontSize: 16, margin: '20px 0 16px' }}>Upload AUM / Holding Statements to reconcile your data</h3>
              <p style={{ maxWidth: 420, fontSize: 14 }}>Compare asset quantities in your holding statements with your holdings to verify the accuracy of imported data</p>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 70 }}>
            <div style={{ width: 240 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>New Recon</div>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '2px dashed var(--navy-2)', background: '#f0f5fb', borderRadius: 4, padding: '40px 20px', cursor: 'pointer' }}>
                <input type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0]?.name ?? '')} />
                <span className="material-icons" style={{ fontSize: 48, color: 'var(--navy-2)' }}>image</span>
                <span className="btn btn-sm" style={{ background: '#fff', border: '1px solid #ddd', fontWeight: 600 }}>Upload File</span>
                <span style={{ fontSize: 13 }}>{file || 'or drop files to upload'}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Portfolio Cashflow Tracking (07-misc/06-cashflow-tracking.png) --------------------------------
export function CashflowSheet({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  return (
    <ToolPanel title="Portfolio Cashflow Tracking" onClose={onClose} footer={<div className="tool-callout" style={{ width: '100%', marginTop: 0 }}>Portfolio Cashflow Tracking Settings <button type="button" className="btn btn-navy btn-sm" onClick={() => open({ kind: 'portfolioMasters' })}>Click here</button></div>}>
      <p className="tool-intro">A portfolio that lets you to track cashflows is called a <strong>PMS portfolio</strong>.</p>
      <p className="tool-intro">You can create new PMS portfolios or convert existing portfolios to PMS portfolios to start adding cash inflows, outflows and daily balances.</p>
      <p className="tool-intro">To enable Cash Management for any portfolio, select the <strong>PMS portfolio</strong> setting under <a onClick={() => open({ kind: 'addPortfolio', variant: 'Portfolio' })}>Add Portfolio / Edit Portfolio</a> (see example below).</p>
      <p className="tool-intro">To update this setting across multiple portfolios in bulk, go to <a onClick={() => open({ kind: 'portfolioMasters' })}>Portfolio Masters</a> and use the <strong>Set PMS Categorisation</strong> bulk template.</p>
      <div style={{ margin: '10px auto', width: 320, border: '1px solid #333', borderRadius: 3, padding: 16, fontSize: 9, background: '#fff' }}>
        <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 12 }}>Edit Portfolio</div>
        {['Portfolio Name *', 'Full Name'].map((l) => <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ width: 90 }}>{l}</span><span style={{ flex: 1, height: 14, border: '1px solid #ccc' }} /></div>)}
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}><span style={{ width: 90 }}>Trading Portfolio</span><input type="checkbox" readOnly /></div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}><span style={{ width: 90 }}>PMS Portfolio</span><input type="checkbox" checked readOnly /></div>
        <div style={{ display: 'flex', gap: 6 }}><span style={{ background: 'var(--blue)', color: '#fff', padding: '3px 10px', borderRadius: 2 }}>Save</span><span style={{ border: '1px solid #ccc', padding: '3px 10px', borderRadius: 2 }}>Cancel</span><span style={{ border: '1px solid #ccc', padding: '3px 10px', borderRadius: 2 }}>Delete</span></div>
      </div>
    </ToolPanel>
  );
}

// ---- Goal & Strategy Tracking (07-misc/07-goal-strategy.png) ---------------------------------------
export function GoalStrategySheet({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  return (
    <ToolPanel title="Goal & Strategy Tracking" onClose={onClose} footer={<div className="tool-callout" style={{ width: '100%', marginTop: 0 }}>Follow a step-by-step tutorial <button type="button" className="btn btn-navy btn-sm" onClick={() => open({ kind: 'help' })}>Click here</button></div>}>
      <p className="tool-intro">Now you can track individual Goals, Strategies and Smallcases!</p>
      <p className="tool-intro">To get started, create <a onClick={() => open({ kind: 'addPortfolio', variant: 'Strategy/Goal Portfolio' })}>Goal/Strategy Portfolios</a> and add transactions to them from your investment portfolios. This will allow you to accurately track XIRR and P/L goal-wise and strategy-wise.</p>
      <table className="data-table" style={{ margin: '10px 0 20px', fontSize: 12 }}>
        <thead><tr><th /><th /><th>Date</th><th>Type</th><th>Asset</th><th style={{ textAlign: 'right' }}>Quantity</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
        <tbody>
          <tr style={{ background: '#f0f3f7' }}><td><Caret /></td><td><span className="material-icons" style={{ color: 'var(--green)', fontSize: 16 }}>check_circle</span></td><td>13/04/2022</td><td>Buy</td><td>Reliance Industries</td><td style={{ textAlign: 'right' }}>20</td><td style={{ textAlign: 'right' }}>2,714.32</td><td style={{ textAlign: 'right' }}>54,286.40</td></tr>
          <tr><td /><td><span className="material-icons" style={{ color: 'var(--green)', fontSize: 16 }}>check</span></td><td /><td style={{ color: 'var(--green)' }}>Strategy</td><td style={{ color: 'var(--green)' }}>All Weather (Strategy) ✕</td><td style={{ textAlign: 'right' }}>13</td><td style={{ textAlign: 'right' }}>2,714.32</td><td style={{ textAlign: 'right' }}>35,286.16</td></tr>
          <tr><td /><td><span className="material-icons" style={{ color: 'var(--green)', fontSize: 16 }}>check</span></td><td /><td style={{ color: 'var(--green)' }}>Strategy</td><td style={{ color: 'var(--green)' }}>Momentum (Strategy) ✕</td><td style={{ textAlign: 'right' }}>7</td><td style={{ textAlign: 'right' }}>2,714.32</td><td style={{ textAlign: 'right' }}>19,000.24</td></tr>
          <tr style={{ background: '#f0f3f7' }}><td><Caret /></td><td><span className="material-icons" style={{ color: 'var(--green)', fontSize: 16 }}>check_circle</span></td><td>06/04/2022</td><td>Buy</td><td>Hindustan Unilever</td><td style={{ textAlign: 'right' }}>30</td><td style={{ textAlign: 'right' }}>2,161.33</td><td style={{ textAlign: 'right' }}>64,839.90</td></tr>
          <tr><td /><td><span className="material-icons" style={{ color: 'var(--green)', fontSize: 16 }}>check</span></td><td /><td style={{ color: 'var(--green)' }}>Goal</td><td style={{ color: 'var(--green)' }}>Retirement (Goal) ✕</td><td style={{ textAlign: 'right' }}>30</td><td style={{ textAlign: 'right' }}>2,161.33</td><td style={{ textAlign: 'right' }}>64,839.90</td></tr>
        </tbody>
      </table>
      <p className="tool-intro"><strong>Smallcase Users</strong>: You can create strategy portfolios for every Smallcase that you invest in and track portfolio performance Smallcase-wise. Auto-forward your Smallcase order emails to have your trades mapped.</p>
    </ToolPanel>
  );
}

// ---- Branding (05-settings/04-branding.png) — "Mobile App upon launch" example intentionally omitted -------
export function BrandingSheet({ onClose }: { onClose: () => void }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 100 * 1024) { setErr('Logo must be 100kb or smaller'); return; }
    setErr(null);
    const reader = new FileReader(); reader.onload = () => setLogo(String(reader.result)); reader.readAsDataURL(f);
  };
  return (
    <ToolPanel title="Add your logo for branding & reporting" onClose={onClose} footer={(
      <div className="tool-callout" style={{ width: '100%', marginTop: 0 }}>
        Upload your logo (JPG/PNG, max size 100kb, recommended aspect ratio 4:1)
        <label className="btn btn-navy btn-sm" style={{ cursor: 'pointer' }}>Upload Logo<input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} /></label>
      </div>
    )}>
      <p className="tool-intro">You can now add your logo to your account and your shared logins. By doing so, <strong style={{ color: 'var(--text)' }}>your logo will be visible to you and your shared logins</strong> in the web application and all reports.</p>
      <p className="tool-intro">Here's an example of what a logo would look like:</p>
      {err && <div style={{ color: 'var(--red)', marginBottom: 10 }}>{err}</div>}
      <div className="branding-examples">
        <div className="branding-example">
          <h4>Web Application header</h4>
          <div className="branding-preview">
            <div className="bar">{logo ? <img src={logo} alt="Your logo" style={{ height: 22 }} /> : <span className="logo-slot">YOUR LOGO</span>}</div>
          </div>
        </div>
        <div className="branding-example">
          <h4>Reports header</h4>
          <div className="branding-preview report">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>{logo ? <img src={logo} alt="Your logo" style={{ height: 20 }} /> : <span className="logo-slot" style={{ borderColor: '#999', color: '#333' }}>YOUR LOGO</span>}<span style={{ fontSize: 10, fontWeight: 700 }}>Portfolio Summary Report</span></div>
            <span className="line" style={{ background: 'var(--navy)', height: 10 }} /><span className="line" /><span className="line" /><span className="line" /><span className="line" />
          </div>
        </div>
      </div>
    </ToolPanel>
  );
}
