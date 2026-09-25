import { useEffect, useState } from 'react';
import type { AdvisorProfile, AutoTransferCharges } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { Tip } from '../components/Tip';
import { useOverlay } from '../state/OverlayContext';
import { useWorkspace } from '../state/WorkspaceContext';

// Tools → Global Asset Search (07-misc/02-global-asset-search.png)
export function GlobalAssetSearchModal({ onClose }: { onClose: () => void }) {
  const { assetClasses } = useWorkspace();
  const { replace } = useOverlay();
  const [code, setCode] = useState('');
  return (
    <Modal title="Select Asset for Global Search" onClose={onClose} size="md">
      <div className="form-row"><span className="form-label">Asset Class</span>
        <select className="form-control form-select" value={code} onChange={(e) => setCode(e.target.value)} style={{ borderColor: 'var(--blue)' }}>
          <option value="">Select</option>{assetClasses.filter((a) => a.mode === 'INV').map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
        </select>
      </div>
      <div className="modal-actions">
        <PrimaryButton disabled={!code} onClick={() => replace({ kind: 'notice', title: 'Global Asset Search', description: `Search ${assetClasses.find((a) => a.code === code)?.label ?? ''} across all families and portfolios.` })}>Search</PrimaryButton>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
      </div>
    </Modal>
  );
}

// Tools → Auto-transfer of Charges (07-misc/03-auto-transfer-charges.png)
export function AutoTransferChargesModal({ onClose }: { onClose: () => void }) {
  const [v, setV] = useState<AutoTransferCharges>({ invNonTrading: false, invTrading: false, fo: false });
  const [orig, setOrig] = useState<AutoTransferCharges | null>(null);
  useEffect(() => { void classicApi.autoTransferCharges().then((r) => { setV(r); setOrig(r); }); }, []);
  const dirty = orig && (orig.invNonTrading !== v.invNonTrading || orig.invTrading !== v.invTrading || orig.fo !== v.fo);
  const save = async () => { await classicApi.saveAutoTransferCharges(v); onClose(); };
  const Row = ({ k, label, tip }: { k: keyof AutoTransferCharges; label: string; tip?: string }) => (
    <div className="form-row" style={{ minHeight: 32, marginBottom: 0 }}>
      <span className="form-label" style={{ width: 'auto', flex: 1, fontSize: 14 }}>{label}{tip && <Tip text={tip} />}</span>
      <label className="checkbox" style={{ width: 120, justifyContent: 'center' }}><input type="checkbox" checked={v[k]} onChange={(e) => setV((s) => ({ ...s, [k]: e.target.checked }))} /></label>
    </div>
  );
  return (
    <Modal title="Auto Transfer of Contract Note Charges" onClose={onClose} size="md">
      <p className="tool-intro" style={{ marginBottom: 18 }}>Enable this feature so that contract note charges are automatically loaded to buy and sell transactions when they are inputed. Please note that this will apply globally to all your portfolios.</p>
      <Row k="invNonTrading" label="Enabled for INV non-trading portfolios?" tip="Applies to investment portfolios not flagged as trading" />
      <Row k="invTrading" label="Enabled for INV trading portfolios?" tip="Applies to investment portfolios flagged as trading" />
      <Row k="fo" label="Enabled for F&O Portfolios?" />
      <div className="modal-actions"><PrimaryButton disabled={!dirty} onClick={() => void save()}>Save</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

// Tools → F&O Auto-settlement (07-misc/04-fo-auto-settlement.png)
export function FoAutoSettlementModal({ onClose }: { onClose: () => void }) {
  const { replace } = useOverlay();
  const [type, setType] = useState<'Stock F&O' | 'Other F&O'>('Stock F&O');
  const [futures, setFutures] = useState<'No' | 'Yes'>('No');
  const [mode, setMode] = useState<'Auto' | 'Moderated'>('Auto');
  const [period, setPeriod] = useState('All To Date');
  const Radios = <T extends string>({ value, a, b, set }: { value: T; a: T; b: T; set: (v: T) => void }) => (
    <div className="radio-group" style={{ gap: 0 }}>
      <label className="radio" style={{ width: 180 }}><input type="radio" checked={value === a} onChange={() => set(a)} />{a}</label>
      <label className="radio" style={{ width: 180 }}><input type="radio" checked={value === b} onChange={() => set(b)} />{b}</label>
    </div>
  );
  return (
    <Modal title="F&O Auto-settlement" onClose={onClose} size="md">
      <p className="tool-intro" style={{ marginBottom: 16 }}>Use this feature to bulk settle your expired options across all your portfolios.</p>
      <div className="pref-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>Type</span><Radios value={type} a="Stock F&O" b="Other F&O" set={setType} /></div>
      <div className="pref-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>Include Futures?</span><Radios value={futures} a="No" b="Yes" set={setFutures} /></div>
      <div className="pref-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>Mode<Tip text="Auto settles all expired contracts; Moderated lets you review each one" /></span><Radios value={mode} a="Auto" b="Moderated" set={setMode} /></div>
      <div className="pref-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>Select Expiry Period</span>
        <select className="form-control form-select" value={period} onChange={(e) => setPeriod(e.target.value)}><option>All To Date</option><option>Current Month</option><option>Previous Month</option><option>Current FY</option><option>Previous FY</option></select>
      </div>
      <div className="modal-actions"><PrimaryButton onClick={() => replace({ kind: 'notice', title: 'F&O Auto-settlement', description: `${mode} settlement of expired ${type} contracts (${futures === 'Yes' ? 'including' : 'excluding'} futures) for ${period}.` })}>Continue</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

// Tools → Advisor / Company Profile (05-settings/03-advisor-company-profile.png)
export function AdvisorProfileModal({ onClose }: { onClose: () => void }) {
  const [p, setP] = useState<AdvisorProfile>({ name: '', address1: '', address2: '', phone: '', email: '' });
  const [orig, setOrig] = useState<AdvisorProfile | null>(null);
  useEffect(() => { void classicApi.advisorProfile().then((r) => { setP(r); setOrig(r); }); }, []);
  const dirty = orig && JSON.stringify(orig) !== JSON.stringify(p);
  const save = async () => { await classicApi.saveAdvisorProfile(p); onClose(); };
  const F = ({ k, label, tip }: { k: keyof AdvisorProfile; label: string; tip?: string }) => (
    <div className="form-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>{label}{tip && <Tip text={tip} />}</span><input className="form-control" value={p[k]} onChange={(e) => setP((s) => ({ ...s, [k]: e.target.value }))} /></div>
  );
  return (
    <Modal title="Edit your Advisor / Company Profile" onClose={onClose} size="md">
      <F k="name" label="Name" tip="Shown on report headers" />
      <F k="address1" label="Address 1" />
      <F k="address2" label="Address 2" />
      <F k="phone" label="Phone" />
      <F k="email" label="Email" tip="Contact email printed on reports" />
      <div className="modal-actions"><PrimaryButton disabled={!dirty} onClick={() => void save()}>Save</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}
