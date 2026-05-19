import api from './api';

export const pingBackend = async () => {
  try {
    const response = await api.get('/ping/');
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'Backend not reachable' };
  }
};
