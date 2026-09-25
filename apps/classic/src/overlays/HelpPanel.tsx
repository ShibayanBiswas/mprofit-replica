import { useEffect } from 'react';
import { CONTACT_US } from '@mprofit/shared';

// Help → right-side support panel. White-label: Contact Us only (no "Got questions?" search / articles).
export function HelpPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="help-panel-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="help-panel" role="dialog" aria-modal="true">
        <div className="help-head">Support<button type="button" className="help-close" aria-label="Close" onClick={onClose}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button></div>
        <div className="help-body">
          <div className="help-section-title">Contact Us</div>
          <ul className="help-contact">
            {CONTACT_US.map((c) => (
              <li key={c.email}>
                <span className="material-icons">person</span>
                <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.role}</div><a href={`mailto:${c.email}`}>{c.email}</a></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
