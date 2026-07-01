//this is the detail code of authentication Context //


import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserRole, AuthState } from '@/types';
import { authApi, initializeData } from '@/utils/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    initializeData();
    authApi.getCurrentUser().then(user => {
      const token = authApi.getToken();
      setState({
        user,
        token,
        isAuthenticated: !!user,
        isLoading: false,
      });
    }).catch(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone: string; role: UserRole }) => {
    const { user, token } = await authApi.register(data);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const refreshUser = useCallback(async () => {
    const user = await authApi.getCurrentUser();
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, hasRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
