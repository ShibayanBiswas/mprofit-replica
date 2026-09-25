import { useState } from 'react';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { Tip } from '../components/Tip';
import { useOverlay } from '../state/OverlayContext';

type Provider = 'MF CAS' | 'Zerodha' | 'Dhan';

// Top nav API ▾ → MF CAS / Zerodha / Dhan connector dialogs (07-misc/10..12). Connector depth is backend phase.
export function ApiConnectorModal({ provider, onClose }: { provider: Provider; onClose: () => void }) {
  const { replace } = useOverlay();
  const [pan, setPan] = useState('');
  const [otpVia, setOtpVia] = useState<'Phone' | 'Email'>('Phone');
  const [contact, setContact] = useState('');
  const [clientId, setClientId] = useState('');

  const cont = () => replace({ kind: 'notice', title: `${provider} sync requested`, description: `Your ${provider} connection request has been queued. Transactions will appear once the sync completes.` });

  switch (provider) {
    case 'MF CAS':
      return (
        <Modal title="Sync all your Mutual Funds linked to your PAN" onClose={onClose} size="md" footer={<><PrimaryButton disabled={pan.length !== 10} onClick={cont}>Continue</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton><span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--blue)', textDecoration: 'underline', cursor: 'pointer' }}>View Usage</span></>}>
          <p className="tool-intro" style={{ fontSize: 14, marginBottom: 10 }}>Use the MFCentral CAS API to sync all your Mutual Fund transactions across platforms.</p>
          <p className="tool-intro" style={{ fontSize: 14, marginBottom: 10 }}>You will be redirected to the MFCentral website to complete the process.</p>
          <p className="tool-intro" style={{ fontSize: 14, marginBottom: 10 }}>On the MFCentral website, please select the following options:</p>
          <p style={{ fontWeight: 700, marginBottom: 10 }}>Regular + Direct Investments | Transactions | Select All AMCs</p>
          <p className="tool-intro" style={{ fontSize: 14, marginBottom: 16 }}>After completing these steps, copy the generated QR code from the MFCentral website and paste it into this form to proceed.</p>
          <div className="form-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>PAN</span><input className="form-control" value={pan} maxLength={10} onChange={(e) => setPan(e.target.value.toUpperCase())} /></div>
          <div className="form-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>OTP via<Tip text="Where MFCentral should send the OTP" /></span>
            <div className="radio-group" style={{ gap: 0 }}><label className="radio" style={{ width: 180 }}><input type="radio" checked={otpVia === 'Phone'} onChange={() => setOtpVia('Phone')} />Phone</label><label className="radio" style={{ width: 180 }}><input type="radio" checked={otpVia === 'Email'} onChange={() => setOtpVia('Email')} />Email</label></div>
          </div>
          <div className="form-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>{otpVia === 'Phone' ? 'Mobile Number' : 'Email'}</span><input className="form-control" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
        </Modal>
      );
    case 'Zerodha':
      return (
        <Modal title="Sync your trade data from Zerodha" onClose={onClose} size="md" footer={<><PrimaryButton onClick={cont}>Connect your Zerodha account</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></>}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><img src="/assets/icons/brokers/zerodha.svg" alt="Zerodha" style={{ height: 26 }} /></div>
          <p className="tool-intro" style={{ fontSize: 14, marginBottom: 10 }}>Link your Zerodha Kite account to sync your stock and F&O trades automatically. You will be redirected to Kite to authorise access.</p>
          <p className="tool-intro" style={{ fontSize: 14 }}>Only trade data is read; no orders are placed on your behalf.</p>
        </Modal>
      );
    case 'Dhan':
      return (
        <Modal title="Sync your trade data from Dhan" onClose={onClose} size="md" footer={<><PrimaryButton disabled={!clientId} onClick={cont}>Continue</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></>}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><img src="/assets/icons/brokers/dhan.svg" alt="Dhan" style={{ height: 26 }} /></div>
          <p className="tool-intro" style={{ fontSize: 14, marginBottom: 16 }}>Enter your Dhan client ID to link your account and sync trades.</p>
          <div className="form-row"><span className="form-label" style={{ width: 170, fontSize: 14 }}>Dhan Client ID</span><input className="form-control" value={clientId} onChange={(e) => setClientId(e.target.value)} /></div>
        </Modal>
      );
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}
