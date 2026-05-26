import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'crm_token';
const USER_KEY = 'crm_user';

export type UserInfo = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
};

type AuthState = {
  token: string | null;
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (p: string) => boolean;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<UserInfo | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const base = import.meta.env.VITE_API_BASE ?? '';
    const res = await fetch(`${base.replace(/\/$/, '')}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error('Credenciales inválidas');
    }
    const data = (await res.json()) as { token: string; user: UserInfo };
    localStorage.setItem(STORAGE_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (p: string) => {
      return !!user?.permissions?.includes(p);
    },
    [user]
  );

  const value = useMemo(
    () => ({ token, user, login, logout, hasPermission }),
    [token, user, login, logout, hasPermission]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error('useAuth requires AuthProvider');
  }
  return v;
}
