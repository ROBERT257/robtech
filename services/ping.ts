import axios from 'axios';

export const pingBackend = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/ping/');
    return response.data;
  } catch (error) {
    return { status: 'error', message: 'Backend not reachable' };
  }
};
