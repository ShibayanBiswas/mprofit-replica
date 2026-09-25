// Number/date formatting matching the Classic UI (Indian grouping, 2 decimals, signed changes).

const inr = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export function fmtAmount(n: number, decimals: 'Show' | 'Hide' = 'Show'): string {
  return decimals === 'Show' ? inr.format(n) : inr0.format(n);
}

export function fmtSigned(n: number, digits = 2): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function fmtPct(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined || Number.isNaN(n)) return 'N/A';
  return `${n.toFixed(digits)}%`;
}

export function fmtSignedPct(n: number, digits = 2): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

export function fmtRupee(n: number): string {
  return `₹${inr0.format(Math.round(n))}`;
}

const dateLong = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return dateLong.format(d);
}

export function fmtDateSlash(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${fmtDateSlash(iso)}, ${d.toLocaleTimeString('en-US')}`;
}

export function fmtMonthDayYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function fmtOrdinalDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  return `${day}${suffix} ${d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
}
