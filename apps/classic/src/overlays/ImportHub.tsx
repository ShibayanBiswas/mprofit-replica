import { useEffect, useMemo, useState } from 'react';
import type { ImportTemplate } from '@mprofit/shared';
import { AUTO_IMPORT_EMAIL } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { Sheet } from '../components/Sheet';
import { useOverlay } from '../state/OverlayContext';

type Rail = 'favorites' | 'log' | 'tools';

// Live top-nav Import lands on a favourites workspace (not the Select Asset Type wizard).
// "+ Add a new import template" opens the existing bible wizard.
export function ImportHub({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  const [rail, setRail] = useState<Rail>('favorites');
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void classicApi.importTemplates().then((rows) => {
      setTemplates(rows);
      setSelectedId((id) => id || rows[0]?.id || '');
    });
  }, []);

  const filtered = useMemo(
    () => templates.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())),
    [templates, q],
  );
  const selected = filtered.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  const upload = async (name: string) => {
    if (!selected || !name) return;
    const r = await classicApi.upload({ assetType: selected.assetType, templateId: selected.id, fileName: name });
    setStatus(r.message);
    setFileName(name);
  };

  return (
    <Sheet onClose={onClose} className="import-hub" header={(
      <>
        <span className="crumb crumb-first" style={{ cursor: 'pointer' }} onClick={() => open({ kind: 'importWizard' })}>+ Add a new import template</span>
        <span className={`crumb ${rail === 'log' ? 'muted' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setRail('log')}>Import Log</span>
        <span className={`crumb ${rail === 'tools' ? 'muted' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setRail('tools')}>Tools</span>
      </>
    )}>
      {rail === 'favorites' && (
        <>
          <div className="imp-fav">
            <div className="imp-fav-search">
              <input className="asset-search-box" placeholder="Search Favourites" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="imp-fav-head">
              <span>Name</span>
              <span>Auto Import</span>
              <span>Type</span>
              <span>Format</span>
            </div>
            <div className="imp-fav-list">
              {filtered.map((t) => (
                <button key={t.id} type="button" className={`imp-fav-row ${selected?.id === t.id ? 'active' : ''}`} onClick={() => { setSelectedId(t.id); setStatus(null); }}>
                  <span className="imp-fav-name">{t.name}</span>
                  <span className="imp-fav-auto">{t.autoImport ? <i className="fas fa-envelope" title={`Forward to ${AUTO_IMPORT_EMAIL}`} /> : null}</span>
                  <span>{typeLabel(t.assetType)}</span>
                  <span>{t.format}</span>
                </button>
              ))}
              {filtered.length === 0 && <div className="empty-hint" style={{ padding: 24 }}>No favourites match</div>}
            </div>
          </div>
          <div className="imp-detail">
            {selected ? (
              <>
                <h2 className="imp-detail-title">{selected.name} ({typeLabel(selected.assetType)})</h2>
                <div className="imp-drop">
                  <label className="imp-upload">
                    Upload File
                    <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f.name); }} />
                  </label>
                  <span className="imp-drop-hint">{fileName || 'or drop files to upload'}</span>
                </div>
                {selected.autoImport && (
                  <p className="imp-auto">Forward statements to <strong>{AUTO_IMPORT_EMAIL}</strong> for auto-import.</p>
                )}
                <div className="imp-maps">
                  <button type="button" className="imp-map">Porfolio Mapping</button>
                  <button type="button" className="imp-map">Asset Mapping</button>
                  <button type="button" className="imp-map">Folio Mapping</button>
                </div>
                {status && <p className="imp-status">{status}</p>}
              </>
            ) : (
              <p className="empty-hint">Select a favourite template</p>
            )}
          </div>
        </>
      )}
      {rail === 'log' && (
        <div className="imp-pane">
          <h2>Import Log</h2>
          <p>Queued and completed imports for this family appear here. Upload a file from Favourites to create a log entry.</p>
          {status && <p className="imp-status">{status}</p>}
        </div>
      )}
      {rail === 'tools' && (
        <div className="imp-pane">
          <h2>Import Tools</h2>
          <p>Portfolio, asset and folio mapping for the selected template stay on the Favourites pane. Use API in the top nav to connect MF CAS, Zerodha or Dhan.</p>
        </div>
      )}
    </Sheet>
  );
}

function typeLabel(assetType: string) {
  if (assetType === 'Mutual Funds' || assetType === 'MF') return 'MF';
  if (assetType === 'Stocks') return 'EQ';
  if (assetType === 'F&O') return 'FO';
  return assetType;
}
