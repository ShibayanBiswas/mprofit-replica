import { Fragment, useEffect, useMemo, useState } from 'react';
import { fmtAmount, fmtSigned, fmtSignedPct } from '@mprofit/shared';
import { useOverlay } from '../../state/OverlayContext';
import { useWorkspace, type SidebarFilter } from '../../state/WorkspaceContext';
import { Caret, Dropdown, type MenuEntry } from '../Dropdown';

// Left sidebar (185px): Sensex/Nifty tickers, "All ▾" filter, portfolio tiles, Add Portfolio, Refer a friend.
export function Sidebar() {
  const { family, indices, mode, portfolios, portfolio, selectPortfolio, sidebarFilter, setSidebarFilter, sidebarCollapsed } = useWorkspace();
  const { open } = useOverlay();
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const menuPortfolio = portfolios.find((p) => p.id === menu?.id) ?? null;

  useEffect(() => {
    if (!menu) return;
    let armed = false;
    const arm = window.setTimeout(() => { armed = true; }, 0);
    const close = () => { if (armed) setMenu(null); };
    document.addEventListener('mousedown', close);
    document.addEventListener('scroll', close, true);
    return () => { window.clearTimeout(arm); document.removeEventListener('mousedown', close); document.removeEventListener('scroll', close, true); };
  }, [menu]);

  const visible = useMemo(() => {
    const list = portfolios.filter((p) => (mode === 'FO' ? p.type === 'F&O' : p.type !== 'F&O'));
    if (sidebarFilter === 'Portfolios') return list.filter((p) => !p.isGroup);
    if (sidebarFilter === 'Groups') return list.filter((p) => p.isGroup);
    return list;
  }, [portfolios, mode, sidebarFilter]);

  const filterEntries: MenuEntry[] = (['All', 'Portfolios', 'Groups'] as SidebarFilter[]).map((f) => ({ type: 'item', label: f, onSelect: () => setSidebarFilter(f) }));

  return (
    <aside className={`left-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="market-update">
        {indices.map((i, idx) => (
          <Fragment key={i.code}>
            {idx > 0 && <div className="horizontal-line" />}
            <div>
              <div className="market-row">
                <span className="market-name">{i.name}<span className="market-tooltip" title={`${i.name} — live index value and change for the day`}>?</span></span>
                <span className={`index-value ${i.change >= 0 ? 'market-up' : 'market-down'}`}>{fmtSignedPct(i.changePct)}</span>
              </div>
              <div className="market-row">
                <span className="index-value">{fmtAmount(i.value)}</span>
                <span className={`index-value ${i.change >= 0 ? 'market-up' : 'market-down'}`}>{fmtSigned(i.change)}</span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      {mode === 'INV' ? (
        <>
          <div className="btn-port-filters-container">
            <Dropdown trigger={() => <button type="button" className="btn-port-filters"><span className="active-port-filter-text">{sidebarFilter}</span><Caret /></button>} entries={filterEntries} />
          </div>
          <div className="client-left-tab">
            {visible.map((p) => (
              <div key={p.id} className={`tab-c ${portfolio?.id === p.id ? 'active' : ''}`} onClick={() => selectPortfolio(p.id)} onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, id: p.id }); }} title={p.fullName || p.shortName}>
                <span className="c-name">{p.shortName}</span>
                {p.isGroup && <span className="material-icons port-icon" style={{ fontSize: 16 }}>group</span>}
              </div>
            ))}
            {family ? (
              <button type="button" className="btn-add-port" onClick={() => open({ kind: 'addPortfolio', variant: mode === 'FO' ? 'F&O' : 'Portfolio' })}>
                <span className="btn-add-icon">+</span><span className="add-port-label">Add Portfolio</span>
              </button>
            ) : (
              <button type="button" className="btn-add-port" onClick={() => open({ kind: 'addFamily' })}>
                <span className="btn-add-icon">+</span><span className="add-port-label">Add Family</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="client-left-tab">
          {visible.map((p) => (
            <div key={p.id} className={`tab-c ${portfolio?.id === p.id ? 'active' : ''}`} onClick={() => selectPortfolio(p.id)} onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, id: p.id }); }}>
              <span className="c-name">{p.shortName}</span>
            </div>
          ))}
          <button type="button" className="btn-add-port" style={{ margin: '10px 0 30px 0' }} onClick={() => open({ kind: 'addPortfolio', variant: mode === 'FO' ? 'F&O' : 'Portfolio' })}>
            <span className="btn-add-icon">+</span><span className="add-port-label">Add Portfolio</span>
          </button>
        </div>
      )}
      {menu && menuPortfolio && (
        <div className="port-context" style={{ left: menu.x, top: menu.y }} role="menu" onMouseDown={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => { selectPortfolio(menuPortfolio.id); setMenu(null); }}>View</button>
          <button type="button" onClick={() => { selectPortfolio(menuPortfolio.id); setMenu(null); open({ kind: 'action', action: 'editPortfolio' }); }}>{menuPortfolio.isGroup ? 'Edit Group' : 'Edit Portfolio'}</button>
          <button type="button" onClick={() => { setMenu(null); open({ kind: 'addPortfolio', variant: 'Portfolio' }); }}>New Portfolio</button>
          <button type="button" onClick={() => { setMenu(null); open({ kind: 'addPortfolio', variant: 'Group' }); }}>New Group</button>
        </div>
      )}
      {/* Live has a "Refer a friend" footer here — intentionally omitted (01-IN-SCOPE-OUT-OF-SCOPE.md). */}
    </aside>
  );
}
