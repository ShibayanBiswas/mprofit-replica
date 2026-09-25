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
