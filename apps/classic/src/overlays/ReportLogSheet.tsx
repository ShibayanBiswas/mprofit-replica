import { useEffect, useState } from 'react';
import type { ReportJob } from '@mprofit/shared';
import { fmtDateTime } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { ToolPanel } from '../components/Sheet';

// Report Log: queued/ready report jobs (polls while any job is Running).
export function ReportLogSheet({ onClose }: { onClose: () => void }) {
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => classicApi.reportJobs().then((j) => { if (alive) setJobs(j); });
    void load();
    const t = setInterval(() => { void load(); }, 1500);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return (
    <ToolPanel title="Report Log" onClose={onClose}>
      <table className="data-table">
        <thead><tr><th>Report</th><th>Portfolio</th><th>Format</th><th>Created</th><th>Status</th><th /></tr></thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id}><td>{j.reportName}</td><td>{j.portfolioName}</td><td>{j.format}</td><td>{fmtDateTime(j.createdAt)}</td><td>{j.status}</td>
              <td>{j.status === 'Ready' && <button type="button" className="btn btn-navy btn-xs">Download</button>}</td></tr>
          ))}
          {jobs.length === 0 && <tr><td colSpan={6} className="empty-hint">No reports generated yet</td></tr>}
        </tbody>
      </table>
    </ToolPanel>
  );
}
