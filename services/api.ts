import axios from 'axios';
import { Platform } from 'react-native';
import { getItem } from '../utils/safeStorage';

// Use 10.0.2.2 for Android emulator, localhost for web/iOS
export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8081/api' 
  : 'http://127.0.0.1:8081/api';
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
    const token = await getToken();
    if (token && config && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore token errors
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
