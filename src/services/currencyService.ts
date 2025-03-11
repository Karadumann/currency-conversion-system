import axios from 'axios';
import { EXCHANGE_RATE_API_KEY } from '../constants';
import { RateHistory } from '../types';

export const currencyService = {
  getLatestRate: async (fromCurrency: string, toCurrency: string) => {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency}`
    );
    return response.data.conversion_rates[toCurrency];
  },

  getRateHistory: async (fromCurrency: string, toCurrency: string): Promise<RateHistory[]> => {
    // Get current rate
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency}`
    );
    const currentRate = response.data.conversion_rates[toCurrency];
    
    // Simulate historical data (last 60 days)
    const historyData: RateHistory[] = [];
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add random fluctuation (±10%)
      const randomFactor = 0.9 + Math.random() * 0.2;
      const rate = currentRate * randomFactor;
      
      historyData.push({
        date: date.toISOString().split('T')[0],
        rate: rate
      });
    }

    // Sort by date
    return historyData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}; 