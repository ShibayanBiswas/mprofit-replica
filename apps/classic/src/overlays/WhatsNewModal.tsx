import { useEffect, useState } from 'react';
import type { ChangeLog } from '@mprofit/shared';
import { fmtOrdinalDate } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';
import { ToolPanel } from '../components/Sheet';

// Top nav gift icon → "What's new?" changelog (06-modals-dropdowns/07-referral-gift-open.png)
export function WhatsNewModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<ChangeLog[]>([]);
  useEffect(() => { void classicApi.changelog().then(setItems); }, []);
  return (
    <ToolPanel title="What's new?" onClose={onClose}>
      {items.map((c) => (
        <div key={c.id} className="whatsnew-item">
          <h3 style={{ color: 'var(--blue)', fontSize: 20 }}>{c.title}</h3>
          <div className="date">{fmtOrdinalDate(c.date)}</div>
          {c.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {c.bullets.length > 0 && <ul>{c.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
        </div>
      ))}
      {items.length === 0 && <div className="empty-hint">Nothing new yet.</div>}
    </ToolPanel>
  );
}
