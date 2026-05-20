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
  // Convenience wrapper - requires phone to be set on server user profile
  return initiatePayment(undefined, amount);
};

export const initiatePayment = async (phone: string | undefined, amount: number) => {
  const payload: any = { amount };
  if (phone) payload.phone = phone;

  const res = await api.post('/payments/initiate/', payload);
  const paymentId = res.data.payment_id;

  return { paymentId, response: res.data.response };
};

export const pollPaymentStatus = async (
  paymentId: string,
  onUpdate: (status: string, data?: any) => void,
  intervalMs = 3000,
  timeoutMinutes = 10
) => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(async () => {
      try {
        const res = await api.get(`/payments/status/${paymentId}/`);
        const data = res.data;
        const status = data.status;
        onUpdate(status, data);
        if (['completed', 'failed', 'timeout', 'cancelled'].includes(status)) {
          clearInterval(timer);
          resolve(data);
        } else if ((Date.now() - start) > timeoutMinutes * 60 * 1000) {
          clearInterval(timer);
          onUpdate('timeout', data);
          resolve({ status: 'timeout' });
        }
      } catch (err: any) {
        // keep polling but notify
        onUpdate('error', { error: err.message || err });
      }
    }, intervalMs);
  });
};

  export const retryPayment = async (paymentId: string) => {
    const res = await api.post(`/payments/retry/${paymentId}/`);
    return res.data;
  };
export const swapTokens = async (from: string, to: string, amount: number) => {
  return api.post('/wallet/swap/', { from, to, amount });
};
