import axios, { AxiosError } from 'axios';
import { RateHistory } from '../types';

const EXCHANGE_RATE_API_KEY = process.env.REACT_APP_EXCHANGE_RATE_API_KEY;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface RateCache {
  timestamp: number;
  data: {
    [key: string]: number;
  };
}

interface HistoryCache {
  timestamp: number;
  data: RateHistory[];
}

// In-memory cache
const rateCache: { [key: string]: RateCache } = {};
const historyCache: { [key: string]: HistoryCache } = {};

export const currencyService = {
  getLatestRate: async (fromCurrency: string, toCurrency: string): Promise<number> => {
    if (!EXCHANGE_RATE_API_KEY) {
      throw new Error('Exchange rate API key is not configured');
    }

    // Check cache first
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cachedData = rateCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data[toCurrency];
    }

    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency}`,
        { timeout: 5000 } // 5 second timeout
      );

      // Cache the response
      rateCache[cacheKey] = {
        timestamp: Date.now(),
        data: response.data.conversion_rates
      };

      return response.data.conversion_rates[toCurrency];
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection.');
      } else if (axiosError.response?.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      } else {
        throw new Error('Failed to fetch exchange rate. Please try again later.');
      }
    }
  },

  getRateHistory: async (fromCurrency: string, toCurrency: string): Promise<RateHistory[]> => {
    if (!EXCHANGE_RATE_API_KEY) {
      throw new Error('Exchange rate API key is not configured');
    }

    // Check cache first
    const cacheKey = `${fromCurrency}-${toCurrency}`;
    const cachedData = historyCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      // Get current rate
      const currentRate = await currencyService.getLatestRate(fromCurrency, toCurrency);
      
      // Since the free API doesn't provide historical data, we'll still simulate it
      // but with more realistic and consistent fluctuations
      const historyData: RateHistory[] = [];
      const volatility = 0.02; // 2% daily volatility
      let previousRate = currentRate;
      
      for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Use a more realistic random walk with controlled volatility
        const change = (Math.random() - 0.5) * 2 * volatility;
        const rate = previousRate * (1 + change);
        previousRate = rate;
        
        historyData.push({
          date: date.toISOString().split('T')[0],
          rate: Number(rate.toFixed(6))
        });
      }

      // Sort by date
      const sortedData = historyData.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Cache the result
      historyCache[cacheKey] = {
        timestamp: Date.now(),
        data: sortedData
      };

      return sortedData;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection.');
      } else {
        throw new Error('Failed to fetch rate history. Please try again later.');
      }
    }
  }
}; 