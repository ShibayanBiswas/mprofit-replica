import { useEffect, useState } from 'react';
import type { GlobalReport } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { Sheet } from '../components/Sheet';
import { useOverlay } from '../state/OverlayContext';

const GLOBAL_ITEMS = ['Global Reporting Workbook', 'Global Positions Report', 'Global Cashflows Report'];

// Tools → Global Reports (03-reports/20-global-reports.png)
export function GlobalReportsSheet({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  const [report, setReport] = useState<GlobalReport | null>(null);
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { void classicApi.globalReports().then(setReport); }, []);

  const generate = () => {
    void classicApi.createReportJob({ reportName: GLOBAL_ITEMS[active], portfolioName: 'All Families', format: 'Excel' }).then(() => {
      setToast(`${GLOBAL_ITEMS[active]} queued — see Reports Log`); setTimeout(() => setToast(null), 2500);
    });
  };

  return (
    <Sheet onClose={onClose} header={(
      <>
        <span className="crumb" style={{ width: 400, borderRight: '1px solid #e5e5e5' }} />
        <span className="spacer" />
        <span className="crumb" style={{ cursor: 'pointer' }} onClick={() => open({ kind: 'reportLog' })}>Reports Log</span>
      </>
    )}>
      <div className="rep-list" style={{ width: 400, background: '#fff' }}>
        <div className="rep-list-title" style={{ background: '#f0f3f7' }}>Global Reports</div>
        <div className="rep-list-items">
          {GLOBAL_ITEMS.map((g, i) => <div key={g} className={`reports-list-item ${i === active ? 'active' : ''}`} style={{ fontSize: 18 }} onClick={() => setActive(i)}>{g}</div>)}
        </div>
        <div className="rep-disclaimer">Reports Disclaimer</div>
      </div>
      <div className="rep-detail">
        <div className="rep-detail-title">{GLOBAL_ITEMS[active]}</div>
        <div className="rep-detail-body">
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button type="button" className="rep-generate" style={{ marginBottom: 0 }} onClick={generate}>Generate Report</button>
            <button type="button" className="rep-generate" style={{ marginBottom: 0, background: '#6b7785' }} onClick={generate}>Download Sample Report</button>
          </div>
          <div className="rep-desc">{active === 0 ? report?.description : active === 1 ? 'Download an Excel report of the current positions across all families and portfolios.' : 'Download an Excel report of the cashflows (inflows and outflows) across all families and portfolios.'}</div>
        </div>
        {active === 0 && report && (
          <div style={{ flex: 1, background: '#f0f3f7', padding: '20px 24px', overflowY: 'auto' }}>
            <table className="data-table" style={{ background: 'transparent' }}>
              <thead><tr><th style={{ color: 'var(--blue)', fontSize: 14, borderBottom: '2px solid #c9d6e2' }}>Report</th><th style={{ color: 'var(--blue)', fontSize: 14, borderBottom: '2px solid #c9d6e2' }}>Description</th></tr></thead>
              <tbody>{report.sections.map((s) => <tr key={s.report}><td style={{ fontWeight: 600, height: 28, padding: '4px 12px', border: 0 }}>{s.report}</td><td style={{ height: 28, padding: '4px 12px', border: 0 }}>{s.description}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </Sheet>
  );
}
