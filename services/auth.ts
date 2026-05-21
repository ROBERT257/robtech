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
  phone?: string | null;
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
    phone?: string;
    referral_code?: string;
    wallet_balance?: number;
    is_registered?: boolean;
    is_verified?: boolean;
  };
}

export interface AuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

const AUTH_ENDPOINT = '/auth';

function extractErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data;
  if (!data) {
    return fallback;
  }

  const firstEntryMessage = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === 'string' && first.trim()) {
        return first;
      }
    }
    return null;
  };

  const directMessage =
    firstEntryMessage(data?.detail) ||
    firstEntryMessage(data?.message) ||
    firstEntryMessage(data?.non_field_errors);
  if (directMessage) {
    return directMessage;
  }

  const errors = data?.errors;
  if (errors && typeof errors === 'object') {
    const values = Object.values(errors as Record<string, unknown>);
    for (const value of values) {
      const message = firstEntryMessage(value);
      if (message) {
        return message;
      }
    }
  }

  if (typeof data === 'object') {
    const values = Object.values(data as Record<string, unknown>);
    for (const value of values) {
      const message = firstEntryMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return fallback;
}

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
    try {
      const response = await api.post(`${AUTH_ENDPOINT}/login/`, credentials);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Login failed'));
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(`${AUTH_ENDPOINT}/register/`, credentials);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Registration failed'));
    }
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
