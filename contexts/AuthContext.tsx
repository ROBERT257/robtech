import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../services/api';
import { getItem, removeItem, setItem } from '../utils/safeStorage';

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
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: (navigation?: any) => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await getItem(TOKEN_KEY);
      const storedUser = await getItem(USER_KEY);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Extract user info from token or response
      const userInfo = {
        id: data.user?.id || '',
        username: data.user?.username || username,
        email: data.user?.email || '',
        referral_code: data.user?.referral_code,
        wallet_balance: data.user?.wallet_balance || 0,
        is_registered: data.user?.is_registered || false,
        is_verified: data.user?.is_verified || false,
      };

      await setItem(TOKEN_KEY, data.access);
      await setItem(USER_KEY, JSON.stringify(userInfo));
      
      setToken(data.access);
      setUser(userInfo);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, referralCode?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          password2: password,
          referral_code: referralCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.password?.[0] || data.referral_code?.[0] || 'Registration failed');
      }

      // After successful registration, automatically login
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (router?: any) => {
    try {
      await removeItem(TOKEN_KEY);
      await removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      let navigated = false;
      // Support both expo-router and React Navigation
      if (router && typeof router.replace === 'function') {
        // expo-router
        router.replace('/landing');
        navigated = true;
      } else if (router && typeof router.reset === 'function') {
        // React Navigation
        router.reset({ index: 0, routes: [{ name: 'landing' }] });
        navigated = true;
      } else if (router && typeof router.navigate === 'function') {
        // React Navigation
        router.navigate('landing');
        navigated = true;
      }
      Alert.alert('Logged out', 'You have been logged out successfully.');
      if (!navigated && typeof window !== 'undefined') {
        // fallback: reload app (web)
        window.location.href = '/landing';
      }
    } catch (error) {
      Alert.alert('Logout Error', 'An error occurred during logout. Please try again.');
      console.error('Error during logout:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      await setItem(TOKEN_KEY, data.access);
      setToken(data.access);
    } catch (error) {
      await logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
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
