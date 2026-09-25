import { useEffect, useRef, useState } from 'react';
import { initials } from '@mprofit/shared';
import type { SearchHit } from '@mprofit/shared';
import { analyticsApi } from '../../api/analyticsApi';
import { useSession } from '../../state/SessionContext';
import { useWorkspace } from '../../state/WorkspaceContext';
import { useOverlay } from '../../state/OverlayContext';
import { classicPath, CLASSIC_LOGIN } from '../../app/routes';
import { DocIcon, ExternalIcon, GroupIcon, HeadsetIcon, HelpIcon, InfoCircleIcon, ListIcon, LogoutIcon, PersonIcon, SearchIcon, WrenchIcon } from '../ui/Icons';
import { Menu } from '../ui/Primitives';

export function TopBar() {
  const { user, logout } = useSession();
  const { ctx, goPage } = useWorkspace();
  const { open } = useOverlay();

  const goClassic = () => window.location.assign(classicPath(ctx));
  const doLogout = () => { void logout().then(() => window.location.assign(CLASSIC_LOGIN)); };

  return (
    <header className="an-topbar dashboardMainHeader">
      <GlobalSearch />
      <div className="an-topbar-right">
        <button type="button" className="an-classic-btn" onClick={goClassic}><ExternalIcon />Classic View</button>
        <Menu align="right" trigger={(o) => <button type="button" className={`an-icon-btn an-topbar-icon ${o ? 'open' : ''}`} aria-label="Settings"><WrenchIcon /></button>}
          items={[
            { label: 'Custom Categories', onSelect: () => goPage('custom-categories') },
            { label: 'Benchmark Settings', onSelect: () => goPage('default-benchmark') },
          ]} />
        <Menu align="right" trigger={(o) => <button type="button" className={`an-icon-btn an-topbar-icon ${o ? 'open' : ''}`} aria-label="Reports"><ListIcon /></button>}
          items={[{ label: 'Report Studio', icon: <DocIcon />, trailing: <span className="an-beta-chip">BETA</span>, onSelect: () => goPage('custom-report-builder') }]} />
        <Menu align="right" menuClassName="an-user-menu"
          trigger={() => <button type="button" className="an-avatar" aria-haspopup="menu">{initials(user?.displayName ?? 'U', 1)}</button>}
          header={(
            <div className="an-user-head">
              <span className="an-avatar an-avatar-sm">{initials(user?.displayName ?? 'U', 1)}</span>
              <div><div className="an-user-name">{user?.displayName}</div><div className="an-user-email">{user?.email}</div></div>
            </div>
          )}
          items={[
            { label: 'Help Center', icon: <HelpIcon />, onSelect: () => open({ kind: 'helpCenter' }) },
            { label: 'Contact Support', icon: <HeadsetIcon />, onSelect: () => open({ kind: 'contactSupport' }) },
            { label: 'App Tour', icon: <InfoCircleIcon />, onSelect: () => open({ kind: 'appTour' }) },
            { label: <span className="an-menu-sep-before">Logout</span>, icon: <LogoutIcon />, onSelect: doLogout },
          ]}
        />
        {/* Live shows a divider + "MProfit Analytics" product label under Logout — brand string intentionally omitted (white-label). */}
      </div>
    </header>
  );
}

// "Search assets or portfolios" with a Portfolio result group (name · "<Family> Family").
function GlobalSearch() {
  const { selectPortfolio, ctx } = useWorkspace();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) { setHits([]); return; }
    const t = setTimeout(() => { void analyticsApi.search(q.trim()).then((h) => { setHits(h); setOpen(true); }); }, 120);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className={`an-gsearch ${open && q ? 'open' : ''}`}>
      <label className="an-gsearch-field">
        <SearchIcon size={40} color="#babdcc" />
        <input value={q} placeholder="Search assets or portfolios" onChange={(e) => setQ(e.target.value)} onFocus={() => q && setOpen(true)} />
        {q && <button type="button" className="an-gsearch-clear" onClick={() => { setQ(''); setHits([]); }}><span>clear</span><span className="an-gsearch-x">×</span></button>}
      </label>
      {open && q && (
        <div className="an-gsearch-pop">
          <div className="an-gsearch-group">Portfolio</div>
          {hits.length === 0 && <div className="an-gsearch-empty">No results</div>}
          <ul>
            {hits.map((h) => (
              <li key={h.portfolioId}>
                <button type="button" onClick={() => { selectPortfolio(h.portfolioId, h.familyId || ctx.familyId); setOpen(false); setQ(''); }}>
                  {h.isGroup ? <GroupIcon /> : <PersonIcon />}
                  <span className="an-gsearch-name">{h.portfolioName}</span>
                  <span className="an-gsearch-fam">{h.familyName} Family</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
