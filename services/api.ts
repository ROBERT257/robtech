import axios from 'axios';
import { Platform } from 'react-native';
import { getItem } from '../utils/safeStorage';
import { emitSessionExpired } from './authEvents';

const DEFAULT_API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8081/api'
  : 'http://127.0.0.1:8081/api';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = configuredApiBaseUrl
  ? configuredApiBaseUrl.replace(/\/$/, '')
  : DEFAULT_API_BASE_URL;
const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

async function getToken(): Promise<string | null> {
  try {
    const token = await getItem(TOKEN_KEY);
    if (token) return token;
  } catch (_e) {
    // ignore
  }
  return null;
}

api.interceptors.request.use(async (config) => {
  try {
    const requestUrl = config?.url || '';
    const isPublicAuthRoute = /\/auth\/(login|register|token\/refresh|logout)\/?$/.test(requestUrl);

    if (isPublicAuthRoute) {
      if (config?.headers) {
        delete config.headers['Authorization'];
      }
      return config;
    }

    const token = await getToken();
    if (token && config && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore token errors
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';
    const isPublicAuthRoute = /\/auth\/(login|register|token\/refresh|logout)\/?$/.test(requestUrl);

    if (status === 401 && !isPublicAuthRoute) {
      emitSessionExpired('Your session expired');
    }

    return Promise.reject(error);
  }
);

export default api;
