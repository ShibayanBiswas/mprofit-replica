import { fmtRupee, fmtSignedPct } from '@mprofit/shared';
import { TriangleIcon } from '../ui/Icons';

// Palette sampled from the live Analytics pie (greens → greys).
export const PIE_COLORS = ['#5f854c', '#8fb07f', '#cfe3c9', '#3a3d4d', '#64677a', '#babdcc', '#253326', '#a3c293', '#d8dae5', '#12131a'];

export interface Slice { name: string; value: number }

// Recharts-style donut: outer r 156 / inner r 107 on a 408x400 surface (live). Scales with `size`.
export function Donut({ slices, total, label = 'Current value', size = 400, onHover }: { slices: Slice[]; total: number; label?: string; size?: number; onHover?: (s: Slice | null) => void }) {
  const cx = size / 2; const cy = size / 2; const R = size * 0.39; const r = size * 0.268;
  const sum = slices.reduce((t, s) => t + s.value, 0);
  const ring = (a0: number, a1: number) => {
    const p = (a: number, rad: number) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const [x0, y0] = p(a0, R); const [x1, y1] = p(a1, R); const [x2, y2] = p(a1, r); const [x3, y3] = p(a0, r);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0},${y0} A${R},${R},0,${large},1,${x1},${y1} L${x2},${y2} A${r},${r},0,${large},0,${x3},${y3} Z`;
  };
  let angle = -Math.PI / 2;
  return (
    <svg className="an-donut" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {sum <= 0 ? (
        <path d={`M${cx + R},${cy} A${R},${R},0,1,0,${cx + R - 0.001},${cy + 0.01} L${cx + r - 0.001},${cy + 0.01} A${r},${r},0,1,1,${cx + r},${cy} Z`} fill="#f5f5f6" />
      ) : slices.map((s, i) => {
        const a0 = angle; const a1 = angle + (s.value / sum) * Math.PI * 2 - 0.004; angle = a1 + 0.004;
        return <path key={s.name} d={ring(a0, a1)} fill={PIE_COLORS[i % PIE_COLORS.length]} onMouseEnter={() => onHover?.(s)} onMouseLeave={() => onHover?.(null)} />;
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontFamily="Rubik" fontWeight={600} fill="#12131a" fontSize={size * 0.04}>{fmtRupee(total)}</text>
      <text x={cx} y={cy + size * 0.05} textAnchor="middle" dominantBaseline="central" fill="#64677a" fontSize={size * 0.03}>{label}</text>
    </svg>
  );
}

export function PieLegend({ slices, total }: { slices: Slice[]; total: number }) {
  if (!slices.length) return null;
  return (
    <ul className="an-legend">
      {slices.map((s, i) => (
        <li key={s.name}><span className="an-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="an-legend-name">{s.name}</span><span className="an-legend-pct">{total ? ((s.value / total) * 100).toFixed(2) : '0.00'}%</span></li>
      ))}
    </ul>
  );
}

// "Today's Performance" column chart: one thin rounded bar per index, pill with % beneath/above the zero line.
export function IndexBars({ items, portfolioPct }: { items: { name: string; changePct: number }[]; portfolioPct?: number | null }) {
  const bars = [...(portfolioPct !== undefined && portfolioPct !== null ? [{ name: 'My Stocks & ETFs', changePct: portfolioPct }] : []), ...items];
  const max = Math.max(0.5, ...bars.map((b) => Math.abs(b.changePct)));
  const W = 900; const H = 270; const zero = 137; const scale = 100 / max;
  const step = W / bars.length;
  return (
    <div className="an-index-bars">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        <line x1={20} x2={W - 15} y1={zero} y2={zero} stroke="#D8DAE5" />
        {bars.map((b, i) => {
          const x = step * i + step / 2 - 6; const h = Math.max(1, Math.abs(b.changePct) * scale); const up = b.changePct >= 0;
          return <rect key={b.name} x={x} y={up ? zero - h : zero} width={12} height={h} rx={6} fill={up ? '#5f854c' : '#C94C40'} />;
        })}
      </svg>
      <div className="an-index-pills" style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}>
        {bars.map((b) => {
          const up = b.changePct >= 0;
          return (
            <div key={b.name} className="an-index-col" style={{ paddingTop: up ? 8 : 0 }}>
              <span className={`an-pill ${up ? 'up' : 'down'}`}><TriangleIcon size={12} color={up ? '#5f854c' : '#c94c40'} down={!up} />{fmtSignedPct(b.changePct).replace('+', '')}</span>
            </div>
          );
        })}
      </div>
      <div className="an-index-labels" style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}>
        {bars.map((b) => <span key={b.name}>{b.name}</span>)}
      </div>
    </div>
  );
}

// "My XIRR vs. Index CAGR": vertical columns — Portfolio first (dark), then each selected index (green).
export function IndexCagrBars({ portfolioXirr, indices }: { portfolioXirr: number | null; indices: { name: string; cagr: number | null }[] }) {
  const bars = [{ name: 'Portfolio', v: portfolioXirr }, ...indices.map((i) => ({ name: shortIndexName(i.name), v: i.cagr }))];
  const W = 455; const H = 560; const top = 20; const bottom = 70; const left = 56;
  const vals = bars.map((b) => Math.abs(b.v ?? 0));
  const max = Math.max(20, Math.ceil(Math.max(...vals) / 10) * 10);
  const y = (v: number) => top + ((max - v) / (2 * max)) * (H - top - bottom);
  const step = (W - left) / bars.length;
  const ticks = [-max, -max / 2, 0, max / 2, max];
  return (
    <svg className="an-cagr" viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      {ticks.map((t) => <g key={t}><line x1={left} x2={W} y1={y(t)} y2={y(t)} stroke="#ebecf2" /><text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="13" fill="#64677a">{Math.round(t)}%</text></g>)}
      {bars.map((b, i) => {
        const cx = left + step * i + step / 2; const v = b.v;
        return (
          <g key={b.name}>
            {v !== null && <rect x={cx - 14} y={Math.min(y(0), y(v))} width={28} height={Math.max(2, Math.abs(y(v) - y(0)))} rx={4} fill={i === 0 ? '#12131a' : '#5f854c'} />}
            {v !== null && <text x={cx} y={(v >= 0 ? y(v) - 8 : y(v) + 16)} textAnchor="middle" fontSize="12" fill="#12131a">{v.toFixed(1)}%</text>}
            <text x={cx} y={H - 40} textAnchor="middle" fontSize="13" fill="#64677a">{b.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
const shortIndexName = (n: string) => n.replace(/^TRI /, '').replace('BSE Sensex', 'Sensex').replace('Nifty 50', 'Nifty');

// XIRR gauge: thin vertical ticks -10% … 10% with a marker bar at the XIRR value (green card on Performance).
export function XirrGauge({ xirr }: { xirr: number | null }) {
  // Live: 4 labelled ticks (-5% … 10%) when empty; window re-centres on the XIRR value otherwise.
  const base = xirr === null ? 0 : Math.round(xirr / 5) * 5;
  const ticks = [base - 5, base, base + 5, base + 10];
  return (
    <div className="an-xirr-gauge">
      <div className="an-xirr-ticks">
        {ticks.map((t) => (
          <div key={t} className="an-xirr-tick">
            <span className="an-xirr-line" style={{ background: xirr !== null && Math.abs(xirr - t) < 2.5 ? '#12131a' : '#9db08f' }} />
            <span className="an-xirr-tick-label">{t}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal "My XIRR vs Benchmark" comparison bars.
export function CompareBars({ rows }: { rows: { label: string; value: number | null; color: string }[] }) {
  const max = Math.max(30, ...rows.map((r) => Math.abs(r.value ?? 0)));
  const axis = [-max, -max / 2, 0, max / 2, max];
  return (
    <div className="an-compare">
      {rows.map((r) => (
        <div key={r.label} className="an-compare-row">
          <span className="an-compare-label">{r.label}</span>
          <div className="an-compare-track">
            <span className="an-compare-zero" />
            {r.value !== null && <span className="an-compare-bar" style={{ background: r.color, left: `${50 + Math.min(0, r.value) / max * 50}%`, width: `${Math.abs(r.value) / max * 50}%` }} />}
            {r.value !== null && <span className="an-compare-val" style={{ left: `calc(${50 + (r.value / max) * 50}% + 8px)` }}>{r.value.toFixed(1)}%</span>}
          </div>
        </div>
      ))}
      <div className="an-compare-axis">{axis.map((a) => <span key={a}>{Math.round(a)}%</span>)}</div>
    </div>
  );
}
