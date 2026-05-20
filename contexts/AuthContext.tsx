import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authService } from '../services/auth';
import { onSessionExpired } from '../services/authEvents';
import { getItem } from '../utils/safeStorage';

interface User {
  id: string;
  username: string;
  email: string;
  referral_code?: string;
  wallet_balance?: number;
  is_registered?: boolean;
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  sessionNotice: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: (navigation?: any, options?: { silent?: boolean; reason?: 'manual' | 'expired' }) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = authService.storageKeys.accessToken;
const REFRESH_TOKEN_KEY = authService.storageKeys.refreshToken;
const USER_KEY = authService.storageKeys.user;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadAuthData();
  }, []);

  useEffect(() => {
    if (!sessionNotice) {
      return;
    }

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = setTimeout(() => {
      setSessionNotice(null);
    }, 3000);

    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, [sessionNotice]);

  const loadAuthData = async () => {
    try {
      const storedToken = await getItem(TOKEN_KEY);
      const storedRefreshToken = await getItem(REFRESH_TOKEN_KEY);
      const storedUser = await getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshTokenValue(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const data = await authService.login({ username, password });

    const userInfo = {
      id: data.user?.id || '',
      username: data.user?.username || username,
      email: data.user?.email || '',
      referral_code: data.user?.referral_code,
      wallet_balance: data.user?.wallet_balance || 0,
      is_registered: Boolean((data.user as any)?.is_registered),
      is_verified: Boolean((data.user as any)?.is_verified),
    };

    await authService.persistSession({
      accessToken: data.access,
      refreshToken: data.refresh,
      user: userInfo,
    });

    setToken(data.access);
    setRefreshTokenValue(data.refresh);
    setUser(userInfo);
  };

  const register = async (username: string, email: string, password: string, referralCode?: string) => {
    const response = await authService.register({
      username,
      email,
      phone: '',
      password,
      password2: password,
      referral_code: referralCode,
    });

    if (!response) {
      throw new Error('Registration failed');
    }

    await login(username, password);
  };

  const safeNavigateHome = async (navigation?: any) => {
    if (navigation && typeof navigation.replace === 'function') {
      navigation.replace('/landing');
      return;
    }

    if (navigation && typeof navigation.reset === 'function') {
      navigation.reset({ index: 0, routes: [{ name: 'landing' }] });
      return;
    }

    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('landing');
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/landing';
    }
  };

  const logout = async (navigation?: any, options?: { silent?: boolean; reason?: 'manual' | 'expired'; message?: string }) => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    let backendLogoutConnected = true;

    try {
      const tokenToRevoke = refreshTokenValue || (await authService.getStoredRefreshToken());
      const revokeResult = await authService.revokeSession(tokenToRevoke);
      backendLogoutConnected = revokeResult.connected;
    } catch (error) {
      backendLogoutConnected = false;
      console.warn('Backend logout failed, continuing local cleanup:', error);
    }

    try {
      await authService.clearAuthStorage();
    } catch (error) {
      console.warn('Auth storage cleanup failed:', error);
    }

    setToken(null);
    setRefreshTokenValue(null);
    setUser(null);

    try {
      await safeNavigateHome(navigation);
    } catch (error) {
      console.warn('Navigation reset failed during logout:', error);
      if (typeof window !== 'undefined') {
        window.location.href = '/landing';
      }
    }

    if (!options?.silent) {
      if (options?.reason === 'expired') {
        setSessionNotice(options.message || 'Your session expired');
      } else if (!backendLogoutConnected) {
        setSessionNotice('Logged out locally. Server logout could not be confirmed.');
      } else {
        setSessionNotice('You have been logged out');
      }
    } else if (options?.reason === 'expired') {
      setSessionNotice(options.message || 'Your session expired');
    }

    setIsLoggingOut(false);
  };

  const refreshToken = async () => {
    try {
      const data = await authService.refreshToken(refreshTokenValue);

      await authService.persistSession({
        accessToken: data.access,
        refreshToken: data.refresh || refreshTokenValue || '',
        user: (user || {}) as Record<string, unknown>,
      });

      setToken(data.access);
      if (data.refresh) {
        setRefreshTokenValue(data.refresh);
      }
    } catch (error) {
      await logout(undefined, { silent: true, reason: 'expired', message: 'Your session expired' });
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onSessionExpired((message) => {
      void logout(undefined, { silent: true, reason: 'expired', message });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isLoggingOut,
        sessionNotice,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
