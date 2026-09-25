import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../BrandMark';
import { Caret, Dropdown, type MenuEntry } from '../Dropdown';
import { useOverlay } from '../../state/OverlayContext';
import { useSession } from '../../state/SessionContext';
import { useWorkspace } from '../../state/WorkspaceContext';
import { analyticsPath, LOGIN_PATH } from '../../app/routes';

// Top navigation (40px navy band). Order and labels match the live shell:
// API ▾ | Import | Analytics [NEW] | Tools ▾ | Help | 🎁 | 👤 Display name ▾
export function TopNav() {
  const { open } = useOverlay();
  const { user, logout } = useSession();
  const { dbId, family, portfolio } = useWorkspace();
  const navigate = useNavigate();

  const apiEntries: MenuEntry[] = [
    { type: 'item', label: 'MF CAS', onSelect: () => open({ kind: 'apiConnector', provider: 'MF CAS' }), trailing: <img className="broker-mini" src="/assets/icons/brokers/mf-central_small.png" alt="" /> },
    { type: 'item', label: 'Zerodha', onSelect: () => open({ kind: 'apiConnector', provider: 'Zerodha' }), trailing: <img className="broker-mini" src="/assets/icons/brokers/zerodha_small.jpg" alt="" /> },
    { type: 'item', label: 'Dhan', onSelect: () => open({ kind: 'apiConnector', provider: 'Dhan' }), trailing: <img className="broker-mini" src="/assets/icons/brokers/dhan_small.svg" alt="" /> },
  ];

  const toolsEntries: MenuEntry[] = [
    { type: 'item', label: 'Global Reports', onSelect: () => open({ kind: 'globalReports' }) },
    { type: 'item', label: 'Dashboard', onSelect: () => open({ kind: 'dashboard' }) },
    { type: 'item', label: 'Access Control', onSelect: () => open({ kind: 'accessControl' }) },
    { type: 'divider' },
    { type: 'item', label: 'Corporate Actions', onSelect: () => open({ kind: 'corporateActions' }) },
    { type: 'item', label: 'Global Asset Search', onSelect: () => open({ kind: 'globalAssetSearch' }) },
    { type: 'item', label: 'Auto-transfer of Charges', onSelect: () => open({ kind: 'autoTransferCharges' }) },
    { type: 'item', label: 'F&O Auto-settlement', onSelect: () => open({ kind: 'foAutoSettlement' }) },
    { type: 'divider' },
    { type: 'item', label: 'Portfolio Masters', onSelect: () => open({ kind: 'portfolioMasters' }) },
    { type: 'item', label: 'Reconcile Holdings', onSelect: () => open({ kind: 'reconcileHoldings' }) },
    { type: 'item', label: 'Portfolio Cashflow Tracking', onSelect: () => open({ kind: 'cashflowTracking' }) },
    { type: 'item', label: 'Goal & Strategy Tracking', onSelect: () => open({ kind: 'goalStrategy' }) },
    { type: 'divider' },
    { type: 'item', label: 'My Tasks', onSelect: () => open({ kind: 'myTasks' }) },
    { type: 'item', label: 'Advisor / Company Profile', onSelect: () => open({ kind: 'advisorProfile' }) },
    { type: 'item', label: 'Branding (Add Your Logo)', onSelect: () => open({ kind: 'branding' }) },
  ];

  const userEntries: MenuEntry[] = [
    { type: 'item', label: 'My Account', onSelect: () => open({ kind: 'myAccount' }) },
    { type: 'item', label: 'Help Center', onSelect: () => open({ kind: 'help' }) },
    { type: 'item', label: 'Contact Support', onSelect: () => open({ kind: 'contactSupport' }) },
    { type: 'item', label: 'Logout', onSelect: () => { void logout().then(() => navigate(LOGIN_PATH, { replace: true })); } },
    // Live shows a divider + "MProfit Cloud v1.39.1" here — version string intentionally omitted.
  ];

  const goAnalytics = () => {
    if (!family || !portfolio) return;
    window.location.assign(analyticsPath(dbId, family.id, portfolio.id, 'today'));
  };

  return (
    <header className="topnav">
      <BrandMark variant="shell" />
      <nav className="topnav-right">
        <Dropdown className="topnav-dd" menuClassName="api-menu" trigger={() => <button type="button" className="topnav-item">API<Caret /></button>} entries={apiEntries} />
        <button type="button" className="topnav-item" onClick={() => open({ kind: 'import' })}>Import</button>
        <button type="button" className="topnav-item has-badge" onClick={goAnalytics} style={{ marginRight: 34 }}>
          Analytics
          <img className="topnav-new-badge" src="/assets/icons/chrome-ui/new-badge-live.svg" alt="" />
        </button>
        <Dropdown className="topnav-dd" menuClassName="tools-menu" trigger={() => <button type="button" className="topnav-item">Tools<Caret /></button>} entries={toolsEntries} />
        <button type="button" className="topnav-item" onClick={() => open({ kind: 'help' })}>Help</button>
        <button type="button" className="topnav-item topnav-gift" aria-label="What's new" onClick={() => open({ kind: 'whatsNew' })}><i className="fas fa-gift" /></button>
        <Dropdown className="topnav-dd" align="right" menuClassName="user-menu" trigger={() => (
          <button type="button" className="topnav-item topnav-user"><i className="fas fa-user" />{user?.displayName ?? ''}<Caret /></button>
        )} entries={userEntries} />
      </nav>
    </header>
  );
}
