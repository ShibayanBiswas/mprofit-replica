import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { classicApi } from '../../api/classicApi';
import { portfolioPath } from '../../app/routes';
import { useWorkspace } from '../../state/WorkspaceContext';

interface Leg { id: number; asset: string; qty: string; price: string; brokerage: string }

const emptyLeg = (id: number): Leg => ({ id, asset: '', qty: '', price: '', brokerage: '' });
const num = (v: string) => Number(v.replace(/,/g, '')) || 0;
const money = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Live Contract Note Detail (.../pms/:id/trans/:asset/cn): breadcrumb, header fields, Buy and Sell
// leg tables, a two-row charges block and the sticky save band.
export function ContractNoteForm() {
  const { dbId, family, portfolio, assetClasses, reloadSummary } = useWorkspace();
  const { assetCode = 'EQ' } = useParams<{ assetCode: string }>();
  const navigate = useNavigate();
  const cls = assetClasses.find((a) => a.code === assetCode);

  const [date, setDate] = useState('');
  const [broker, setBroker] = useState('');
  const [contractNo, setContractNo] = useState('');
  const [settlementNo, setSettlementNo] = useState('');
  const [buys, setBuys] = useState<Leg[]>([]);
  const [sells, setSells] = useState<Leg[]>([]);
  const [charges, setCharges] = useState({ stt: '', stamp: '', other: '', gst: '', trans: '' });
  const [autoTransfer, setAutoTransfer] = useState(false);
  const [saving, setSaving] = useState(false);

  const back = () => navigate(portfolioPath(dbId, family?.id ?? '-', portfolio?.id ?? '-'));
  const stockLike = assetCode === 'EQ' || assetCode === 'BND' || assetCode === 'SFO' || assetCode === 'OFO';

  const total = useMemo(() => {
    const buy = buys.reduce((s, l) => s + num(l.qty) * num(l.price) + num(l.brokerage), 0);
    const sell = sells.reduce((s, l) => s + num(l.qty) * num(l.price) - num(l.brokerage), 0);
    const fees = num(charges.stt) + num(charges.stamp) + num(charges.other) + num(charges.gst) + num(charges.trans);
    return sell - buy - fees;
  }, [buys, sells, charges]);

  const save = async () => {
    if (!portfolio) return;
    setSaving(true);
    try {
      for (const l of [...buys, ...sells]) {
        if (!l.asset.trim()) continue;
        const isBuy = buys.includes(l);
        await classicApi.addTransaction(portfolio.id, {
          assetType: cls?.label ?? assetCode, type: isBuy ? 'Buy' : 'Sell', assetName: l.asset,
          date: date || new Date().toISOString().slice(0, 10), quantity: num(l.qty), rate: num(l.price),
          amount: num(l.qty) * num(l.price),
        });
      }
      await reloadSummary();
      back();
    } finally { setSaving(false); }
  };

  if (!stockLike) {
    return <AssetTransactionForm assetCode={assetCode} label={cls?.label ?? assetCode} portfolioId={portfolio?.id} onBack={back} onSaved={async () => { await reloadSummary(); back(); }} />;
  }

  return (
    <div className="cn-main-container">
      <div className="breadcrumb-margins">
        <div className="breadcrumb-container">
          <div className="back-icon" role="button" tabIndex={0} onClick={back} onKeyDown={(e) => e.key === 'Enter' && back()}>
            <i className="material-icons md-18 icon-middle">arrow_back</i><span>Back</span>
          </div>
          <div className="click-item past-item" role="button" tabIndex={0} onClick={back} onKeyDown={(e) => e.key === 'Enter' && back()}>
            <span>INV</span><i className="material-icons md-18 icon-middle next-icon">navigate_next</i>
          </div>
          <div className="click-item past-item" role="button" tabIndex={0} onClick={back} onKeyDown={(e) => e.key === 'Enter' && back()}>
            <span>{cls?.label ?? assetCode}</span><i className="material-icons md-18 icon-middle next-icon">navigate_next</i>
          </div>
          <div><span>Contract Note Detail</span></div>
        </div>
      </div>

      <div className="cn-scroll">
        <div className="cn-padding">
          <div className="cn-options-container">
            <div className="cn-item-container">
              <span className="cn-item-lbl">Date:</span>
              <input className="form-date-dropdown" style={{ width: 210 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
            </div>
            <div className="cn-item-container">
              <span className="cn-item-lbl">Broker:</span>
              <input className="form-date-dropdown" style={{ width: 325 }} value={broker} onChange={(e) => setBroker(e.target.value)} aria-label="Broker" />
            </div>
            <div className="cn-item-container">
              <span className="cn-item-lbl">Cntr. Note:</span>
              <div className="cn-input-container" style={{ width: 162 }}>
                <input className="mpr-input" value={contractNo} onChange={(e) => setContractNo(e.target.value)} aria-label="Contract Note" />
              </div>
            </div>
            <div className="cn-item-container">
              <span className="cn-item-lbl">Settlement No:</span>
              <div className="cn-input-container" style={{ width: 133 }}>
                <input className="mpr-input" value={settlementNo} onChange={(e) => setSettlementNo(e.target.value)} aria-label="Settlement No" />
              </div>
            </div>
          </div>

          <LegTable side="buy" rows={buys} setRows={setBuys} />
          <LegTable side="sell" rows={sells} setRows={setSells} />

          <div className="cn-charges-container">
            <div className="cn-charges-row">
              <ChargeField label="STT:" value={charges.stt} onChange={(v) => setCharges((c) => ({ ...c, stt: v }))} />
              <ChargeField label="Stamp Charges:" value={charges.stamp} onChange={(v) => setCharges((c) => ({ ...c, stamp: v }))} />
              <ChargeField label="Other Charges:" value={charges.other} onChange={(v) => setCharges((c) => ({ ...c, other: v }))} />
            </div>
            <div className="cn-charges-row">
              <ChargeField label="GST / S.Tax" value={charges.gst} onChange={(v) => setCharges((c) => ({ ...c, gst: v }))} />
              <ChargeField label="Trans. Charges:" value={charges.trans} onChange={(v) => setCharges((c) => ({ ...c, trans: v }))} />
              <div className="cn-item-container cn-total-item">
                <span className="cn-item-lbl">Total Amount:<span className="cn-total-note">({total < 0 ? 'Payable' : 'Receivable'})</span></span>
                <div className="cn-input-container"><span className="cn-total-value">{money(Math.abs(total))}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="save-container">
        <div className="save-action-btn-container">
          <span className="save-form-action-btn save-action-btn" role="button" tabIndex={0} onClick={() => void save()} onKeyDown={(e) => e.key === 'Enter' && void save()}>{saving ? 'Saving…' : 'Save'}</span>
        </div>
        <div className="save-action-btn-container">
          <span className="save-form-action-btn cancel-action-btn" role="button" tabIndex={0} onClick={back} onKeyDown={(e) => e.key === 'Enter' && back()}>Cancel</span>
        </div>
        <div className="save-action-btn-container save-check">
          <input id="autoTransfer" type="checkbox" checked={autoTransfer} onChange={(e) => setAutoTransfer(e.target.checked)} />
          <label className="mar-0" htmlFor="autoTransfer">Automatically transfer charges?</label>
        </div>
      </div>
    </div>
  );
}

type TxField =
  | { k: 'select'; label: string; key: string; options: string[] }
  | { k: 'text'; label: string; key: string }
  | { k: 'date'; label: string; key: string }
  | { k: 'money'; label: string; key: string }
  | { k: 'show'; label: string; value: string }
  | { k: 'head'; label: string };

const BUY_SELL = ['Buy', 'Sell'];
const INTEREST_TYPE = ['Cumulative', 'Payout'];
const INTEREST_PAY = ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'];
const PREMIUM_MODE = ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'];

function formSpec(code: string, label: string, values: Record<string, string>): { title: string; fields: TxField[] } {
  const qty = Number(values.qty) || 0;
  const rate = Number(values.rate) || 0;
  const stamp = Number(values.stamp) || 0;
  const amount = qty * rate;
  const mf = code === 'MFEQ' || code === 'MFDT' || code === 'SIF';
  if (mf) {
    return {
      title: code === 'SIF' ? 'SIF - Buy/Sell' : 'Mutual Funds - Buy/Sell',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: BUY_SELL },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'text', label: 'Fund Name', key: 'name' },
        { k: 'money', label: 'Quantity', key: 'qty' },
        { k: 'money', label: 'NAV', key: 'rate' },
        { k: 'show', label: 'Net Amount', value: money(amount) },
        { k: 'money', label: 'Stamp Charges', key: 'stamp' },
        { k: 'show', label: 'Gross Amount', value: money(amount + stamp) },
      ],
    };
  }
  if (code === 'BNK') {
    return {
      title: 'Banks - Account Transactions',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: ['Deposit', 'Withdrawal'] },
        { k: 'text', label: 'Bank Account', key: 'name' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Amount', key: 'rate' },
        { k: 'text', label: 'Cheque / Ref #', key: 'ref' },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'INS' || code === 'ULP') {
    return {
      title: label,
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: ['New Policy', 'Premium', 'Withdrawal'] },
        { k: 'text', label: 'Plan / Scheme', key: 'name' },
        { k: 'money', label: 'First Premium', key: 'rate' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'text', label: 'Insured Name', key: 'insured' },
        { k: 'text', label: 'Nominee', key: 'nominee' },
        { k: 'money', label: 'Sum Assured', key: 'sum' },
        { k: 'text', label: 'Narration', key: 'note' },
        { k: 'head', label: 'Policy Details' },
        { k: 'select', label: 'Premium Mode', key: 'mode', options: PREMIUM_MODE },
        { k: 'date', label: 'Next Premium Due', key: 'due' },
        { k: 'money', label: 'Next Premium Amt', key: 'dueAmt' },
        { k: 'text', label: 'Term (yrs)', key: 'term' },
        { k: 'date', label: 'Maturity Date', key: 'maturity' },
        { k: 'text', label: 'Premium Term (yrs)', key: 'premTerm' },
        { k: 'text', label: 'Lock-in Period', key: 'lock' },
      ],
    };
  }
  if (code === 'GLD' || code === 'SLV') {
    const kg = code === 'SLV';
    return {
      title: `${label} - Buy / Sell`,
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: BUY_SELL },
        { k: 'text', label: 'Lot Description', key: 'name' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: kg ? 'Quantity (kgs)' : 'Quantity (gms)', key: 'qty' },
        { k: 'money', label: kg ? 'Rate per kg' : 'Rate per gm', key: 'rate' },
        { k: 'show', label: 'Amount', value: money(amount) },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'PR') {
    return {
      title: 'Property - Buy / Sell',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: BUY_SELL },
        { k: 'text', label: 'Property Name', key: 'name' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'text', label: 'Area', key: 'qty' },
        { k: 'money', label: 'Rate/Unit area', key: 'rate' },
        { k: 'show', label: 'Amount', value: money(amount) },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'JWL' || code === 'ART') {
    return {
      title: `${label} - Buy / Sell`,
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: BUY_SELL },
        { k: 'text', label: 'Title', key: 'name' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Amount', key: 'rate' },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'PE') {
    return {
      title: 'Private Equity - Buy / Sell',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: BUY_SELL },
        { k: 'text', label: 'Asset Name', key: 'name' },
        { k: 'head', label: 'Transaction' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Quantity', key: 'qty' },
        { k: 'money', label: 'Rate', key: 'rate' },
        { k: 'show', label: 'Amount', value: money(amount) },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'AIF') {
    return {
      title: 'AIF',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: ['Investment', 'Redemption'] },
        { k: 'text', label: 'Asset Name', key: 'name' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Quantity', key: 'qty' },
        { k: 'money', label: 'Rate', key: 'rate' },
        { k: 'show', label: 'Net Amount', value: money(amount) },
        { k: 'money', label: 'Setup Fees / Stamp Duty', key: 'stamp' },
        { k: 'show', label: 'Gross Amount', value: money(amount + stamp) },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'NCD') {
    return {
      title: 'NCD/Debentures',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: BUY_SELL },
        { k: 'text', label: 'Asset Name', key: 'name' },
        { k: 'money', label: 'Interest Rate', key: 'interest' },
        { k: 'select', label: 'Interest Type', key: 'interestType', options: INTEREST_TYPE },
        { k: 'select', label: 'Interest Payment', key: 'interestPay', options: INTEREST_PAY },
        { k: 'date', label: 'Maturity Date', key: 'maturity' },
        { k: 'text', label: 'Lock-in Period', key: 'lock' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Quantity', key: 'qty' },
        { k: 'money', label: 'Rate', key: 'rate' },
        { k: 'money', label: 'Face Value', key: 'face' },
        { k: 'show', label: 'Amount', value: money(amount) },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'LN') {
    return {
      title: 'Loans',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: ['Borrow', 'Repayment'] },
        { k: 'text', label: 'Asset Name', key: 'name' },
        { k: 'money', label: 'Interest Rate', key: 'interest' },
        { k: 'select', label: 'Interest Type', key: 'interestType', options: INTEREST_TYPE },
        { k: 'select', label: 'Interest Payment', key: 'interestPay', options: ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'] },
        { k: 'date', label: 'Maturity Date', key: 'maturity' },
        { k: 'head', label: 'Transaction' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Amount', key: 'rate' },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  if (code === 'PPF') {
    return {
      title: 'PPF/EPF',
      fields: [
        { k: 'select', label: 'Trans. Type', key: 'type', options: ['Investment', 'Withdrawal'] },
        { k: 'text', label: 'Asset Name', key: 'name' },
        { k: 'money', label: 'Interest Rate', key: 'interest' },
        { k: 'date', label: 'Maturity Date', key: 'maturity' },
        { k: 'text', label: 'Lock-in Period', key: 'lock' },
        { k: 'date', label: 'Date', key: 'date' },
        { k: 'money', label: 'Amount', key: 'rate' },
        { k: 'text', label: 'Narration', key: 'note' },
      ],
    };
  }
  return {
    title: label,
    fields: [
      { k: 'select', label: 'Trans. Type', key: 'type', options: ['Investment', 'Withdrawal'] },
      { k: 'text', label: 'Asset Name', key: 'name' },
      { k: 'money', label: 'Interest Rate', key: 'interest' },
      { k: 'select', label: 'Interest Type', key: 'interestType', options: INTEREST_TYPE },
      { k: 'select', label: 'Interest Payment', key: 'interestPay', options: INTEREST_PAY },
      { k: 'date', label: 'Maturity Date', key: 'maturity' },
      { k: 'text', label: 'Lock-in Period', key: 'lock' },
      { k: 'date', label: 'Date', key: 'date' },
      { k: 'money', label: 'Amount', key: 'rate' },
      { k: 'text', label: 'Narration', key: 'note' },
    ],
  };
}

function AssetTransactionForm({ assetCode, label, portfolioId, onBack, onSaved }: { assetCode: string; label: string; portfolioId?: string; onBack: () => void; onSaved: () => Promise<void> }) {
  const [values, setValues] = useState<Record<string, string>>({ type: '', qty: '0', rate: '0.00', stamp: '0.00' });
  const [saving, setSaving] = useState(false);
  const spec = formSpec(assetCode, label, values);
  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    if (!portfolioId || !(values.name || '').trim()) return;
    setSaving(true);
    try {
      const qty = Number(values.qty) || 0;
      const rate = Number(values.rate) || 0;
      const typeField = spec.fields.find((f) => f.k === 'select' && f.key === 'type');
      const type = values.type || (typeField?.k === 'select' ? typeField.options[0] : 'Buy');
      await classicApi.addTransaction(portfolioId, {
        assetType: label, type,
        assetName: values.name, date: values.date || new Date().toISOString().slice(0, 10),
        quantity: qty, rate, amount: qty ? qty * rate : rate,
      });
      await onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div className="cn-main-container">
      <div className="breadcrumb-margins">
        <div className="breadcrumb-container">
          <div className="back-icon" role="button" tabIndex={0} onClick={onBack}><i className="material-icons md-18 icon-middle">arrow_back</i><span>Back</span></div>
          <div className="click-item past-item"><span>INV</span><i className="material-icons md-18 icon-middle next-icon">navigate_next</i></div>
          <div className="click-item past-item"><span>{label}</span><i className="material-icons md-18 icon-middle next-icon">navigate_next</i></div>
          <div><span>New Transaction</span></div>
        </div>
      </div>
      <div className="cn-scroll">
        <div className="tx-form">
          <h2 className="tx-title">{spec.title}</h2>
          {spec.fields.map((field) => {
            if (field.k === 'head') return <h3 key={field.label} className="tx-section">{field.label}</h3>;
            if (field.k === 'show') {
              return (
                <div key={field.label} className="if-item-container">
                  <span className="if-item-lbl">{field.label}</span>
                  <div className="if-input-container"><span className="tx-value">{field.value}</span></div>
                </div>
              );
            }
            if (field.k === 'select') {
              const value = values[field.key] || field.options[0];
              return (
                <div key={field.label} className="if-item-container">
                  <span className="if-item-lbl">{field.label}</span>
                  <div className="if-input-container">
                    <select className="ng-select-control" value={value} onChange={(e) => set(field.key, e.target.value)}>{field.options.map((o) => <option key={o}>{o}</option>)}</select>
                  </div>
                </div>
              );
            }
            if (field.k === 'date') {
              return (
                <div key={field.label} className="if-item-container">
                  <span className="if-item-lbl">{field.label}</span>
                  <div className="if-input-container">
                    <input className="ng-select-control" placeholder="dd-mm-yyyy" value={values[field.key] || ''} onChange={(e) => set(field.key, e.target.value)} />
                  </div>
                </div>
              );
            }
            return (
              <div key={field.label} className="if-item-container">
                <span className="if-item-lbl">{field.label}</span>
                <div className="if-input-container tx-with-add">
                  {field.key === 'note'
                    ? <textarea className="ng-select-control tx-note" value={values.note || ''} onChange={(e) => set('note', e.target.value)} />
                    : <input className={`ng-select-control ${field.k === 'money' ? 'right' : ''}`} value={values[field.key] ?? (field.k === 'money' ? '0.00' : '')} onChange={(e) => set(field.key, e.target.value)} />}
                  {field.key === 'name' && <button type="button" className="tx-add" aria-label="Add asset"><i className="material-icons">add_circle_outline</i></button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="save-container">
        <div className="save-action-btn-container"><span className="save-form-action-btn save-action-btn" role="button" tabIndex={0} onClick={() => void save()}>{saving ? 'Saving…' : 'Save'}</span></div>
        <div className="save-action-btn-container"><span className="save-form-action-btn cancel-action-btn" role="button" tabIndex={0} onClick={onBack}>Cancel</span></div>
      </div>
    </div>
  );
}

function ChargeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="cn-item-container">
      <span className="cn-item-lbl">{label}</span>
      <div className="cn-input-container">
        <input className="mpr-input right" placeholder="0.00" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      </div>
    </div>
  );
}

function LegTable({ side, rows, setRows }: { side: 'buy' | 'sell'; rows: Leg[]; setRows: (f: (r: Leg[]) => Leg[]) => void }) {
  const verb = side === 'buy' ? 'Purchase' : 'Sale';
  const patch = (id: number, key: keyof Leg, v: string) => setRows((r) => r.map((l) => (l.id === id ? { ...l, [key]: v } : l)));
  const addRow = () => setRows((r) => [...r, emptyLeg(Date.now())]);

  return (
    <div className={`cn-table-container cn-table-${side}`}>
      <table width="100%">
        <tbody>
          <tr className={`cn-row cn-header cn-${side}-title`}>
            <td className="col-first" width="22%"><span>Asset Name</span></td>
            <td className="col-mid right" width="19%"><span>{verb} Quantity</span></td>
            <td className="col-mid right" width="19%"><span>{verb} Price</span></td>
            <td className="col-mid right" width="19%"><span>Brokerage</span></td>
            <td className="col-mid right" width="19%"><span>{verb} Amount</span></td>
            <td className="col-last" width="2%"><span> </span></td>
          </tr>
        </tbody>
      </table>
      <div className="edit-scroll-table">
        <table width="100%">
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="edit-table-row">
                <td className="col-first" width="22%"><input className="edit-cell" placeholder="Asset name" value={l.asset} onChange={(e) => patch(l.id, 'asset', e.target.value)} /></td>
                <td className="col-mid right" width="19%"><input className="edit-cell right" value={l.qty} onChange={(e) => patch(l.id, 'qty', e.target.value)} /></td>
                <td className="col-mid right" width="19%"><input className="edit-cell right" value={l.price} onChange={(e) => patch(l.id, 'price', e.target.value)} /></td>
                <td className="col-mid right" width="19%"><input className="edit-cell right" value={l.brokerage} onChange={(e) => patch(l.id, 'brokerage', e.target.value)} /></td>
                <td className="col-mid right" width="19%">{money(num(l.qty) * num(l.price) + (side === 'buy' ? num(l.brokerage) : -num(l.brokerage)))}</td>
                <td className="col-last" width="2%">
                  <i className="material-icons row-remove" role="button" tabIndex={0} aria-label="Remove row"
                    onClick={() => setRows((r) => r.filter((x) => x.id !== l.id))}
                    onKeyDown={(e) => e.key === 'Enter' && setRows((r) => r.filter((x) => x.id !== l.id))}>close</i>
                </td>
              </tr>
            ))}
            <tr className="edit-table-row edit-table-row-extra">
              <td className="col-first" colSpan={6}>
                <span className="table-add-icon" role="button" tabIndex={0} onClick={addRow} onKeyDown={(e) => e.key === 'Enter' && addRow()}>
                  <span className="table-add-icon-wrap"><i className="material-icons">add_circle_outline</i></span>
                  <span className="table-add-icon-text">Add Row</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
