import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, getToken, removeToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setOwner(null);
      setInitializing(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setOwner(data.owner);
    } catch {
      removeToken();
      setOwner(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onUnauthorized = () => setOwner(null);
    window.addEventListener('vtag:unauthorized', onUnauthorized);
    return () => window.removeEventListener('vtag:unauthorized', onUnauthorized);
  }, [refresh]);

  const signIn = useCallback(async (phone, otp) => {
    const { data } = await authApi.verifyOtp(phone, otp);
    setToken(data.token);
    setOwner(data.owner);
    return data.owner;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setOwner(null);
  }, []);

  const value = useMemo(
    () => ({ owner, initializing, signIn, logout, refresh, isAuthenticated: Boolean(owner) }),
    [owner, initializing, signIn, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
