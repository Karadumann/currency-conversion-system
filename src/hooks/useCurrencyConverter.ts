import { useState, useEffect } from 'react';
import { ConversionHistory, RateHistory, RateAnalysis } from '../types';
import { currencyService } from '../services/currencyService';
import { CURRENCIES } from '../constants';

const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = 'conversionHistory';

interface UseCurrencyConverterProps {
  fromCurrency: string;
  toCurrency: string;
}

export const useCurrencyConverter = ({ fromCurrency, toCurrency }: UseCurrencyConverterProps) => {
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [rateAnalysis, setRateAnalysis] = useState<RateAnalysis | null>(null);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save conversion history:', error);
    }
  }, [history]);

  const validateInput = (amount: string): string | null => {
    if (!amount || amount.trim() === '') {
      return 'Please enter an amount';
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return 'Please enter a valid number';
    }

    if (numAmount <= 0) {
      return 'Amount must be greater than 0';
    }

    if (numAmount > 999999999.99) {
      return 'Amount must be less than 999,999,999.99';
    }

    if (!CURRENCIES.includes(fromCurrency) || !CURRENCIES.includes(toCurrency)) {
      return 'Invalid currency selected';
    }

    return null;
  };

  const convert = async () => {
    const validationError = validateInput(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const rate = await currencyService.getLatestRate(fromCurrency, toCurrency);
      const convertedAmount = Number(amount) * rate;
      
      setResult(Number(convertedAmount.toFixed(2)));
      setCurrentRate(rate);
      
      // Add to history
      const historyItem: ConversionHistory = {
        from: fromCurrency,
        to: toCurrency,
        amount: Number(amount),
        result: convertedAmount,
        rate,
        date: new Date()
      };
      
      setHistory(prev => [historyItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
      
      // Get rate history and analysis
      const rateHistoryData = await currencyService.getRateHistory(fromCurrency, toCurrency);
      setRateHistory(rateHistoryData);
      
      // Calculate rate analysis
      if (rateHistoryData.length > 0) {
        const analysis: RateAnalysis = {
          highest: {
            rate: Math.max(...rateHistoryData.map(d => d.rate)),
            date: rateHistoryData.reduce((a, b) => a.rate > b.rate ? a : b).date
          },
          lowest: {
            rate: Math.min(...rateHistoryData.map(d => d.rate)),
            date: rateHistoryData.reduce((a, b) => a.rate < b.rate ? a : b).date
          },
          average: Number((rateHistoryData.reduce((sum, curr) => sum + curr.rate, 0) / rateHistoryData.length).toFixed(6)),
          percentageChange: Number(((rate - rateHistoryData[rateHistoryData.length - 1].rate) / rateHistoryData[rateHistoryData.length - 1].rate * 100).toFixed(2)),
          trend: rate > rateHistoryData[rateHistoryData.length - 1].rate ? 'up' : rate < rateHistoryData[rateHistoryData.length - 1].rate ? 'down' : 'stable'
        };
        
        setRateAnalysis(analysis);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to convert currency. Please try again.');
      }
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    amount,
    setAmount,
    result,
    loading,
    error,
    history,
    currentRate,
    rateHistory,
    rateAnalysis,
    convert
  };
}; 