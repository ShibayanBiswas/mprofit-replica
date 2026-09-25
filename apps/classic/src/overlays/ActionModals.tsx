import { useState, type ReactNode } from 'react';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { useWorkspace } from '../state/WorkspaceContext';
import type { ActionKind } from '../state/OverlayContext';

// The eight dialogs behind Actions ▾. Headings, field order, control types and button sets are
// transcribed from live cloud.mprofit.in; three of them retitle themselves (Edit Portfolio Details
// opens as "Edit Portfolio", and the two historical items open as "Select Date and Asset Type for
// Historical Values/Prices"). Submitting is a backend-phase concern, so the primary action closes.

// Live's current financial year, used as the Bulk Delete default period and the historical date.
const FY_START = '01/04/26';
const FY_END = '31/03/27';
const FY_LAST_DAY = '31/03/26';

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="if-item-container">
      <span className="if-item-lbl">{label}</span>
      <div className="if-input-container">{children}</div>
    </div>
  );
}

function SelectRow({ label, value, onChange, options, placeholder = 'Select' }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <Row label={label}>
      <select className="ng-select-control" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Row>
  );
}

function CopyMovePortfolio({ onClose }: { onClose: () => void }) {
  const { families, family } = useWorkspace();
  const [toFamily, setToFamily] = useState('');
  const [mode, setMode] = useState<'Copy' | 'Move'>('Copy');
  // Live greys out Continue until a destination family other than the current one is chosen.
  const targets = families.filter((f) => f.id !== family?.id);
  return (
    <Modal title="Copy / Move Portfolio" onClose={onClose} size="md">
      <SelectRow label="To Family" value={toFamily} onChange={setToFamily} options={targets.map((f) => ({ value: f.id, label: f.name }))} />
      <Row label="Mode">
        <div className="radio-group">
          <label className="radio"><input type="radio" name="cmp-mode" checked={mode === 'Copy'} onChange={() => setMode('Copy')} />Copy Portfolio</label>
          <label className="radio"><input type="radio" name="cmp-mode" checked={mode === 'Move'} onChange={() => setMode('Move')} />Move Portfolio</label>
        </div>
      </Row>
      <div className="modal-actions">
        <PrimaryButton disabled={!toFamily} onClick={onClose}>Continue</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

function EditPortfolio({ onClose }: { onClose: () => void }) {
  const { portfolio } = useWorkspace();
  const [name, setName] = useState(portfolio?.shortName ?? '');
  const [fullName, setFullName] = useState(portfolio?.fullName ?? '');
  const [strategy, setStrategy] = useState(false);
  const [pms, setPms] = useState(portfolio?.isPms ?? false);
  const [entity, setEntity] = useState('');
  const [showMore, setShowMore] = useState(false);
  return (
    <Modal title="Edit Portfolio" onClose={onClose} size="md">
      <Row label={<>Portfolio Name <span className="req-star">*</span></>}>
        <input className="ng-select-control" value={name} onChange={(e) => setName(e.target.value)} />
      </Row>
      <Row label="Full Name">
        <input className="ng-select-control" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Row>
      <div className="if-item-container if-item-check">
        <label className="checkbox"><input type="checkbox" checked={strategy} onChange={(e) => setStrategy(e.target.checked)} />Strategy / Goal Portfolio</label>
      </div>
      <div className="if-item-container if-item-check">
        <label className="checkbox"><input type="checkbox" checked={pms} onChange={(e) => setPms(e.target.checked)} />PMS Portfolio</label>
      </div>
      <Row label="Entity">
        <input className="ng-select-control" value={entity} onChange={(e) => setEntity(e.target.value)} />
        <button type="button" className="if-add-btn" aria-label="Add entity">+</button>
      </Row>
      <button type="button" className="if-more-link" onClick={() => setShowMore((v) => !v)}>Additional Options</button>
      {showMore && (
        <Row label="PAN">
          <input className="ng-select-control" defaultValue={portfolio?.pan ?? ''} />
        </Row>
      )}
      <div className="modal-actions">
        <PrimaryButton disabled={!name.trim()} onClick={onClose}>Save</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <GhostButton onClick={onClose}>Delete</GhostButton>
      </div>
    </Modal>
  );
}

function EditBroker({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState('');
  const [entity, setEntity] = useState('');
  return (
    <Modal title="Edit Broker / Other Entity" onClose={onClose} size="md">
      <SelectRow label="Type" value={type} onChange={setType} options={[{ value: 'Broker', label: 'Broker' }, { value: 'Other Entity', label: 'Other Entity' }]} />
      <SelectRow label="Entity" value={entity} onChange={setEntity} options={[]} placeholder="" />
      <div className="modal-actions">
        <PrimaryButton onClick={onClose}>Edit</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

function BulkDeleteTransactions({ onClose }: { onClose: () => void }) {
  const { assetClasses, mode } = useWorkspace();
  const [code, setCode] = useState('');
  return (
    <Modal title="Bulk Delete Transactions" onClose={onClose} size="md">
      <SelectRow label="Asset Class" value={code} onChange={setCode} options={assetClasses.filter((a) => a.mode === mode).map((a) => ({ value: a.code, label: a.label }))} />
      <Row label="Period">
        <span className="if-period">{FY_START} to {FY_END}</span>
      </Row>
      <div className="modal-actions">
        <PrimaryButton onClick={onClose}>Delete</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

function DeleteUnusedAsset({ title, onClose }: { title: string; onClose: () => void }) {
  const { assetClasses, mode } = useWorkspace();
  const [code, setCode] = useState('');
  const [asset, setAsset] = useState('');
  return (
    <Modal title={title} onClose={onClose} size="md">
      <SelectRow label="Asset Class" value={code} onChange={setCode} options={assetClasses.filter((a) => a.mode === mode).map((a) => ({ value: a.code, label: a.label }))} />
      <SelectRow label="Asset" value={asset} onChange={setAsset} options={[]} placeholder="" />
      <div className="modal-actions">
        <PrimaryButton onClick={onClose}>Delete</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

function HistoricalPicker({ title, onClose }: { title: string; onClose: () => void }) {
  const { assetClasses, mode } = useWorkspace();
  const [code, setCode] = useState('');
  return (
    <Modal title={title} onClose={onClose} size="md">
      <SelectRow label="Asset Type" value={code} onChange={setCode} options={assetClasses.filter((a) => a.mode === mode).map((a) => ({ value: a.code, label: a.label }))} />
      <Row label="Date">
        <span className="if-period">{FY_LAST_DAY}</span>
      </Row>
      <div className="modal-actions">
        <PrimaryButton onClick={onClose}>Save</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

// Titled acknowledgement for flows that land in the backend phase (API sync queued, logs, 2FA).
export function NoticeModal({ title, description, onClose }: { title: string; description: string; onClose: () => void }) {
  const { portfolio } = useWorkspace();
  return (
    <Modal title={title} onClose={onClose} size="md">
      <p className="tool-intro" style={{ fontSize: 14, marginBottom: 14 }}>{description}</p>
      <Row label="Portfolio">
        <input className="ng-select-control" readOnly value={portfolio?.fullName || portfolio?.shortName || ''} />
      </Row>
      <div className="modal-actions">
        <PrimaryButton onClick={onClose}>Continue</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

export function ActionModal({ action, onClose }: { action: ActionKind; onClose: () => void }) {
  switch (action) {
    case 'copyMovePortfolio': return <CopyMovePortfolio onClose={onClose} />;
    case 'editPortfolio': return <EditPortfolio onClose={onClose} />;
    case 'editBroker': return <EditBroker onClose={onClose} />;
    case 'bulkDeleteTransactions': return <BulkDeleteTransactions onClose={onClose} />;
    case 'deleteUnusedAssetGlobally': return <DeleteUnusedAsset title="Delete Unused Asset Globally" onClose={onClose} />;
    case 'deleteUnusedAssetFromPortfolio': return <DeleteUnusedAsset title="Delete Unused Asset from Portfolio" onClose={onClose} />;
    case 'historicalValuations': return <HistoricalPicker title="Select Date and Asset Type for Historical Values" onClose={onClose} />;
    case 'historicalPrices': return <HistoricalPicker title="Select Date and Asset Type for Historical Prices" onClose={onClose} />;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
