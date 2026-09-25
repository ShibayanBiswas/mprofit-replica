import { useState } from 'react';
import { TopNav } from '../components/shell/TopNav';
import { FamilyBar } from '../components/shell/FamilyBar';
import { NavRow } from '../components/shell/NavRow';
import { Sidebar } from '../components/shell/Sidebar';
import { AssetNavStrip } from '../components/portfolio/AssetNavStrip';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { ViewAllTransactionsPanel } from '../components/portfolio/ViewAllTransactionsPanel';
import { OverlayHost } from '../overlays/OverlayHost';
import { useOverlay } from '../state/OverlayContext';

// Classic main screen: topnav → family bar → nav row → [sidebar | asset strip + holdings]. Overlays render on top.
export function PortfolioPage() {
  const [assetQuery, setAssetQuery] = useState('');
  const { stack, close } = useOverlay();
  const inlinePanel = stack.find((o) => o.kind === 'viewAllTransactions');

  return (
    <div className="shell">
      <TopNav />
      <FamilyBar />
      <NavRow onAssetSearch={setAssetQuery} />
      <div className="shell-body">
        <Sidebar />
        <main className="middle-container">
          <div className="middle-container-inner">
            {inlinePanel ? (
              <ViewAllTransactionsPanel onBack={close} />
            ) : (
              <>
                <AssetNavStrip />
                <HoldingsTable externalQuery={assetQuery} />
              </>
            )}
          </div>
        </main>
      </div>
      <OverlayHost />
    </div>
  );
}
