import api from './api';

export const sendTokens = async (recipient: string, amount: number) => {
  return api.post('/wallet/send/', { recipient, amount });
};

export const receiveTokens = async () => {
  // This could return a deposit address or QR code
  // Endpoint not implemented in backend yet
  throw new Error('Receive feature not implemented');
};

export const buyTokens = async (amount: number) => {
  return api.post('/payments/initiate/', { amount });
};

export const swapTokens = async (from: string, to: string, amount: number) => {
  return api.post('/wallet/swap/', { from, to, amount });
};
