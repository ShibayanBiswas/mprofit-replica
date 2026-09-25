import { useState } from 'react';
import type { Portfolio, PortfolioType } from '@mprofit/shared';
import { capitalizeInitials } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { useWorkspace } from '../state/WorkspaceContext';

type Variant = 'Portfolio' | 'Group' | 'Entity' | 'Strategy/Goal Portfolio' | 'International Portfolio' | 'Account Portfolio for Tally Integration';

// + Add → Add Portfolio / Group / Entity / ... (one form, variant drives the title and defaults)
export function AddPortfolioModal({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const { family, reloadPortfolios, selectPortfolio } = useWorkspace();
  const [shortName, setShortName] = useState('');
  const [fullName, setFullName] = useState('');
  const [pan, setPan] = useState('');
  const [trading, setTrading] = useState(false);
  const [pms, setPms] = useState(variant === 'Strategy/Goal Portfolio');
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const isGroup = variant === 'Group';
  const type: PortfolioType = variant === 'International Portfolio' ? 'International' : 'Investment';

  const save = async () => {
    if (!family || !shortName.trim()) return;
    setBusy(true);
    try {
      const body: Partial<Portfolio> = { shortName: capitalizeInitials(shortName), fullName: capitalizeInitials(fullName || shortName), pan, type, isGroup, isTrading: trading, isPms: pms };
      const p = await classicApi.addPortfolio(family.id, body);
      await reloadPortfolios(); selectPortfolio(p.id); onClose();
    } finally { setBusy(false); }
  };

  return (
    <Modal title={`Add ${variant}`} onClose={onClose} size="md">
      <div className="form-row"><span className="form-label">{isGroup ? 'Group Name' : 'Portfolio Name'} <span style={{ color: 'var(--red)' }}>*</span></span><input className="form-control" autoFocus value={shortName} onChange={(e) => setShortName(e.target.value)} /></div>
      {!isGroup && <div className="form-row"><span className="form-label">Full Name</span><input className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>}
      {!isGroup && <div className="form-row"><span className="form-label">PAN</span><input className="form-control" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} /></div>}
      {!isGroup && <div className="form-row"><span className="form-label">Trading Portfolio</span><label className="checkbox"><input type="checkbox" checked={trading} onChange={(e) => setTrading(e.target.checked)} /></label></div>}
      {!isGroup && <div className="form-row"><span className="form-label">PMS Portfolio</span><label className="checkbox"><input type="checkbox" checked={pms} onChange={(e) => setPms(e.target.checked)} /></label></div>}
      {!isGroup && <div className="form-row" style={{ minHeight: 30 }}><span className="tool-link" style={{ fontSize: 14 }} onClick={() => setMore((m) => !m)}><span className="btn-add-icon" style={{ width: 16, height: 16, fontSize: 14, lineHeight: '16px' }}>+</span>Additional Options</span></div>}
      {more && (
        <>
          <div className="form-row"><span className="form-label">Linked PMS</span><select className="form-control form-select"><option>None</option></select></div>
          <div className="form-row"><span className="form-label">Category</span><select className="form-control form-select"><option>None</option></select></div>
        </>
      )}
      {variant === 'Account Portfolio for Tally Integration' && <p className="saved-note">Account portfolios mirror your Tally ledgers for reconciliation.</p>}
      <div className="modal-actions"><PrimaryButton disabled={busy || !shortName.trim()} onClick={() => void save()}>Save</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

export function AddToStrategiesModal({ onClose }: { onClose: () => void }) {
  const { portfolios } = useWorkspace();
  const strategies = portfolios.filter((p) => p.isPms);
  return (
    <Modal title="Add to Strategies / Goals" onClose={onClose} size="md">
      <p className="tool-intro" style={{ fontSize: 14 }}>Select a Strategy / Goal portfolio to map transactions from this portfolio.</p>
      <div className="form-row"><span className="form-label">Strategy / Goal</span>
        <select className="form-control form-select">{strategies.length === 0 ? <option>No strategy portfolios yet</option> : strategies.map((s) => <option key={s.id}>{s.shortName}</option>)}</select>
      </div>
      <div className="modal-actions"><PrimaryButton disabled={strategies.length === 0} onClick={onClose}>Continue</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

// Family selector → Add Family (initials are capitalised as required by the seed rules)
export function AddFamilyModal({ onClose }: { onClose: () => void }) {
  const { dbId, reloadFamilies, selectFamily } = useWorkspace();
  const [name, setName] = useState('');
  const save = async () => {
    if (!name.trim()) return;
    const f = await classicApi.addFamily(dbId, capitalizeInitials(name));
    await reloadFamilies(); await selectFamily(f.id); onClose();
  };
  return (
    <Modal title="Add Family" onClose={onClose} size="sm">
      <div className="form-row"><span className="form-label">Family Name <span style={{ color: 'var(--red)' }}>*</span></span><input className="form-control" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="modal-actions"><PrimaryButton disabled={!name.trim()} onClick={() => void save()}>Save</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

export function EditFamilyModal({ onClose }: { onClose: () => void }) {
  const { family, reloadFamilies } = useWorkspace();
  const [name, setName] = useState(family?.name ?? '');
  const save = async () => {
    if (!family || !name.trim()) return;
    await classicApi.editFamily(family.id, capitalizeInitials(name)); await reloadFamilies(); onClose();
  };
  return (
    <Modal title="Edit Family" onClose={onClose} size="sm">
      <div className="form-row"><span className="form-label">Family Name <span style={{ color: 'var(--red)' }}>*</span></span><input className="form-control" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="modal-actions"><PrimaryButton disabled={!name.trim()} onClick={() => void save()}>Save</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}
