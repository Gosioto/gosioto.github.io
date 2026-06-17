import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { me, resumeSession, logoutApi, MeRequestError, type User } from './api';
import { setStoredSessionId } from './sessionKeys';

type AuthContextType = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User, sessionId?: string) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!token);

  const setAuth = useCallback((t: string, u: User, sessionId?: string) => {
    localStorage.setItem('token', t);
    if (sessionId) setStoredSessionId(sessionId);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    if (!token) return Promise.resolve();
    return me().then(setUser);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    function shouldLogout(err: unknown): boolean {
      return err instanceof MeRequestError && (err.kind === 'unauthorized' || err.kind === 'forbidden');
    }

    function probe() {
      return resumeSession()
        .then(({ token: t, user: u, session_id }) => {
          if (cancelled) return;
          localStorage.setItem('token', t);
          setToken(t);
          setStoredSessionId(session_id);
          setUser(u);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (shouldLogout(err)) {
            void logout();
            return;
          }
          return me()
            .then((u) => {
              if (!cancelled) setUser(u);
            })
            .catch((e: unknown) => {
              if (!cancelled && shouldLogout(e)) void logout();
            });
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    probe();

    function onVisibility() {
      if (document.visibilityState !== 'visible' || cancelled || !localStorage.getItem('token')) return;
      resumeSession()
        .then(({ token: t, user: u, session_id }) => {
          if (cancelled) return;
          localStorage.setItem('token', t);
          setToken(t);
          setStoredSessionId(session_id);
          setUser(u);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (shouldLogout(err)) void logout();
        });
    }

    function onSessionRevoked() {
      if (!cancelled) void logout();
    }

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('gosloto:session_revoked', onSessionRevoked);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('gosloto:session_revoked', onSessionRevoked);
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, user, setAuth, refreshUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
