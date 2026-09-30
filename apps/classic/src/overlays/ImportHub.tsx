import { useEffect, useState } from 'react';
import type { ImportTemplate } from '@mprofit/shared';
import { AUTO_IMPORT_EMAIL } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { Sheet } from '../components/Sheet';
import { useOverlay } from '../state/OverlayContext';

type Rail = 'favorites' | 'log' | 'tools';

// Live Import replaces the workspace with a favourites sheet: two saved templates,
// Import Log / Tools tabs, and a New Import drop zone. The asset-type wizard stays
// behind "+ Add a new import template".
export function ImportHub({ onClose }: { onClose: () => void }) {
  const { open } = useOverlay();
  const [rail, setRail] = useState<Rail>('favorites');
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [selectedId, setSelectedId] = useState('t-cams');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void classicApi.importTemplates().then((rows) => {
      setTemplates(rows);
      setSelectedId((id) => rows.some((r) => r.id === id) ? id : (rows.find((r) => r.assetType === 'MF')?.id || rows[0]?.id || ''));
    });
  }, []);

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0] ?? null;

  const upload = async (name: string) => {
    if (!selected || !name) return;
    const r = await classicApi.upload({ assetType: selected.assetType, templateId: selected.id, fileName: name });
    setStatus(r.message);
    setFileName(name);
  };

  return (
    <Sheet onClose={onClose} className="import-hub" header={(
      <>
        <button type="button" className="imp-add" onClick={() => open({ kind: 'importWizard' })}>
          <span className="imp-add-icon">+</span>
          <span>Add a new import template</span>
        </button>
        <span className="imp-head-spacer" />
        <button type="button" className={`imp-tab ${rail === 'log' ? 'active' : ''}`} onClick={() => setRail('log')}>Import Log</button>
        <button type="button" className={`imp-tab ${rail === 'tools' ? 'active' : ''}`} onClick={() => setRail('tools')}>Tools</button>
      </>
    )}>
      {rail === 'favorites' && (
        <>
          <div className="imp-fav">
            <div className="imp-fav-head">
              <span>Name</span>
              <span>Auto Import</span>
              <span>Type</span>
              <span>Format</span>
              <span />
            </div>
            <div className="imp-fav-list">
              {templates.map((t) => (
                <button key={t.id} type="button" className={`imp-fav-row ${selected?.id === t.id ? 'active' : ''}`} onClick={() => { setSelectedId(t.id); setStatus(null); setFileName(''); }}>
                  <span className="imp-fav-name">{t.name}</span>
                  <span />
                  <span className="imp-fav-type">{typeLabel(t.assetType)}</span>
                  <span className={`imp-fav-format ${t.format === 'PDF' ? 'pdf' : 'excel'}`}>{t.format}</span>
                  <span className="material-icons imp-info" title="Template info">info</span>
                </button>
              ))}
            </div>
          </div>
          <div className="imp-detail">
            <div className="imp-new-label">New Import</div>
            <div className="imp-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void upload(f.name); }}>
              <label className="imp-upload">
                Upload File
                <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f.name); }} />
              </label>
              <span className="imp-drop-hint">{fileName || 'or drop files to upload'}</span>
            </div>
            {selected?.autoImport && (
              <p className="imp-auto">Forward statements to <strong>{AUTO_IMPORT_EMAIL}</strong> for auto-import.</p>
            )}
            {status && <p className="imp-status">{status}</p>}
          </div>
        </>
      )}
      {rail === 'log' && (
        <div className="imp-pane">
          <h2>Import Log</h2>
          <p>Queued and completed imports for this family appear here. Upload a file from a favourite template to create a log entry.</p>
          {status && <p className="imp-status">{status}</p>}
        </div>
      )}
      {rail === 'tools' && (
        <div className="imp-pane">
          <h2>Tools</h2>
          <p>Portfolio, asset and folio mapping for a favourite template. Use API in the top nav to connect MF CAS, Zerodha or Dhan.</p>
        </div>
      )}
    </Sheet>
  );
}

function typeLabel(assetType: string) {
  if (assetType === 'Mutual Funds' || assetType === 'MF') return 'MF';
  if (assetType === 'Stocks' || assetType === 'EQ') return 'EQ';
  if (assetType === 'F&O') return 'FO';
  return assetType;
}
