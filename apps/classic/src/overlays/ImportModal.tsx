import { useEffect, useMemo, useState } from 'react';
import type { Broker, ImportTemplate } from '@mprofit/shared';
import { AUTO_IMPORT_EMAIL } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { Modal, PrimaryButton } from '../components/Modal';
import { useOverlay } from '../state/OverlayContext';

type Step = 'Stocks' | 'Mutual Funds' | 'Banks' | 'F&O' | 'Others';
const CARDS: { step: Step; icon: string }[] = [
  { step: 'Stocks', icon: 'stocks' }, { step: 'Mutual Funds', icon: 'mf' }, { step: 'Banks', icon: 'banks' }, { step: 'F&O', icon: 'fo' }, { step: 'Others', icon: 'others' },
];
const TITLES: Record<Step, string> = { Stocks: 'Import your Stock trades', 'Mutual Funds': 'Import your Mutual Fund transactions', Banks: 'Import your Bank statements', 'F&O': 'Import your F&O trades', Others: 'Import other assets' };

// Top nav → Import: Select Asset Type → Step 1 (broker/template) → Step 2 (upload)
export function ImportModal({ initialStep, onClose }: { initialStep?: Step; onClose: () => void }) {
  const { open } = useOverlay();
  const [step, setStep] = useState<Step | null>(initialStep ?? null);
  const [phase, setPhase] = useState<1 | 2>(1);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [brokerQ, setBrokerQ] = useState('');
  const [broker, setBroker] = useState<Broker | null>(null);
  const [template, setTemplate] = useState<ImportTemplate | null>(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => { void classicApi.brokers().then(setBrokers); }, []);
  useEffect(() => { if (step) { setPhase(1); setBroker(null); setTemplate(null); setResult(null); void classicApi.importTemplates(step).then(setTemplates); } }, [step]);
  const filteredBrokers = useMemo(() => brokers.filter((b) => (step === 'F&O' ? b.kind !== 'banks' : b.kind === 'stocks') && b.name.toLowerCase().includes(brokerQ.toLowerCase())), [brokers, brokerQ, step]);

  const upload = async () => {
    const r = await classicApi.upload({ assetType: step, brokerId: broker?.id ?? null, templateId: template?.id ?? null, fileName });
    setResult(r.message);
  };

  if (!step) {
    return (
      <Modal onClose={onClose} size="full" closeStyle="dark-x" className="import-modal">
        <div className="import-title">Select Asset Type</div>
        <div className="import-cards">
          {CARDS.map((c) => (
            <div key={c.step} className="import-card" onClick={() => setStep(c.step)} role="button">
              <img src={`/assets/icons/import/${c.icon}.svg`} alt="" /><span>{c.step}</span>
            </div>
          ))}
        </div>
        <div className="import-dots"><i className="active" /><i /><i /></div>
        <button type="button" className="need-help" onClick={() => open({ kind: 'help' })}><span className="material-icons" style={{ fontSize: 18 }}>help_outline</span>Need Help?</button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} size="full" closeStyle="dark-x" className="import-modal import-step2">
      <button type="button" className="btn btn-ghost btn-sm" style={{ position: 'absolute', left: 24, top: 24, borderRadius: 20, background: '#f0f3f7', border: 0 }} onClick={() => (phase === 2 ? setPhase(1) : setStep(null))}><i className="fas fa-chevron-left" style={{ marginRight: 6 }} />Back</button>
      <div className="import-title" style={{ textAlign: 'center' }}>{TITLES[step]}</div>
      <div style={{ maxWidth: 520, margin: '0 auto', border: '1px solid #e5e5e5', borderRadius: 8, padding: '28px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        {phase === 1 ? (
          <>
            {(step === 'Stocks' || step === 'F&O') && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 500, marginBottom: 14 }}><strong>Step 1</strong> Select Broker</h3>
                <div className="asset-search-container"><input className="asset-search-box" style={{ width: '100%' }} placeholder="Search by broker name, for example Zerodha" value={brokerQ} onChange={(e) => setBrokerQ(e.target.value)} /></div>
                {brokerQ && (
                  <div className="import-brokers" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {filteredBrokers.map((b) => <div key={b.id} className={`import-broker ${broker?.id === b.id ? 'active' : ''}`} onClick={() => { setBroker(b); setPhase(2); }}>{b.name}</div>)}
                    {filteredBrokers.length === 0 && <div className="empty-hint">No broker found</div>}
                  </div>
                )}
                <p style={{ fontSize: 12, fontWeight: 600, marginTop: 12 }}>Can't find your broker? <a style={{ color: 'var(--blue)', textDecoration: 'underline' }} onClick={() => open({ kind: 'contactSupport' })}>Contact us</a></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0' }}><span style={{ flex: 1, height: 1, background: '#ddd' }} /><span style={{ color: '#666' }}>or</span><span style={{ flex: 1, height: 1, background: '#ddd' }} /></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Sync your trade data from <img src="/assets/icons/brokers/zerodha.svg" alt="Zerodha" style={{ height: 22 }} /></div>
                  <PrimaryButton className="btn-navy" onClick={() => open({ kind: 'apiConnector', provider: 'Zerodha' })}>Connect your Zerodha account</PrimaryButton>
                </div>
              </>
            )}
            {(step === 'Mutual Funds' || step === 'Banks' || step === 'Others') && (
              <>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 500, marginBottom: 14 }}><strong>Step 1</strong> Select Template</h3>
                <div className="import-templates">
                  {templates.map((t) => (
                    <div key={t.id} className={`import-template ${template?.id === t.id ? 'active' : ''}`} onClick={() => { setTemplate(t); setPhase(2); }}>
                      <span>{t.name}</span><span>{t.recommended && <span className="pill rec">Recommended</span>}<span className="pill">{t.format}</span></span>
                    </div>
                  ))}
                </div>
                {step === 'Mutual Funds' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, justifyContent: 'center' }}>
                    <img src="/assets/icons/brokers/mf-central.png" alt="MF Central" style={{ height: 28 }} />
                    <PrimaryButton className="btn-navy btn-sm" onClick={() => open({ kind: 'apiConnector', provider: 'MF CAS' })}>Sync via MF Central CAS</PrimaryButton>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 500, marginBottom: 6 }}><strong>Step 2</strong> Upload file</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{broker ? `Broker: ${broker.name}` : template ? `Template: ${template.name}` : ''}</p>
            {broker && templates.length > 0 && (
              <div className="import-templates">
                {templates.map((t) => <div key={t.id} className={`import-template ${template?.id === t.id ? 'active' : ''}`} onClick={() => setTemplate(t)}><span>{t.name}</span><span>{t.recommended && <span className="pill rec">Recommended</span>}<span className="pill">{t.format}</span></span></div>)}
              </div>
            )}
            <label className="dropzone" style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" style={{ display: 'none' }} onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
              <span className="material-icons" style={{ fontSize: 40, color: 'var(--navy-2)' }}>cloud_upload</span>
              <div style={{ marginTop: 8 }}>{fileName ? fileName : <><strong>Browse</strong> or drop your file here</>}</div>
            </label>
            {(template?.autoImport || broker) && <p className="saved-note">Auto-import: forward statements to <strong>{AUTO_IMPORT_EMAIL}</strong></p>}
            <div className="modal-actions"><PrimaryButton disabled={!fileName} onClick={() => void upload()}>Upload</PrimaryButton></div>
            {result && <div className="toast">{result}</div>}
          </>
        )}
      </div>
      <div className="import-dots"><i /><i className="active" /><i /></div>
      <button type="button" className="need-help" onClick={() => open({ kind: 'help' })}><span className="material-icons" style={{ fontSize: 18 }}>help_outline</span>Need Help?</button>
    </Modal>
  );
}
