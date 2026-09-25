import { useState } from 'react';
import type { Preferences } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { GhostButton, Modal, PrimaryButton } from '../components/Modal';
import { useWorkspace } from '../state/WorkspaceContext';

const DEFAULTS: Preferences = { defaultSort: 'Name', sortDirection: 'Ascending', zeroHoldings: 'Hide', decimals: 'Show', separator: 'Lakhs', fontSize: 'Small', pmsWithinGroups: 'Line-item', showPortfolioFullName: 'Yes' };

// Toolbar → Preferences (06-modals-dropdowns/14-preferences-open.png)
export function PreferencesModal({ onClose }: { onClose: () => void }) {
  const { preferences, setPreferences, reloadSummary } = useWorkspace();
  const [p, setP] = useState<Preferences>(preferences ?? DEFAULTS);
  const set = <K extends keyof Preferences>(k: K, v: Preferences[K]) => setP((s) => ({ ...s, [k]: v }));
  const apply = async () => { const saved = await classicApi.savePreferences(p); setPreferences(saved); await reloadSummary(); onClose(); };

  const Radio = <K extends keyof Preferences>({ k, a, b }: { k: K; a: Preferences[K]; b: Preferences[K] }) => (
    <div className="radio-group">
      <label className="radio"><input type="radio" checked={p[k] === a} onChange={() => set(k, a)} />{String(a)}</label>
      <label className="radio"><input type="radio" checked={p[k] === b} onChange={() => set(k, b)} />{String(b)}</label>
    </div>
  );

  return (
    <Modal title="Set Preferences" onClose={onClose} size="md" className="pref-modal" footer={<><PrimaryButton onClick={() => void apply()}>Apply</PrimaryButton><GhostButton onClick={onClose}>Cancel</GhostButton></>}>
      <div className="pref-scroll">
        <div className="pref-row"><span className="form-label">Default Sort:</span>
          <select className="form-control form-select" value={p.defaultSort} onChange={(e) => set('defaultSort', e.target.value as Preferences['defaultSort'])}>
            <option>Name</option><option>Current Value</option><option>Amount Invested</option><option>Unrealised Gain</option>
          </select>
        </div>
        <div className="pref-row"><span className="form-label">Sort Direction:</span><Radio k="sortDirection" a="Ascending" b="Descending" /></div>
        <div className="pref-row"><span className="form-label">Zero Holdings:</span><Radio k="zeroHoldings" a="Show" b="Hide" /></div>
        <div className="pref-row"><span className="form-label">Decimals:</span><Radio k="decimals" a="Show" b="Hide" /></div>
        <div className="pref-row"><span className="form-label">Separator:</span><Radio k="separator" a="Lakhs" b="Millions" /></div>
        <div className="pref-row"><span className="form-label">Font Size:</span><Radio k="fontSize" a="Small" b="Large" /></div>
        <div className="pref-row"><span className="form-label">PMS within Groups:</span><Radio k="pmsWithinGroups" a="Underlyings" b="Line-item" /></div>
        <div className="pref-row"><span className="form-label">Show Portfolio Full Name:</span><Radio k="showPortfolioFullName" a="Yes" b="No" /></div>
      </div>
    </Modal>
  );
}
