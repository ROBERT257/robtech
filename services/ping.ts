import axios from 'axios';
import { API_BASE_URL } from './api';

export const pingBackend = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ping/`);
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'Backend not reachable' };
  }
};
