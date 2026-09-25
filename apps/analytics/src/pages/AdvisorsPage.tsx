import { useCallback, useEffect, useState } from 'react';
import type { Advisor } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';
import { useOverlay } from '../state/OverlayContext';
import { Card, DataTable, EmptyState } from '../components/ui/Primitives';
import { EditIcon, PlusIcon } from '../components/ui/Icons';

// Live: Portfolio → Actions → Manage advisors (/portfolio/advisors). "Manage advisors" + "Add advisor",
// green header ADVISOR NAME | EMAIL | PHONE NUMBER | ACTIONS.
export function AdvisorsPage() {
  const { open } = useOverlay();
  const [rows, setRows] = useState<Advisor[]>([]);
  const [editing, setEditing] = useState<Advisor | null>(null);
  const load = useCallback(() => analyticsApi.advisors().then(setRows), []);
  useEffect(() => { void load(); }, [load]);

  const remove = (a: Advisor) => open({ kind: 'confirm', title: 'Remove advisor', body: `Remove ${a.name}? Portfolios tagged to this advisor will be untagged.`, cta: 'Remove', danger: true, onConfirm: async () => { await analyticsApi.removeAdvisor(a.id); await load(); } });
  const saveEdit = async () => { if (!editing) return; await analyticsApi.updateAdvisor(editing.id, { name: editing.name, email: editing.email, phone: editing.phone }); setEditing(null); await load(); };

  return (
    <div className="an-content advisorsContainer">
      <div className="an-adv-head">
        <h2 className="an-adv-title">Manage advisors</h2>
        <button type="button" className="an-btn-solid" onClick={() => open({ kind: 'addAdvisor', onAdded: () => void load() })}><PlusIcon size={18} color="#fff" />Add advisor</button>
      </div>
      <Card className="an-table-card an-adv-table">
        <DataTable<Advisor>
          rowKey={(r) => r.id}
          columns={[
            { key: 'name', label: 'ADVISOR NAME', sortable: false, render: (r: Advisor) => (editing?.id === r.id ? <input className="an-inline-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /> : r.name) },
            { key: 'email', label: 'EMAIL', sortable: false, render: (r: Advisor) => (editing?.id === r.id ? <input className="an-inline-input" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /> : r.email) },
            { key: 'phone', label: 'PHONE NUMBER', sortable: false, render: (r: Advisor) => (editing?.id === r.id ? <input className="an-inline-input" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /> : r.phone) },
            { key: 'actions', label: 'ACTIONS', sortable: false, align: 'right', render: (r: Advisor) => (
              <span className="an-row-actions">
                {editing?.id === r.id ? (
                  <><button type="button" className="an-btn-text" onClick={() => setEditing(null)}>Cancel</button><button type="button" className="an-btn-solid" style={{ height: 32 }} onClick={() => void saveEdit()}>Save</button></>
                ) : (
                  <><button type="button" className="an-icon-btn" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)}><EditIcon size={18} color="#64677a" /></button><button type="button" className="an-icon-btn an-btn-danger" aria-label={`Remove ${r.name}`} onClick={() => remove(r)}>×</button></>
                )}
              </span>
            ) },
          ]}
          rows={rows}
          empty={<EmptyState title="No advisors yet" text="Add an advisor and tag portfolios to them from Portfolio → Actions → Tag advisor." />}
        />
      </Card>
    </div>
  );
}
