import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { fmtSigned, fmtSignedPct } from '@mprofit/shared';
import { CloseIcon, SearchIcon, SortIcon, TriangleIcon } from './Icons';

// ---- Popover menu (MUI Menu look) ---------------------------------------------------------------
export interface MenuItem { label: ReactNode; icon?: ReactNode; trailing?: ReactNode; onSelect?: () => void; disabled?: boolean }

interface MenuProps {
  trigger: (open: boolean) => ReactNode;
  items?: MenuItem[];
  children?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Menu({ trigger, items, children, align = 'right', className = '', menuClassName = '', header, footer }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div ref={ref} className={`an-menu-root ${open ? 'open' : ''} ${className}`}>
      <div className="an-menu-trigger" onClick={() => setOpen((o) => !o)} role="button" aria-haspopup="menu" aria-expanded={open}>{trigger(open)}</div>
      {open && (
        <div className={`an-menu an-menu-${align} ${menuClassName}`} role="menu">
          {header}
          {children ?? (
            <ul>
              {items?.map((it, i) => (
                <li key={i} role="menuitem" className={it.disabled ? 'disabled' : ''} onClick={() => { if (it.disabled) return; it.onSelect?.(); setOpen(false); }}>
                  {it.icon && <span className="an-menu-icon">{it.icon}</span>}
                  <span className="an-menu-label">{it.label}</span>
                  {it.trailing}
                </li>
              ))}
            </ul>
          )}
          {footer}
        </div>
      )}
    </div>
  );
}

// ---- Dialog (MUI Dialog look) -------------------------------------------------------------------
interface DialogProps { title?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number; className?: string }
export function Dialog({ title, onClose, children, footer, width = 400, className = '' }: DialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="an-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`an-dialog ${className}`} style={{ width }} role="dialog" aria-modal="true">
        {title !== undefined && (
          <div className="an-dialog-head">
            <h2>{title}</h2>
            <button type="button" className="an-icon-btn" aria-label="Close" onClick={onClose}><CloseIcon /></button>
          </div>
        )}
        <div className="an-dialog-body">{children}</div>
        {footer && <div className="an-dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Toggle group (View by …) -------------------------------------------------------------------
export function ToggleGroup<T extends string>({ options, value, onChange, variant = 'soft' }: { options: T[]; value: T; onChange: (v: T) => void; variant?: 'soft' | 'dark' }) {
  return (
    <div className={`an-toggle an-toggle-${variant}`} role="group">
      {options.map((o) => (
        <button key={o} type="button" className={o === value ? 'active' : ''} aria-pressed={o === value} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

// ---- Search field ---------------------------------------------------------------------------------
export function SearchField({ value, onChange, placeholder = 'Search', className = '', autoFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocus?: boolean }) {
  return (
    <label className={`an-search ${className}`}>
      <SearchIcon size={24} color="#64677a" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} />
    </label>
  );
}

// ---- Gain pill ------------------------------------------------------------------------------------
export function GainPill({ pct, showValue, value }: { pct: number; showValue?: boolean; value?: number }) {
  const up = pct >= 0;
  return (
    <span className={`an-pill ${up ? 'up' : 'down'}`}>
      <TriangleIcon size={12} color={up ? '#5f854c' : '#c94c40'} down={!up} />
      {showValue && value !== undefined ? <>{fmtSigned(value)}<span className="an-pill-pct">({fmtSignedPct(pct)})</span></> : fmtSignedPct(pct).replace('+', '')}
    </span>
  );
}

// ---- Card -----------------------------------------------------------------------------------------
export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <section className={`an-card ${className}`} style={style}>{children}</section>;
}

// ---- Table header with sort glyphs ------------------------------------------------------------
export interface Column<T> { key: keyof T | string; label: ReactNode; align?: 'left' | 'right'; width?: string; render?: (row: T) => ReactNode; sortable?: boolean; sub?: ReactNode }

export function DataTable<T>({ columns, rows, sort, onSort, empty, rowKey, leading }: {
  columns: Column<T>[]; rows: T[]; sort?: { key: string; dir: 'asc' | 'desc' }; onSort?: (key: string) => void; empty?: ReactNode; rowKey: (r: T, i: number) => string; leading?: ReactNode;
}) {
  return (
    <div className="an-table-wrap">
      <table className="an-table">
        <thead>
          <tr>
            {leading && <th style={{ width: 40 }}>{leading}</th>}
            {columns.map((c) => (
              <th key={String(c.key)} style={{ textAlign: c.align ?? 'left', width: c.width }} onClick={() => c.sortable !== false && onSort?.(String(c.key))} className={c.sortable !== false ? 'sortable' : ''}>
                <span className="an-th">
                  <span className="an-th-text">{c.label}{c.sub && <small>{c.sub}</small>}</span>
                  {c.sortable !== false && <SortIcon active={sort?.key === c.key} dir={sort?.dir} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="an-empty-row"><td colSpan={columns.length + (leading ? 1 : 0)}>{empty ?? null}</td></tr>
          ) : rows.map((r, i) => (
            <tr key={rowKey(r, i)}>
              {leading && <td />}
              {columns.map((c) => <td key={String(c.key)} style={{ textAlign: c.align ?? 'left' }}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[String(c.key)] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function useSort<T>(rows: T[], initial: { key: string; dir: 'asc' | 'desc' }) {
  const [sort, setSort] = useState(initial);
  const onSort = (key: string) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const sorted = [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.key]; const bv = (b as Record<string, unknown>)[sort.key];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
    return sort.dir === 'asc' ? cmp : -cmp;
  });
  return { sort, onSort, sorted };
}

// ---- Empty state ----------------------------------------------------------------------------------
export function EmptyState({ art, title, text }: { art?: ReactNode; title: string; text: string }) {
  return (
    <div className="an-empty">
      {art}
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

// ---- Switch (MUI style) ---------------------------------------------------------------------------
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="an-switch-row">
      {label && <span>{label}</span>}
      <span className={`an-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}><span className="knob" /></span>
    </label>
  );
}

// ---- Select-ish button (MUI outlined Select) ------------------------------------------------------
export function SelectButton({ value, options, onChange, icon, className = '' }: { value: string; options: string[]; onChange: (v: string) => void; icon?: ReactNode; className?: string }) {
  return (
    <Menu className={className} align="right" trigger={(open) => (
      <button type="button" className={`an-select ${open ? 'open' : ''}`}>{icon}{value}<ChevronSmall /></button>
    )} items={options.map((o) => ({ label: o, onSelect: () => onChange(o), trailing: o === value ? <span className="an-menu-check">✓</span> : undefined }))} />
  );
}

export function ChevronSmall({ up = false }: { up?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: up ? 'rotate(180deg)' : undefined, flex: 'none' }}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
