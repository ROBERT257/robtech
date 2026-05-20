import { getItem, removeItem, setItem } from '../utils/safeStorage';
import api, { API_BASE_URL } from './api';

const AUTH_STORAGE_KEYS = {
  accessToken: 'auth_token',
  refreshToken: 'auth_refresh_token',
  user: 'auth_user',
  onboardingState: 'auth_onboarding_state',
  biometricEnabled: 'auth_biometric_enabled',
  rememberMe: 'remember_me',
  sessionFlags: 'auth_session_flags',
  tempCache: 'auth_temp_cache',
} as const;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  phone: string;
  password: string;
  password2: string;
  referral_code?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    username: string;
    email: string;
    referral_code?: string;
    wallet_balance?: number;
  };
}

export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

const AUTH_ENDPOINT = '/auth';

async function persistAuthSession({ accessToken, refreshToken, user }: AuthSessionPayload) {
  await setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  await setItem(AUTH_STORAGE_KEYS.refreshToken, refreshToken);
  await setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
}

async function clearAuthStorage() {
  await Promise.all([
    removeItem(AUTH_STORAGE_KEYS.accessToken),
    removeItem(AUTH_STORAGE_KEYS.refreshToken),
    removeItem(AUTH_STORAGE_KEYS.user),
    removeItem(AUTH_STORAGE_KEYS.onboardingState),
    removeItem(AUTH_STORAGE_KEYS.biometricEnabled),
    removeItem(AUTH_STORAGE_KEYS.rememberMe),
    removeItem(AUTH_STORAGE_KEYS.sessionFlags),
    removeItem(AUTH_STORAGE_KEYS.tempCache),
  ]);
}

async function getStoredRefreshToken() {
  return getItem(AUTH_STORAGE_KEYS.refreshToken);
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post(`${AUTH_ENDPOINT}/login/`, credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post(`${AUTH_ENDPOINT}/register/`, credentials);
    return response.data;
  },

  async refreshToken(refreshToken?: string | null): Promise<{ access: string; refresh?: string }> {
    const token = refreshToken || (await getStoredRefreshToken());
    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await api.post(`${AUTH_ENDPOINT}/token/refresh/`, {
      refresh: token,
    });

    return response.data;
  },

  async revokeSession(refreshToken?: string | null): Promise<{ revoked: boolean; connected: boolean; message?: string }> {
    const token = refreshToken || (await getStoredRefreshToken());

    try {
      const response = await api.post(`${AUTH_ENDPOINT}/logout/`, {
        refresh_token: token || null,
      });
      return {
        revoked: Boolean(response.data?.revoked),
        connected: true,
        message: response.data?.message,
      };
    } catch (error) {
      return {
        revoked: false,
        connected: false,
      };
    }
  },

  async getProfile() {
    const response = await api.get(`${AUTH_ENDPOINT}/profile/`);
    return response.data;
  },

  async getDashboard() {
    const response = await api.get(`${AUTH_ENDPOINT}/dashboard/`);
    return response.data;
  },

  async persistSession(session: AuthSessionPayload) {
    await persistAuthSession(session);
  },

  async clearAuthStorage() {
    await clearAuthStorage();
  },

  async getStoredRefreshToken() {
    return getStoredRefreshToken();
  },

  storageKeys: AUTH_STORAGE_KEYS,
  apiBaseUrl: API_BASE_URL,
};
