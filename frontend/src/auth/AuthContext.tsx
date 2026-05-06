import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, API_BASE } from '../api/client';

type User = { sub?: string; id?: string; username?: string; email?: string; role: 'ADMIN' | 'USER' | 'VIEWER'; method?: string; exp?: number };
type AuthContextValue = {
  user?: User;
  token?: string;
  idToken?: string;
  loginLocal: (username: string, password: string) => Promise<void>;
  loginKeycloak: () => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodePayload(token?: string) {
  if (!token) return undefined;
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return undefined; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token') ?? undefined);
  const [idToken, setIdToken] = useState(() => localStorage.getItem('id_token') ?? undefined);
  const [user, setUser] = useState<User | undefined>();

  async function refreshMe() {
    const storedAccessToken = localStorage.getItem('access_token') ?? undefined;
    const storedIdToken = localStorage.getItem('id_token') ?? undefined;
    setToken(storedAccessToken);
    setIdToken(storedIdToken);
    if (!storedAccessToken) return setUser(undefined);
    const me = await api<{ user: User }>('/api/auth/me');
    setUser(me.user);
  }

  async function loginLocal(username: string, password: string) {
    const result = await api<{ token: string; user: User }>('/api/auth/local/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    localStorage.setItem('access_token', result.token);
    localStorage.removeItem('id_token');
    setToken(result.token);
    setIdToken(undefined);
    setUser({ ...result.user, method: 'local', exp: decodePayload(result.token)?.exp });
  }

  function loginKeycloak() {
    window.location.href = `${API_BASE}/api/auth/oidc/login`;
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    setToken(undefined);
    setIdToken(undefined);
    setUser(undefined);
  }

  useEffect(() => { refreshMe().catch(() => logout()); }, [token]);

  const value = useMemo(() => ({ user, token, idToken, loginLocal, loginKeycloak, logout, refreshMe }), [user, token, idToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
