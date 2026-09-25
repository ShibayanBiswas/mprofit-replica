import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeStyle?: 'blue-x' | 'dark-x' | 'none';
  footer?: ReactNode;
  headerExtra?: ReactNode;
}

// Centered overlay used by most Classic dialogs. Escape and backdrop click close it.
export function Modal({ title, onClose, children, size = 'md', className = '', closeStyle = 'blue-x', footer, headerExtra }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-dialog modal-${size} ${className}`} role="dialog" aria-modal="true">
        {closeStyle !== 'none' && (
          <button type="button" className={`modal-close ${closeStyle}`} aria-label="Close" onClick={onClose}>
            {closeStyle === 'blue-x' ? <span className="material-icons">close</span> : <span className="material-icons">close</span>}
          </button>
        )}
        {(title || headerExtra) && (
          <>
            <div className="modal-header"><h2 className="modal-title">{title}</h2>{headerExtra}</div>
            <div className="modal-sep" />
          </>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, type = 'button', className = '' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; className?: string }) {
  return <button type={type} className={`btn btn-primary ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
}
export function GhostButton({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" className={`btn btn-ghost ${className}`} onClick={onClick}>{children}</button>;
}
