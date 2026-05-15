import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const fetchMarketData = async (ids: string[] = ['bitcoin', 'ethereum', 'solana', 'binancecoin']) => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: ids.join(','),
        order: 'market_cap_desc',
        per_page: ids.length,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch market data');
  }
};
