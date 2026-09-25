import { useState, type ReactNode } from 'react';
import { CONTACT_US, fmtMonthDayYear } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { useOverlay } from '../state/OverlayContext';
import { useSession } from '../state/SessionContext';
import { useWorkspace } from '../state/WorkspaceContext';

// Profile → My Account (05-settings/10-profile-my-account.png)
export function MyAccountModal({ onClose }: { onClose: () => void }) {
  const { user, databases } = useSession();
  const { families } = useWorkspace();
  const { open } = useOverlay();
  const db = databases[0];
  const Row = ({ k, children }: { k: string; children: ReactNode }) => <div className="acct-row"><span className="k">{k}</span><span className="v">{children}</span></div>;
  return (
    <Modal title="My Account" onClose={onClose} size="md">
      <Row k="Email:">{user?.email}</Row>
      <Row k="Display Name:">{user?.displayName}<i className="fas fa-pencil-alt" title="Edit display name" /></Row>
      <Row k="Plan:">{db?.plan}</Row>
      <Row k="Expiry Date:">{db ? fmtMonthDayYear(db.expiryDate) : ''}</Row>
      <Row k="Active Users:">{db ? `${db.activeUsers} / ${db.maxUsers}` : ''}</Row>
      <Row k="Current Family Count:">{families.length}</Row>
      <Row k="Change Password:"><button type="button" className="btn btn-primary btn-navy" style={{ height: 26, padding: '0 16px', fontSize: 14, background: 'var(--blue)', borderColor: 'var(--blue)' }} onClick={() => open({ kind: 'changePassword' })}>Click Here</button></Row>
      <Row k="Enable 2-Factor Authentication:"><button type="button" className="btn btn-primary" style={{ height: 26, padding: '0 16px', fontSize: 14 }} onClick={() => open({ kind: 'notice', title: 'Enable 2-Factor Authentication', description: 'Scan the QR code with an authenticator app to enable 2FA for this account.' })}>Click Here</button></Row>
      <Row k="Disconnect Mobile Device:"><button type="button" className="btn btn-primary" style={{ height: 26, padding: '0 16px', fontSize: 14 }} onClick={() => open({ kind: 'notice', title: 'Disconnect Mobile Device', description: 'No mobile devices are currently linked to this account.' })}>Click Here</button></Row>
    </Modal>
  );
}

// My Account → Change Password: "Reset your Password" (email confirm) (05-settings/10-profile-change-password.png)
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { user } = useSession();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const submit = async () => {
    if (email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase()) { setErr('Email does not match your account'); return; }
    const r = await classicApi.forgotPassword(email); setErr(null); setMsg(r.message);
  };
  return (
    <Modal title="Reset your Password" onClose={onClose} size="md">
      <div className="form-row"><span className="form-label" style={{ width: 190 }}>Confirm your email:</span><input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      {err && <div className="auth-error" style={{ color: 'var(--red)' }}>{err}</div>}
      {msg && <div className="saved-note">{msg}</div>}
      <div className="modal-actions"><PrimaryButton onClick={() => void submit()}>Request Password Reset</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></div>
    </Modal>
  );
}

// Profile → Contact Support (white-label: Contact Us list only)
export function ContactSupportModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Contact Support" onClose={onClose} size="md">
      <ul className="help-contact">
        {CONTACT_US.map((c) => (
          <li key={c.email}><span className="material-icons">person</span>
            <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.role}</div><a href={`mailto:${c.email}`}>{c.email}</a></div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
