import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import type { User } from '../types';

interface AuthContextType {
  user:     User | null;
  token:    string | null;
  isLoading: boolean;
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
  isRole:   (...roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Role → permissions map (mirrors the backend seed data)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['create_asset','update_asset','delete_asset','assign_asset','view_reports','manage_users','view_assets','manage_maintenance'],
  it_admin:    ['create_asset','update_asset','delete_asset','assign_asset','view_reports','view_assets','manage_maintenance'],
  employee:    ['view_assets'],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tv_token');
    const storedUser  = localStorage.getItem('tv_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch { /* ignore parse errors */ }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user: u, token: t } = res.data.data;
    localStorage.setItem('tv_token', t);
    localStorage.setItem('tv_user',  JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* best-effort */ }
    localStorage.removeItem('tv_token');
    localStorage.removeItem('tv_user');
    setToken(null);
    setUser(null);
  }, []);

  const isRole = useCallback((...roles: string[]) => {
    return !!user && roles.includes(user.role_name);
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role_name]?.includes(permission) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

