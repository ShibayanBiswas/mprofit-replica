import { useState } from 'react';
import { useOverlay, type ActionKind } from '../../state/OverlayContext';
import { useWorkspace } from '../../state/WorkspaceContext';
import { Caret, Dropdown, type MenuEntry } from '../Dropdown';
import { analyticsPath, type AnalyticsPage } from '../../app/routes';

// Nav row (41px): left = sidebar toggle + INV | F&O pills (185px); right = portfolio toolbar.
export function NavRow({ onAssetSearch }: { onAssetSearch: (q: string) => void }) {
  const { mode, setMode, toggleSidebar } = useWorkspace();
  return (
    <div className="nav-row">
      <div className="nav-row-left">
        <span className="sidebar-toggle" onClick={toggleSidebar} role="button" aria-label="Toggle sidebar"><i className="fas fa-chevron-left" /></span>
        <ul className="cloud-tabs">
          <li className={mode === 'INV' ? 'active' : ''} onClick={() => setMode('INV')}><a>INV</a></li>
          <li className={mode === 'FO' ? 'active' : ''} onClick={() => setMode('FO')}><a>F&amp;O</a></li>
        </ul>
      </div>
      {mode === 'INV' ? <Toolbar onAssetSearch={onAssetSearch} /> : <div className="toolbar" />}
    </div>
  );
}

function Toolbar({ onAssetSearch }: { onAssetSearch: (q: string) => void }) {
  const { open } = useOverlay();
  const { dbId, family, portfolio, preferences } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  const go = (page: AnalyticsPage) => { if (family && portfolio) window.location.assign(analyticsPath(dbId, family.id, portfolio.id, page)); };

  const xirrEntries: MenuEntry[] = [
    { type: 'item', label: 'Portfolio XIRR (without zero holdings)', onSelect: () => open({ kind: 'xirr', withZero: false }) },
    { type: 'item', label: 'Portfolio XIRR (with zero holdings)', onSelect: () => open({ kind: 'xirr', withZero: true }) },
  ];
  const act = (action: ActionKind) => () => open({ kind: 'action', action });
  const actionsEntries: MenuEntry[] = [
    { type: 'item', label: 'View All Transactions', onSelect: () => open({ kind: 'viewAllTransactions' }) },
    { type: 'item', label: 'Auto Corporate Actions', onSelect: () => open({ kind: 'corporateActions' }) },
    { type: 'divider' },
    { type: 'item', label: 'Copy / Move Portfolio', onSelect: act('copyMovePortfolio') },
    { type: 'item', label: 'Edit Portfolio Details', onSelect: act('editPortfolio') },
    { type: 'item', label: 'Edit Broker / Other Entity', onSelect: act('editBroker') },
    { type: 'divider' },
    { type: 'item', label: 'Bulk Delete Transactions', onSelect: act('bulkDeleteTransactions') },
    { type: 'item', label: 'Delete Unused Asset Globally', onSelect: act('deleteUnusedAssetGlobally') },
    { type: 'item', label: 'Delete Unused Asset from Portfolio', onSelect: act('deleteUnusedAssetFromPortfolio') },
    { type: 'divider' },
    { type: 'item', label: 'Set Historical Valuations Manually', onSelect: act('historicalValuations') },
    { type: 'item', label: 'Set Historical Prices Manually', onSelect: act('historicalPrices') },
  ];
  const addEntries: MenuEntry[] = [
    { type: 'item', label: 'Add Transaction', onSelect: () => open({ kind: 'addTransaction' }) },
    { type: 'item', label: 'Add Transaction (Guided)', onSelect: () => open({ kind: 'addTransaction', guided: true }) },
    { type: 'divider' },
    { type: 'item', label: 'Add Portfolio', onSelect: () => open({ kind: 'addPortfolio', variant: 'Portfolio' }) },
    { type: 'item', label: 'Add Group', onSelect: () => open({ kind: 'addPortfolio', variant: 'Group' }) },
    { type: 'item', label: 'Add Entity', onSelect: () => open({ kind: 'addPortfolio', variant: 'Entity' }) },
    { type: 'item', label: 'Add Strategy/Goal Portfolio', onSelect: () => open({ kind: 'addPortfolio', variant: 'Strategy/Goal Portfolio' }) },
    { type: 'item', label: 'Add International Portfolio', onSelect: () => open({ kind: 'addPortfolio', variant: 'International Portfolio' }) },
    { type: 'item', label: 'Add Account Portfolio for Tally Integration', onSelect: () => open({ kind: 'addPortfolio', variant: 'Account Portfolio for Tally Integration' }) },
    { type: 'divider' },
    { type: 'item', label: 'Add to Strategies / Goals', onSelect: () => open({ kind: 'addToStrategies' }) },
  ];

  const label = portfolio?.isGroup ? 'Group:' : 'Portfolio:';
  const name = portfolio ? (!portfolio.isGroup && preferences?.showPortfolioFullName === 'Yes' && portfolio.fullName ? portfolio.fullName : portfolio.shortName) : '—';

  return (
    <div className="toolbar">
      <button type="button" className="analytics-summary-btn" aria-label="Analytics summary" onClick={() => go('today')}>
        <img src="/assets/icons/chrome-ui/analytics-summary-icon.svg" alt="" />
      </button>
      <span className="toolbar-port-label">{label}<span className="port">{name}</span>{portfolio?.isGroup && <span className="material-icons" style={{ fontSize: 16, marginLeft: 6, color: 'var(--navy-2)' }}>group</span>}</span>
      <div className="toolbar-actions">
        {searchOpen ? (
          <span className="toolbar-asset-search"><input autoFocus placeholder="Search Assets" value={q} onChange={(e) => { setQ(e.target.value); onAssetSearch(e.target.value); }} onBlur={() => { if (!q) setSearchOpen(false); }} /></span>
        ) : (
          <button type="button" className="action-btn" aria-label="Search assets" onClick={() => setSearchOpen(true)}><i className="fas fa-search" style={{ color: 'var(--navy-2)' }} /></button>
        )}
        <Dropdown className="toolbar-dd" trigger={() => <button type="button" className="action-btn" aria-label="Add"><span className="btn-add-icon" style={{ marginRight: 0 }}>+</span></button>} entries={addEntries} />
        {/* Live emits a literal space between the label and the caret, which widens each of these
            four buttons by ~2.8px and shifts the whole right-aligned group. Keep the {' '}. */}
        <Dropdown className="toolbar-dd" trigger={() => <button type="button" className="action-btn">XIRR{' '}<Caret /></button>} entries={xirrEntries} />
        <Dropdown className="toolbar-dd" trigger={() => <button type="button" className="action-btn">Actions{' '}<Caret /></button>} entries={actionsEntries} />
        <button type="button" className="action-btn" onClick={() => open({ kind: 'preferences' })}>Preferences{' '}<Caret /></button>
        <button type="button" className="action-btn" onClick={() => open({ kind: 'reports' })}>Reports{' '}<Caret /></button>
        <Dropdown className="toolbar-dd" align="right" menuClassName="analytics-preview-menu" trigger={() => (
          <button type="button" className="analytics-cta-btn" aria-label="Open Analytics"><img src="/assets/icons/chrome-ui/analytics-cta-icon.svg" alt="" /></button>
        )}>
          <AnalyticsPreviewCard label="Today" icon="today" onClick={() => go('today')} />
          <span className="analytics-preview-divider" />
          <AnalyticsPreviewCard label="Holdings" icon="pie_chart" onClick={() => go('holding')} />
          <span className="analytics-preview-divider" />
          <AnalyticsPreviewCard label="Performance" icon="show_chart" onClick={() => go('performance')} />
          <span className="analytics-preview-divider" />
          <AnalyticsPreviewCard label="Equity Exposure" icon="bubble_chart" onClick={() => go('equity-exposure')} />
        </Dropdown>
      </div>
    </div>
  );
}

function AnalyticsPreviewCard({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <div className="analytics-preview-card" onClick={onClick} role="menuitem">
      <div className="preview-img"><span className="material-icons" style={{ fontSize: 34 }}>{icon}</span></div>
      <span className="analytics-preview-label">{label}</span>
    </div>
  );
}
