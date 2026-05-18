import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

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

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/login/`, credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/register/`, credentials);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data;
  },

  async getProfile(token: string) {
    const response = await axios.get(`${API_BASE_URL}/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getDashboard(token: string) {
    const response = await axios.get(`${API_BASE_URL}/dashboard/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
