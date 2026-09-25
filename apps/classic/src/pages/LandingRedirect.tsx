import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { classicApi } from '../api/classicApi';
import { useSession } from '../state/SessionContext';
import { NONE, portfolioPath } from '../app/routes';

// After login the live app lands on the last-accessed portfolio (else the first family's group).
// A tenant with no family yet lands on the same shell with `-` placeholders, so the chrome renders
// and the user can create their first family / portfolio from it.
export function LandingRedirect() {
  const { databases } = useSession();
  const [to, setTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = databases[0];
      if (!db) { setError('No database available for this account.'); return; }
      const [settings, families] = await Promise.all([classicApi.settings(), classicApi.families(db.id)]);
      if (settings.lastAccessedPortfolioId) {
        const p = await classicApi.portfolio(settings.lastAccessedPortfolioId).catch(() => null);
        if (p && !cancelled) { setTo(portfolioPath(db.id, p.familyId, p.id)); return; }
      }
      const fam = families[0];
      if (!fam) { if (!cancelled) setTo(portfolioPath(db.id, NONE, NONE)); return; }
      const ports = await classicApi.portfolios(fam.id);
      const first = ports.find((p) => p.isGroup) ?? ports[0];
      if (!cancelled) setTo(portfolioPath(db.id, fam.id, first ? first.id : NONE));
    })().catch((e: Error) => setError(e.message));
    return () => { cancelled = true; };
  }, [databases]);

  if (error) return <div className="boot-screen boot-error">{error}</div>;
  if (!to) return <div className="boot-screen" />;
  return <Navigate to={to} replace />;
}
