import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onUnauthorized } from '@mprofit/shared';
import type { Database, SessionUser } from '@mprofit/shared';
import { classicApi } from '../api/classicApi';

interface SessionState {
  status: 'loading' | 'anonymous' | 'authenticated';
  user: SessionUser | null;
  databases: Database[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);
const KEEPALIVE_MS = 5 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionState['status']>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [databases, setDatabases] = useState<Database[]>([]);

  const refresh = useCallback(async () => {
    try {
      const me = await classicApi.me();
      setUser(me.user); setDatabases(me.databases); setStatus('authenticated');
    } catch {
      setUser(null); setDatabases([]); setStatus('anonymous');
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => onUnauthorized(() => { setUser(null); setStatus('anonymous'); }), []);
  useEffect(() => {
    if (status !== 'authenticated') return;
    const t = setInterval(() => { void classicApi.keepAlive().catch(() => undefined); }, KEEPALIVE_MS);
    return () => clearInterval(t);
  }, [status]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await classicApi.login(email, password);
    setUser(res.user); setDatabases(res.databases); setStatus('authenticated');
  }, []);
  const logout = useCallback(async () => {
    await classicApi.logout().catch(() => undefined);
    setUser(null); setDatabases([]); setStatus('anonymous');
  }, []);

  const value = useMemo(() => ({ status, user, databases, login, logout, refresh }), [status, user, databases, login, logout, refresh]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession outside SessionProvider');
  return ctx;
}
