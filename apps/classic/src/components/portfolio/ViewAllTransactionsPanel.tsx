import { useEffect, useState } from 'react';
import type { Transaction } from '@mprofit/shared';
import { fmtAmount, fmtDateSlash } from '@mprofit/shared';
import { classicApi } from '../../api/classicApi';
import { useWorkspace } from '../../state/WorkspaceContext';

// Actions → View All Transactions replaces the holdings panel (not a modal) — see 04-transactions/20-view-all-transactions.png
export function ViewAllTransactionsPanel({ onBack }: { onBack: () => void }) {
  const { portfolio, mode, assetClasses } = useWorkspace();
  const [tx, setTx] = useState<Transaction[]>([]);
  const [assetType, setAssetType] = useState('');
  const [txType, setTxType] = useState('');

  useEffect(() => { if (portfolio) void classicApi.transactions(portfolio.id).then(setTx); }, [portfolio]);
  const shown = tx.filter((t) => (!assetType || t.assetType === assetType) && (!txType || t.type === txType));

  const exportCsv = () => {
    const head = 'Asset Type,Type,Asset Name,Date,Quantity,Rate,Amount';
    const body = shown.map((t) => [t.assetType, t.type, `"${t.assetName}"`, fmtDateSlash(t.date), t.quantity, t.rate, t.amount].join(','));
    const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${portfolio?.shortName ?? 'portfolio'}-transactions.csv`; a.click();
  };

  return (
    <div className="vat">
      <div className="vat-crumbs">
        <span className="vat-back" onClick={onBack}><i className="fas fa-arrow-left" /> Back</span>
        <span className="vat-crumb">{mode}</span>
        <span className="material-icons" style={{ fontSize: 16, color: 'var(--navy-2)' }}>chevron_right</span>
        <span className="vat-crumb">All Transactions</span>
      </div>
      <div className="vat-filters">
        <span className="vat-filter-lbl">Filter:</span>
        <label>Asset Type</label>
        <select className="form-control form-select vat-select" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
          <option value="">Select</option>
          {assetClasses.filter((a) => a.mode === mode).map((a) => <option key={a.code} value={a.label}>{a.label}</option>)}
        </select>
        <label>Asset</label>
        <select className="form-control form-select vat-select wide"><option>Select</option></select>
        <label>Transaction Type</label>
        <select className="form-control form-select vat-select" value={txType} onChange={(e) => setTxType(e.target.value)}>
          <option value="">Select</option><option>Buy</option><option>Sell</option><option>Dividend</option><option>Bonus</option><option>Split</option>
        </select>
        <button type="button" className="btn btn-navy btn-sm vat-export" onClick={exportCsv}>Export to CSV</button>
      </div>
      <div className="vat-summary">Displaying All Transactions for All Assets ({shown.length} Transactions)</div>
      <table className="data-table vat-table">
        <thead><tr><th>Asset Type</th><th>Type</th><th>Asset Name</th><th style={{ textAlign: 'right' }}>Date <i className="far fa-calendar-alt" /></th><th style={{ textAlign: 'right' }}>Quantity</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
        <tbody>
          {shown.map((t) => (
            <tr key={t.id}><td>{t.assetType}</td><td>{t.type}</td><td>{t.assetName}</td><td style={{ textAlign: 'right' }}>{fmtDateSlash(t.date)}</td><td style={{ textAlign: 'right' }}>{t.quantity}</td><td style={{ textAlign: 'right' }}>{fmtAmount(t.rate)}</td><td style={{ textAlign: 'right' }}>{fmtAmount(t.amount)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
