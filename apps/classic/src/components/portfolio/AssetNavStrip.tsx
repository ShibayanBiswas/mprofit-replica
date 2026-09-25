import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractNotePath } from '../../app/routes';
import { useWorkspace } from '../../state/WorkspaceContext';

// Navy strip (38px) with scrollable asset-class tabs: [badge] Label | ...
export function AssetNavStrip() {
  const { dbId, family, portfolio, summary, assetClasses, mode, activeAssetCode, setActiveAssetCode } = useWorkspace();
  const navigate = useNavigate();
  const scroller = useRef<HTMLDivElement>(null);
  const tabs = assetClasses.filter((a) => a.mode === mode);
  const scrollBy = (dx: number) => scroller.current?.scrollBy({ left: dx, behavior: 'smooth' });

  // Live: a tab with no holdings jumps straight to that asset class's transaction-entry screen;
  // a tab with holdings just filters the table below.
  const openTab = (code: string) => {
    const hasRows = (summary?.rows ?? []).some((r) => r.assetClassCode === code);
    if (!hasRows && portfolio && !portfolio.isGroup) { navigate(contractNotePath(dbId, family?.id ?? '-', portfolio.id, code)); return; }
    setActiveAssetCode(code);
  };

  return (
    <div className="asset-nav-container">
      {mode === 'INV' && <div className="asset-nav-button asset-nav-prev" role="button" aria-label="Previous asset classes" onClick={() => scrollBy(-300)} />}
      <div className="asset-nav-scroll" ref={scroller}>
        {tabs.map((a) => (
          <div key={a.code} className={`asset-nav-item ${a.code === activeAssetCode ? 'active' : ''}`} onClick={() => openTab(a.code)}>
            <span className="asset-type-icon">{a.badge}</span>
            <span className="asset-type-name">{a.label}</span>
          </div>
        ))}
        {mode === 'FO' && <div style={{ flex: 1, background: 'var(--tab-strip)' }} />}
      </div>
      {mode === 'INV' && <div className="asset-nav-button asset-nav-next" role="button" aria-label="Next asset classes" onClick={() => scrollBy(300)} />}
    </div>
  );
}
