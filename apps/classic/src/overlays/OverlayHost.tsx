import { useOverlay, type OverlayKind } from '../state/OverlayContext';
import { ReportsSheet } from './ReportsSheet';
import { GlobalReportsSheet } from './GlobalReportsSheet';
import { ReportLogSheet } from './ReportLogSheet';
import { DashboardSheet } from './DashboardSheet';
import { PreferencesModal } from './PreferencesModal';
import { ImportModal } from './ImportModal';
import { ImportHub } from './ImportHub';
import { HelpPanel } from './HelpPanel';
import { WhatsNewModal } from './WhatsNewModal';
import { MyAccountModal, ChangePasswordModal, ContactSupportModal } from './AccountModals';
import { AddFamilyModal, EditFamilyModal, AddPortfolioModal, AddToStrategiesModal } from './PortfolioModals';
import { AddTransactionModal, XirrModal } from './TransactionModals';
import { ActionModal, NoticeModal } from './ActionModals';
import { AccessControlSheet, PortfolioMastersSheet, CorporateActionsSheet, MyTasksSheet, ReconcileSheet, CashflowSheet, GoalStrategySheet, BrandingSheet } from './ToolSheets';
import { GlobalAssetSearchModal, AutoTransferChargesModal, FoAutoSettlementModal, AdvisorProfileModal } from './ToolModals';
import { ApiConnectorModal } from './ApiConnectorModal';

// Renders the top of the overlay stack. Exhaustive so adding an OverlayKind without UI fails typecheck.
export function OverlayHost() {
  const { stack, close } = useOverlay();
  const top = stack[stack.length - 1];
  if (!top) return null;
  return <Overlay o={top} onClose={close} />;
}

function Overlay({ o, onClose }: { o: OverlayKind; onClose: () => void }) {
  switch (o.kind) {
    case 'reports': return <ReportsSheet initialCategoryId={o.categoryId} initialReportId={o.reportId} onClose={onClose} />;
    case 'reportLog': return <ReportLogSheet onClose={onClose} />;
    case 'globalReports': return <GlobalReportsSheet onClose={onClose} />;
    case 'dashboard': return <DashboardSheet onClose={onClose} />;
    case 'accessControl': return <AccessControlSheet onClose={onClose} />;
    case 'corporateActions': return <CorporateActionsSheet onClose={onClose} />;
    case 'globalAssetSearch': return <GlobalAssetSearchModal onClose={onClose} />;
    case 'autoTransferCharges': return <AutoTransferChargesModal onClose={onClose} />;
    case 'foAutoSettlement': return <FoAutoSettlementModal onClose={onClose} />;
    case 'portfolioMasters': return <PortfolioMastersSheet onClose={onClose} />;
    case 'reconcileHoldings': return <ReconcileSheet onClose={onClose} />;
    case 'cashflowTracking': return <CashflowSheet onClose={onClose} />;
    case 'goalStrategy': return <GoalStrategySheet onClose={onClose} />;
    case 'myTasks': return <MyTasksSheet onClose={onClose} />;
    case 'advisorProfile': return <AdvisorProfileModal onClose={onClose} />;
    case 'branding': return <BrandingSheet onClose={onClose} />;
    case 'import': return <ImportHub onClose={onClose} />;
    case 'importWizard': return <ImportModal initialStep={o.step} onClose={onClose} />;
    case 'addTransaction': return <AddTransactionModal guided={!!o.guided} onClose={onClose} />;
    case 'addPortfolio': return <AddPortfolioModal variant={o.variant} onClose={onClose} />;
    case 'addToStrategies': return <AddToStrategiesModal onClose={onClose} />;
    case 'addFamily': return <AddFamilyModal onClose={onClose} />;
    case 'editFamily': return <EditFamilyModal onClose={onClose} />;
    case 'preferences': return <PreferencesModal onClose={onClose} />;
    case 'help': return <HelpPanel onClose={onClose} />;
    case 'whatsNew': return <WhatsNewModal onClose={onClose} />;
    case 'myAccount': return <MyAccountModal onClose={onClose} />;
    case 'changePassword': return <ChangePasswordModal onClose={onClose} />;
    case 'contactSupport': return <ContactSupportModal onClose={onClose} />;
    case 'apiConnector': return <ApiConnectorModal provider={o.provider} onClose={onClose} />;
    case 'viewAllTransactions': return null; // rendered inline by PortfolioPage
    case 'xirr': return <XirrModal withZero={o.withZero} onClose={onClose} />;
    case 'action': return <ActionModal action={o.action} onClose={onClose} />;
    case 'notice': return <NoticeModal title={o.title} description={o.description} onClose={onClose} />;
    default: {
      const _exhaustive: never = o;
      return _exhaustive;
    }
  }
}
