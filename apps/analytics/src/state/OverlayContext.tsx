import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

// Period selection shared by the Performance page and the "Select a time period" dialog.
export type PeriodKind = 'All to Date' | 'All to Custom Date' | 'Financial Year' | 'Year' | 'Month' | 'Trailing' | 'Custom';
export interface Period { kind: PeriodKind; label: string; from?: string; to?: string }

export type Overlay =
  | { kind: 'familyPicker' }
  | { kind: 'preferences' }
  | { kind: 'changeIndices' }
  | { kind: 'changeBenchmark' }
  | { kind: 'periodPicker'; value: Period; onPick: (p: Period) => void }
  | { kind: 'helpCenter' }
  | { kind: 'contactSupport' }
  | { kind: 'appTour' }
  | { kind: 'tagAdvisor' }
  | { kind: 'addAdvisor'; onAdded?: () => void }
  | { kind: 'watchlistEdit'; onChanged?: () => void }
  | { kind: 'watchlistSearch'; onChanged?: () => void }
  | { kind: 'newReportView' }
  | { kind: 'saveView'; onSave: (name: string, description: string) => Promise<void> | void }
  // Benchmark Settings pencil → "Select Index" (Single Index | Blends) dialog.
  | { kind: 'selectIndex'; current: string | null; onPick: (name: string) => Promise<void> | void }
  | { kind: 'addCategory'; parent?: string; onAdded?: () => void }
  | { kind: 'addPortfolio'; variant: 'Portfolio' | 'Group' }
  | { kind: 'confirm'; title: string; body: string; cta?: string; danger?: boolean; onConfirm: () => Promise<void> | void }
  | { kind: 'info'; title: string; body: string };

interface OverlayState {
  stack: Overlay[];
  open: (o: Overlay) => void;
  close: () => void;
  closeAll: () => void;
}

const OverlayContext = createContext<OverlayState | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Overlay[]>([]);
  const open = useCallback((o: Overlay) => setStack((s) => [...s, o]), []);
  const close = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const closeAll = useCallback(() => setStack([]), []);
  const value = useMemo(() => ({ stack, open, close, closeAll }), [stack, open, close, closeAll]);
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayState {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useOverlay outside OverlayProvider');
  return ctx;
}
