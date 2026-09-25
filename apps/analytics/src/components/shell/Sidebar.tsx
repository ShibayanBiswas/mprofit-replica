import { useEffect, useState, type ReactNode } from 'react';
import { fmtAmount, fmtSigned, fmtSignedPct, initials } from '@mprofit/shared';
import { useWorkspace, type ViewBy } from '../../state/WorkspaceContext';
import { useOverlay } from '../../state/OverlayContext';
import { BrandMark } from '../BrandMark';
import { ChevronDownIcon, ChevronRightIcon, CollapseIcon, DashboardIcon, DotsIcon, EquityExposureIcon, GroupIcon, PersonIcon, PlusIcon, PortfolioIcon, SwapIcon, TriangleIcon } from '../ui/Icons';
import { Menu } from '../ui/Primitives';

const ACTIVE = '#d0e3bb';
const IDLE = '#babdcc';

export function Sidebar() {
  const { collapsed, setCollapsed, page } = useWorkspace();
  return collapsed ? <Rail onExpand={() => setCollapsed(false)} page={page} /> : <Drawer onCollapse={() => setCollapsed(true)} page={page} />;
}

// ---- Expanded drawer (320px) --------------------------------------------------------------------
function Drawer({ onCollapse, page }: { onCollapse: () => void; page: string }) {
  const { family, portfolio, viewBy, setViewBy, goPage } = useWorkspace();
  const [portfoliosOpen, setPortfoliosOpen] = useState(false);
  const isDash = page === 'today' || page === 'holding' || page === 'performance';
  const isSummary = page === 'summary';
  const isEq = page === 'equity-exposure';
  const displayName = portfolio ? (portfolio.isGroup ? portfolio.shortName : portfolio.fullName || portfolio.shortName) : '';

  return (
    <aside className="an-drawer">
      <div className="an-drawer-top">
        <BrandMark />
        <button type="button" className="an-icon-btn" aria-label="Collapse sidebar" onClick={onCollapse}><CollapseIcon /></button>
      </div>

      <button type="button" className="an-family-tile apptour-today-portfolioselect" onClick={() => setPortfoliosOpen((o) => !o)}>
        <span className="an-family-tile-name">{family?.name ?? ''}</span>
        <span className="an-family-tile-port" title={displayName}>{displayName}</span>
        <span className="an-family-tile-chev" style={{ transform: portfoliosOpen ? 'rotate(180deg)' : undefined }}><ChevronDownIcon /></span>
      </button>

      {portfoliosOpen ? (
        <PortfolioDropdown onPicked={() => setPortfoliosOpen(false)} />
      ) : (
        <>
          <nav className="an-nav">
            <NavItem label="Dashboard" active={isDash} icon={<DashboardIcon color={isDash ? ACTIVE : IDLE} />} onClick={() => goPage('today')} />
            <NavItem label="Portfolio" active={isSummary} icon={<PortfolioIcon color={isSummary ? ACTIVE : IDLE} />} onClick={() => goPage('summary')} />
            <div className="an-side-tabs" role="tablist">
              {(['Category', 'Asset Class'] as ViewBy[]).map((v) => (
                <button key={v} type="button" role="tab" aria-selected={viewBy === v} className={viewBy === v ? 'active' : ''} onClick={() => setViewBy(v)}>{v}</button>
              ))}
            </div>
          </nav>
          <div className="an-drawer-spacer" />
          <div className="an-nav an-nav-bottom">
            <span className="an-nav-divider" />
            <NavItem label="Equity Exposure" active={isEq} icon={<EquityExposureIcon color={isEq ? ACTIVE : IDLE} />} onClick={() => goPage('equity-exposure')} iconGap={8} />
          </div>
          <IndexCard />
        </>
      )}
    </aside>
  );
}

function NavItem({ label, icon, active, onClick, iconGap = 16 }: { label: string; icon: ReactNode; active: boolean; onClick: () => void; iconGap?: number }) {
  return (
    <button type="button" className={`an-nav-item ${active ? 'active' : ''}`} onClick={onClick} aria-current={active ? 'page' : undefined}>
      <span className="an-nav-icon">{icon}</span>
      <span className="an-nav-label" style={{ marginLeft: iconGap }}>{label}</span>
    </button>
  );
}

// ---- In-drawer portfolio dropdown (dark panel listing Groups / Portfolios of the current family) ----
function PortfolioDropdown({ onPicked }: { onPicked: () => void }) {
  const { family, portfolios, ctx, selectPortfolio } = useWorkspace();
  const { open } = useOverlay();
  const groups = portfolios.filter((p) => p.isGroup);
  const members = portfolios.filter((p) => !p.isGroup);
  const pick = (id: string) => { selectPortfolio(id); onPicked(); };
  return (
    <div className="an-port-dd portfolioDropdown_familyMembers">
      <div className="an-port-dd-head">
        <span>{family?.name ?? ''}</span>
        <button type="button" className="an-icon-btn" aria-label="Switch family" onClick={() => { open({ kind: 'familyPicker' }); onPicked(); }}><SwapIcon /></button>
      </div>
      <hr className="an-port-dd-hr" />
      <div className="an-port-dd-section">
        <span>Groups</span>
        <button type="button" className="an-icon-btn" aria-label="Add group" onClick={() => open({ kind: 'addPortfolio', variant: 'Group' })}><PlusIcon /></button>
      </div>
      <ul>
        {groups.map((g) => (
          <li key={g.id}><button type="button" className={g.id === ctx.portfolioId ? 'current' : ''} onClick={() => pick(g.id)}><GroupIcon color="#babdcc" /><span>{g.shortName}</span></button></li>
        ))}
      </ul>
      <div className="an-port-dd-section">
        <span>Portfolios</span>
        <button type="button" className="an-icon-btn" aria-label="Add portfolio" onClick={() => open({ kind: 'addPortfolio', variant: 'Portfolio' })}><PlusIcon /></button>
      </div>
      <ul>
        {members.map((p) => (
          <li key={p.id}><button type="button" className={p.id === ctx.portfolioId ? 'current' : ''} onClick={() => pick(p.id)}><PersonIcon color="#babdcc" /><span>{p.shortName}</span></button></li>
        ))}
      </ul>
    </div>
  );
}

// ---- Index card (BSE Sensex … with < > to cycle and ⋯ → Configure indices) ----------------------------
function IndexCard() {
  const { indices } = useWorkspace();
  const { open } = useOverlay();
  const [i, setI] = useState(0);
  useEffect(() => { if (i >= indices.length) setI(0); }, [indices.length, i]);
  const idx = indices[i];
  if (!idx) return <div className="an-index-card" />;
  const up = idx.change >= 0;
  return (
    <div className="an-index-card">
      <div className="an-index-card-head">
        <span className="an-index-card-name">{idx.name}</span>
        <Menu align="right" trigger={() => <button type="button" className="an-icon-btn" aria-label="Index options"><DotsIcon /></button>} items={[{ label: 'Configure indices', onSelect: () => open({ kind: 'changeIndices' }) }]} />
      </div>
      <div className="an-index-card-value">{fmtAmount(idx.value)}</div>
      <div className="an-index-card-foot">
        <span className={`an-index-chip ${up ? 'up' : 'down'}`}><TriangleIcon size={16} color="#fff" down={!up} />{fmtSignedPct(idx.changePct).replace('+', '')}</span>
        <span className="an-index-change">{fmtSigned(idx.change)}</span>
        <span className="an-index-arrows">
          <button type="button" aria-label="Previous index" disabled={i === 0} onClick={() => setI((n) => Math.max(0, n - 1))}><ChevronRightIcon left color={i === 0 ? '#64677A' : '#fff'} /></button>
          <button type="button" aria-label="Next index" disabled={i >= indices.length - 1} onClick={() => setI((n) => Math.min(indices.length - 1, n + 1))}><ChevronRightIcon color={i >= indices.length - 1 ? '#64677A' : '#fff'} /></button>
        </span>
      </div>
    </div>
  );
}

// ---- Collapsed rail (65px) ------------------------------------------------------------------------
function Rail({ onExpand, page }: { onExpand: () => void; page: string }) {
  const { family, goPage } = useWorkspace();
  const { open } = useOverlay();
  const isDash = page === 'today' || page === 'holding' || page === 'performance';
  const isSummary = page === 'summary';
  const isEq = page === 'equity-exposure';
  return (
    <aside className="an-rail">
      <button type="button" className="an-icon-btn an-rail-expand" aria-label="Expand sidebar" onClick={onExpand}><CollapseIcon size={26} style={{ transform: 'rotate(180deg)' }} /></button>
      <button type="button" className="an-rail-tile" title={family?.name ?? ''} onClick={() => open({ kind: 'familyPicker' })}>{initials(family?.name ?? '', 2)}</button>
      <span className="an-rail-divider" />
      <button type="button" className={`an-rail-item ${isDash ? 'active' : ''}`} aria-label="Dashboard" onClick={() => goPage('today')}><DashboardIcon size={26} color={isDash ? ACTIVE : IDLE} /></button>
      <button type="button" className={`an-rail-item ${isSummary ? 'active' : ''}`} aria-label="Portfolio" onClick={() => goPage('summary')}><PortfolioIcon size={26} color={isSummary ? ACTIVE : IDLE} /></button>
      <span className="an-rail-divider" />
      <div className="an-drawer-spacer" />
      <span className="an-rail-divider" />
      <button type="button" className={`an-rail-item ${isEq ? 'active' : ''}`} aria-label="Equity Exposure" onClick={() => goPage('equity-exposure')}><EquityExposureIcon size={26} color={isEq ? ACTIVE : IDLE} /></button>
    </aside>
  );
}
