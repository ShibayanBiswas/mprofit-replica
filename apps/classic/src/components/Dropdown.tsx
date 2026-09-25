import { useEffect, useRef, useState, type ReactNode } from 'react';

export type MenuEntry =
  | { type: 'item'; label: string; onSelect: () => void; icon?: ReactNode; trailing?: ReactNode; className?: string }
  | { type: 'divider' }
  | { type: 'static'; label: string };

interface DropdownProps {
  trigger: (open: boolean) => ReactNode;
  entries?: MenuEntry[];
  children?: ReactNode; // custom panel instead of entries
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  closeOnSelect?: boolean;
}

// Bootstrap-3-style dropdown: click toggles, outside click / Escape closes.
export function Dropdown({ trigger, entries, children, align = 'left', className = '', menuClassName = '', closeOnSelect = true }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className={`dd ${open ? 'open' : ''} ${className}`}>
      <div className="dd-trigger" onClick={() => setOpen((o) => !o)} role="button" aria-haspopup="menu" aria-expanded={open}>{trigger(open)}</div>
      {open && (
        <div className={`dd-menu dd-${align} ${menuClassName}`} role="menu">
          {children ?? (
            <ul>
              {entries?.map((e, i) => {
                if (e.type === 'divider') return <li key={i} className="dd-divider" role="separator" />;
                if (e.type === 'static') return <li key={i} className="dd-static">{e.label}</li>;
                return (
                  <li key={i} role="menuitem" className={e.className ?? ''}>
                    <a onClick={() => { e.onSelect(); if (closeOnSelect) setOpen(false); }}>
                      {e.icon}<span>{e.label}</span>{e.trailing}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Caret() { return <span className="caret" aria-hidden="true" />; }
