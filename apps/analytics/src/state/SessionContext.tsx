import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onUnauthorized } from '@mprofit/shared';
import type { Database, SessionUser } from '@mprofit/shared';
import { analyticsApi } from '../api/analyticsApi';

// Analytics never shows a login form: the session cookie is shared with Classic (same host).
interface SessionState {
  status: 'loading' | 'anonymous' | 'authenticated';
  user: SessionUser | null;
  databases: Database[];
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);
const KEEPALIVE_MS = 5 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionState['status']>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    analyticsApi.me()
      .then((me) => { setUser(me.user); setDatabases(me.databases); setStatus('authenticated'); })
      .catch(() => { setUser(null); setDatabases([]); setStatus('anonymous'); });
  }, []);
  useEffect(() => onUnauthorized(() => { setUser(null); setStatus('anonymous'); }), []);
  useEffect(() => {
    if (status !== 'authenticated') return;
    const t = setInterval(() => { void analyticsApi.keepAlive().catch(() => undefined); }, KEEPALIVE_MS);
    return () => clearInterval(t);
  }, [status]);

  const logout = useCallback(async () => {
    await analyticsApi.logout().catch(() => undefined);
    setUser(null); setDatabases([]); setStatus('anonymous');
  }, []);

  const value = useMemo(() => ({ status, user, databases, logout }), [status, user, databases, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession outside SessionProvider');
  return ctx;
}
