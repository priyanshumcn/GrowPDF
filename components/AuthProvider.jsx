'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TOKEN_NAME } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const api = useCallback(async (path, opts = {}) => {
    const headers = { ...(opts.headers || {}) };
    if (!(opts.body instanceof FormData) && opts.body && typeof opts.body === 'object') {
      headers['content-type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(path, { ...opts, headers, credentials: 'include' });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    setUser(data.user);
    return data.user;
  }, [api]);

  const register = useCallback(async (payload) => {
    const data = await api('/api/auth/register', { method: 'POST', body: payload });
    setUser(data.user);
    return data.user;
  }, [api]);

  const googleLogin = useCallback(async (idToken) => {
    const data = await api('/api/auth/google', { method: 'POST', body: { idToken } });
    setUser(data.user);
    return data.user;
  }, [api]);

  const logout = useCallback(async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
    setUser(null);
  }, [api]);

  const refresh = useCallback(async () => { await fetchMe(); }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, refresh, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { TOKEN_NAME };
