import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { XirrResult } from '@mprofit/shared';
import { fmtDate, fmtPct } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { contractNotePath } from '../app/routes';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { useWorkspace } from '../state/WorkspaceContext';

// + Add → Add Transaction. Live shows only the asset-class picker here; Select navigates to the
// full-page Contract Note Detail screen for that class.
export function AddTransactionModal({ guided, onClose }: { guided: boolean; onClose: () => void }) {
  const { dbId, family, portfolio, assetClasses, mode, activeAssetCode } = useWorkspace();
  const navigate = useNavigate();
  const classes = assetClasses.filter((a) => a.mode === mode);
  const [code, setCode] = useState(activeAssetCode || classes[0]?.code || 'EQ');

  const select = () => {
    onClose();
    navigate(contractNotePath(dbId, family?.id ?? '-', portfolio?.id ?? '-', code));
  };

  return (
    <Modal title={guided ? 'Add Transaction (Guided)' : 'Add Transaction'} onClose={onClose} size="md">
      {guided && <p className="tool-intro" style={{ fontSize: 14 }}>We will walk you through adding a transaction step by step. Start by choosing the asset class.</p>}
      <div className="if-item-container"><span className="if-item-lbl">Asset Class</span>
        <div className="if-input-container">
          <select className="ng-select-control" value={code} onChange={(e) => setCode(e.target.value)}>
            {classes.map((c) => <option key={c.code} value={c.code}>{c.label === 'Stocks & ETFs' ? 'Stocks' : c.label}</option>)}
          </select>
        </div>
      </div>
      <div className="modal-actions"><PrimaryButton onClick={select}>Select</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

// XIRR ▾ → Portfolio XIRR (with/without zero holdings)
export function XirrModal({ withZero, onClose }: { withZero: boolean; onClose: () => void }) {
  const { portfolio } = useWorkspace();
  const [r, setR] = useState<XirrResult | null>(null);
  useEffect(() => { if (portfolio) void classicApi.xirr(portfolio.id, withZero).then(setR); }, [portfolio, withZero]);
  return (
    <Modal title={`Portfolio XIRR (${withZero ? 'with' : 'without'} zero holdings)`} onClose={onClose} size="sm">
      <div className="acct-row"><span className="k">Portfolio:</span><span className="v">{portfolio?.fullName || portfolio?.shortName}</span></div>
      <div className="acct-row"><span className="k">XIRR:</span><span className="v" style={{ fontSize: 22, fontWeight: 600, color: (r?.xirr ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>{r ? fmtPct(r.xirr) : '…'}</span></div>
      <div className="acct-row"><span className="k">Since:</span><span className="v">{r ? fmtDate(r.firstTransactionDate) : ''}</span></div>
      <div className="modal-actions"><PrimaryButton onClick={onClose}>OK</PrimaryButton></div>
    </Modal>
  );
}