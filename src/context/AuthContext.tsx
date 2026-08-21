import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { User, PatientProfile, ProviderProfile, UserRole } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  profile: PatientProfile | ProviderProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const token = api.getToken();
      if (token) {
        const data = await api.getMe();
        setUser(data.user);
        setProfile(data.profile);
      } else {
        // Default to demo patient account for immediate testability
        await switchDemoRole('PATIENT');
      }
    } catch (err) {
      console.warn('Initial session check failed, loading demo user:', err);
      try {
        await switchDemoRole('PATIENT');
      } catch {
        setUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'patient@example.com';
      if (role === 'PROVIDER') email = 'doctor@example.com';
      if (role === 'ADMIN') email = 'admin@example.com';

      const res = await api.login({ email, password: 'Password123!' });
      setUser(res.user);
      setProfile(res.profile);
    } catch (err) {
      console.error('Switch demo role error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
