import { useEffect, type ReactNode } from 'react';

interface SheetProps {
  onClose: () => void;
  header: ReactNode; // crumbs / tabs left of the navy X
  children: ReactNode;
  className?: string;
}

// Full-screen sheet used by Reports, Global Reports, Tools: light header row with a navy X button at the far right.
export function Sheet({ onClose, header, children, className = '' }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`sheet ${className}`} role="dialog" aria-modal="true">
        <div className="sheet-header">
          {header}
          <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}><span className="material-icons">close</span></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

// Tools-style panel: title on the left of the header, optional header links, body, optional footer.
export function ToolPanel({ title, onClose, headerLinks, children, footer, titleTip }: { title: ReactNode; onClose: () => void; headerLinks?: ReactNode; children: ReactNode; footer?: ReactNode; titleTip?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="tool-sheet" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tool-panel" role="dialog" aria-modal="true">
        <div className="tool-panel-header">
          <span className="tool-panel-title">{title}{titleTip && <span className="tip" title={titleTip}>?</span>}</span>
          <span className="spacer" />
          {headerLinks}
          <button type="button" className="tool-panel-close" aria-label="Close" onClick={onClose}><span className="material-icons">close</span></button>
        </div>
        <div className="tool-panel-body">{children}</div>
        {footer && <div className="tool-panel-footer">{footer}</div>}
      </div>
    </div>
  );
}
