import { Fragment, useMemo } from 'react';
import { fmtAmount, fmtSigned, fmtSignedPct } from '@mprofit/shared';
import { useOverlay } from '../../state/OverlayContext';
import { useWorkspace, type SidebarFilter } from '../../state/WorkspaceContext';
import { Caret, Dropdown, type MenuEntry } from '../Dropdown';

// Left sidebar (185px): Sensex/Nifty tickers, "All ▾" filter, portfolio tiles, Add Portfolio, Refer a friend.
export function Sidebar() {
  const { family, indices, mode, portfolios, portfolio, selectPortfolio, sidebarFilter, setSidebarFilter, sidebarCollapsed } = useWorkspace();
  const { open } = useOverlay();

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
              <div key={p.id} className={`tab-c ${portfolio?.id === p.id ? 'active' : ''}`} onClick={() => selectPortfolio(p.id)} title={p.fullName || p.shortName}>
                <span className="c-name">{p.shortName}</span>
                {p.isGroup && <span className="material-icons port-icon" style={{ fontSize: 16 }}>group</span>}
              </div>
            ))}
            {family ? (
              <button type="button" className="btn-add-port" onClick={() => open({ kind: 'addPortfolio', variant: 'Portfolio' })}>
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
            <div key={p.id} className={`tab-c ${portfolio?.id === p.id ? 'active' : ''}`} onClick={() => selectPortfolio(p.id)}>
              <span className="c-name">{p.shortName}</span>
            </div>
          ))}
          <button type="button" className="btn-add-port" style={{ margin: '10px 0 30px 0' }} onClick={() => open({ kind: 'addPortfolio', variant: 'Portfolio' })}>
            <span className="btn-add-icon">+</span><span className="add-port-label">Add Portfolio</span>
          </button>
        </div>
      )}
      {/* Live has a "Refer a friend" footer here — intentionally omitted (01-IN-SCOPE-OUT-OF-SCOPE.md). */}
    </aside>
  );
}
