import { useEffect, useMemo, useState } from 'react';
import type { ReportsCatalog } from '@mprofit/shared';
import { truncate } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { Sheet } from '../components/Sheet';
import { useOverlay } from '../state/OverlayContext';
import { useWorkspace } from '../state/WorkspaceContext';

interface Props { initialCategoryId?: string; initialReportId?: string; onClose: () => void }

// Reports catalog: [categories 200] [reports 280] [detail]. Header: Report Log | Family: x | Portfolio: y | X
export function ReportsSheet({ initialCategoryId, initialReportId, onClose }: Props) {
  const { family, portfolio } = useWorkspace();
  const { open } = useOverlay();
  const [catalog, setCatalog] = useState<ReportsCatalog | null>(null);
  const [catId, setCatId] = useState(initialCategoryId ?? '');
  const [repId, setRepId] = useState(initialReportId ?? '');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { void classicApi.reportsCatalog().then((c) => { setCatalog(c); if (!catId) setCatId(c.categories[0]?.id ?? ''); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cat = useMemo(() => catalog?.categories.find((c) => c.id === catId) ?? catalog?.categories[0] ?? null, [catalog, catId]);
  useEffect(() => { if (cat && !cat.reports.some((r) => r.id === repId)) setRepId(cat.reports[0]?.id ?? ''); }, [cat, repId]);
  const rep = cat?.reports.find((r) => r.id === repId) ?? null;

  const generate = (format: 'PDF' | 'Excel') => {
    if (!rep) return;
    void classicApi.createReportJob({ reportName: rep.name, portfolioName: portfolio?.shortName ?? '', format }).then(() => {
      setToast(`${rep.name} (${format}) queued — see Report Log`);
      setTimeout(() => setToast(null), 2500);
    });
  };

  return (
    <Sheet onClose={onClose} header={(
      <>
        <span className="crumb crumb-first" />
        <span className="crumb" style={{ flex: 1, cursor: 'pointer' }} onClick={() => open({ kind: 'reportLog' })}>Report Log</span>
        <span className="crumb" style={{ flex: 1 }}>Family: {family?.name ?? ''}</span>
        <span className="crumb" style={{ flex: 1 }}>Portfolio: {truncate(portfolio?.fullName || portfolio?.shortName || '', 20)}</span>
      </>
    )}>
      <div className="rep-cats">
        <div className="rep-cats-title">{catalog?.title ?? 'Reports'}</div>
        <div className="rep-cats-list">
          {catalog?.categories.map((c) => (
            <div key={c.id} className={`rep-cat ${c.id === cat?.id ? 'active' : ''}`} onClick={() => { setCatId(c.id); setRepId(c.reports[0]?.id ?? ''); }}>{c.name}</div>
          ))}
        </div>
        <div className="rep-disclaimer">Reports Disclaimer</div>
      </div>
      <div className="rep-list">
        <div className="rep-list-title">{cat?.name ?? ''}</div>
        <div className="rep-list-items">
          {cat?.reports.map((r) => <div key={r.id} className={`reports-list-item ${r.id === rep?.id ? 'active' : ''}`} onClick={() => setRepId(r.id)}>{r.name}</div>)}
        </div>
      </div>
      <div className="rep-detail">
        <div className="rep-detail-title">{rep?.name ?? ''}</div>
        {rep && (
          <div className="rep-detail-body">
            {rep.generate ? (
              <button type="button" className="rep-generate" onClick={() => generate('PDF')}>Generate Report</button>
            ) : rep.chips.length > 0 ? (
              <div className="rep-chips">{rep.chips.map((c) => <button type="button" key={c} className="rep-chip" onClick={() => generate('Excel')}>{c}</button>)}</div>
            ) : (
              <div className="rep-chips"><button type="button" className="rep-chip" onClick={() => generate('Excel')}>Excel</button><button type="button" className="rep-chip" onClick={() => generate('PDF')}>PDF</button></div>
            )}
            {rep.generate && <div className="rep-saved"><span className="material-icons">bookmark</span>Saved Configs</div>}
            <div className="rep-desc">{rep.description.map((d, i) => <p key={i}>{d}</p>)}</div>
          </div>
        )}
        {rep?.hasPreview && (
          <div className="rep-preview">
            <div className="rep-preview-img">
              <span className="line dark" /><span className="line head" /><span className="line" /><span className="line" /><span className="line" /><span className="line" /><span className="line" />
            </div>
            <button type="button" className="rep-preview-btn" onClick={() => generate('PDF')}>View Sample Report</button>
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </Sheet>
  );
}
