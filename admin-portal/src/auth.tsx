import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { me, MeRequestError, type User } from './api';

type AuthContextType = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!token);

  const setAuth = useCallback((t: string, u: User) => {
    localStorage.setItem('token', t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
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
      return me()
        .then((u) => {
          if (!cancelled) setUser(u);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (shouldLogout(err)) logout();
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    probe();

    function onVisibility() {
      if (document.visibilityState !== 'visible' || cancelled || !localStorage.getItem('token')) return;
      me()
        .then((u) => {
          if (!cancelled) setUser(u);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (shouldLogout(err)) logout();
        });
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
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
