import { useCallback, useEffect, useState } from 'react';
import type { BenchmarkSettings } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useOverlay } from '../state/OverlayContext';
import { BackToDashboard } from '../components/shell/Shell';
import { Menu } from '../components/ui/Primitives';
import { ChevronDownIcon, DotsIcon, EditIcon, ExpandIcon, InfoIcon } from '../components/ui/Icons';

type Mode = 'Category Wise' | 'Portfolio Wise';

// Live: wrench → Benchmark Settings (/portfolio/default-benchmark). Green header CATEGORY | BENCHMARK,
// "Default Benchmark" row, one row per category ("Default" when inheriting), pencil → Select Index dialog, ⋯ → reset.
export function BenchmarkSettingsPage() {
  const { open } = useOverlay();
  const [data, setData] = useState<BenchmarkSettings | null>(null);
  const [mode, setMode] = useState<Mode>('Category Wise');
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const load = useCallback(() => analyticsApi.benchmarkSettings().then(setData), []);
  useEffect(() => { void load(); }, [load]);

  const toggle = (n: string) => setOpenSet((s) => { const x = new Set(s); if (x.has(n)) x.delete(n); else x.add(n); return x; });
  const allOpen = !!data && data.categories.every((c) => openSet.has(c.name));
  const pickDefault = () => open({ kind: 'selectIndex', current: data?.defaultBenchmark ?? null, onPick: async (name) => setData(await analyticsApi.saveBenchmarkSetting({ defaultBenchmark: name })) });
  const pickCategory = (cat: string, current: string | null) => open({ kind: 'selectIndex', current, onPick: async (name) => setData(await analyticsApi.saveBenchmarkSetting({ category: cat, benchmark: name })) });
  const resetCategory = async (cat: string) => setData(await analyticsApi.saveBenchmarkSetting({ category: cat, benchmark: null }));

  return (
    <div className="an-content benchmarkContainer">
      <BackToDashboard />
      <div className="an-page-head">
        <h2 className="an-page-title">Benchmark Settings</h2>
        <div className="an-toggle-hard" role="group">
          {(['Category Wise', 'Portfolio Wise'] as Mode[]).map((m) => <button key={m} type="button" className={mode === m ? 'active' : ''} aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>)}
        </div>
      </div>

      <div className="an-bm-table">
        <div className="an-bm-head">
          <button type="button" className="an-tree-toggle" aria-label="Expand all" title={allOpen ? 'Collapse all' : 'Expand all'} onClick={() => setOpenSet(allOpen ? new Set() : new Set((data?.categories ?? []).map((c) => c.name)))}><ExpandIcon /></button>
          <span>{mode === 'Category Wise' ? 'Category' : 'Portfolio'}</span>
          <span>Benchmark</span>
          <span />
        </div>
        <div style={{ background: '#fff', border: '1px solid #ebecf2', borderTop: 0, borderRadius: '0 0 6px 6px' }}>
          <div className="an-bm-default">
            <span />
            <span className="an-bm-name">Default Benchmark <InfoIcon size={16} color="#babdcc" /></span>
            <span><span className="an-bm-tag">{data?.defaultBenchmark ?? ''}</span></span>
            <span className="an-bm-actions"><button type="button" className="an-icon-btn" aria-label="Edit default benchmark" onClick={pickDefault}><EditIcon size={18} color="#64677a" /></button></span>
          </div>
          {mode === 'Category Wise' ? (data?.categories ?? []).map((c) => (
            <div key={c.name}>
              <div className="an-bm-row">
                <button type="button" className="an-tree-toggle" aria-label="Toggle" onClick={() => toggle(c.name)} style={{ transform: openSet.has(c.name) ? 'rotate(180deg)' : undefined }}><ChevronDownIcon size={18} color="#64677a" /></button>
                <span>{c.name}</span>
                <span>{c.benchmark ? <span className="an-bm-tag">{c.benchmark}</span> : <span className="an-bm-default-txt">Default</span>}</span>
                <span className="an-bm-actions">
                  <button type="button" className="an-icon-btn" aria-label={`Edit ${c.name} benchmark`} onClick={() => pickCategory(c.name, c.benchmark)}><EditIcon size={18} color="#64677a" /></button>
                  {c.benchmark && <Menu align="right" trigger={() => <button type="button" className="an-icon-btn" aria-label="More"><DotsIcon size={20} color="#64677a" /></button>} items={[{ label: 'Reset to default', onSelect: () => void resetCategory(c.name) }]} />}
                </span>
              </div>
              {openSet.has(c.name) && <div className="an-bm-sub"><span /><span>Effective benchmark</span><span>{c.benchmark ?? data?.defaultBenchmark}</span><span /></div>}
            </div>
          )) : (data?.portfolios ?? []).map((p) => (
            <div key={p.id} className="an-bm-row">
              <span />
              <span>{p.name} <small className="an-muted">· {p.familyName}</small></span>
              <span>{p.benchmark ? <span className="an-bm-tag">{p.benchmark}</span> : <span className="an-bm-default-txt">Default</span>}</span>
              <span className="an-bm-actions"><button type="button" className="an-icon-btn" aria-label={`Edit ${p.name} benchmark`} onClick={() => open({ kind: 'info', title: 'Portfolio-wise benchmarks', body: 'Portfolio-level overrides are configured by your administrator. Category-wise settings apply to this portfolio.' })}><EditIcon size={18} color="#64677a" /></button></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
