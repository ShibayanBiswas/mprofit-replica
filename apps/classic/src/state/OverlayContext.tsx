import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

// Every Classic overlay (modal, side panel, full-screen sheet) is identified here so the click-flow is explicit.
export type OverlayKind =
  | { kind: 'reports'; categoryId?: string; reportId?: string }
  | { kind: 'reportLog' }
  | { kind: 'globalReports' }
  | { kind: 'dashboard' }
  | { kind: 'accessControl' }
  | { kind: 'corporateActions' }
  | { kind: 'globalAssetSearch' }
  | { kind: 'autoTransferCharges' }
  | { kind: 'foAutoSettlement' }
  | { kind: 'portfolioMasters' }
  | { kind: 'reconcileHoldings' }
  | { kind: 'cashflowTracking' }
  | { kind: 'goalStrategy' }
  | { kind: 'myTasks' }
  | { kind: 'advisorProfile' }
  | { kind: 'branding' }
  | { kind: 'import' }
  | { kind: 'importWizard'; step?: 'Stocks' | 'Mutual Funds' | 'Banks' | 'F&O' | 'Others' }
  | { kind: 'addTransaction'; guided?: boolean }
  | { kind: 'addPortfolio'; variant: 'Portfolio' | 'Group' | 'Entity' | 'Strategy/Goal Portfolio' | 'International Portfolio' | 'Account Portfolio for Tally Integration' }
  | { kind: 'addToStrategies' }
  | { kind: 'addFamily' }
  | { kind: 'editFamily' }
  | { kind: 'preferences' }
  | { kind: 'help' }
  | { kind: 'whatsNew' }
  | { kind: 'myAccount' }
  | { kind: 'changePassword' }
  | { kind: 'contactSupport' }
  | { kind: 'apiConnector'; provider: 'MF CAS' | 'Zerodha' | 'Dhan' }
  | { kind: 'viewAllTransactions' }
  | { kind: 'xirr'; withZero: boolean }
  | { kind: 'action'; action: ActionKind }
  // Simple titled acknowledgement used by flows whose depth belongs to the backend phase.
  | { kind: 'notice'; title: string; description: string };

// The eight Actions-menu dialogs, keyed in live's menu order.
export type ActionKind =
  | 'copyMovePortfolio'
  | 'editPortfolio'
  | 'editBroker'
  | 'bulkDeleteTransactions'
  | 'deleteUnusedAssetGlobally'
  | 'deleteUnusedAssetFromPortfolio'
  | 'historicalValuations'
  | 'historicalPrices';

interface OverlayState {
  stack: OverlayKind[];
  open: (o: OverlayKind) => void;
  replace: (o: OverlayKind) => void;
  close: () => void;
  closeAll: () => void;
}

const OverlayContext = createContext<OverlayState | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<OverlayKind[]>([]);
  const open = useCallback((o: OverlayKind) => setStack((s) => [...s, o]), []);
  const replace = useCallback((o: OverlayKind) => setStack((s) => [...s.slice(0, -1), o]), []);
  const close = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const closeAll = useCallback(() => setStack([]), []);
  const value = useMemo(() => ({ stack, open, replace, close, closeAll }), [stack, open, replace, close, closeAll]);
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayState {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay outside OverlayProvider');
  return ctx;
}
