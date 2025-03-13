import { useState } from 'react';
import { ConversionHistory, RateHistory, RateAnalysis } from '../types';
import { currencyService } from '../services/currencyService';

interface UseCurrencyConverterProps {
  fromCurrency: string;
  toCurrency: string;
}

export const useCurrencyConverter = ({ fromCurrency, toCurrency }: UseCurrencyConverterProps) => {
  const [amount, setAmount] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [rateAnalysis, setRateAnalysis] = useState<RateAnalysis | null>(null);

  const convert = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const rate = await currencyService.getLatestRate(fromCurrency, toCurrency);
      const convertedAmount = Number(amount) * rate;
      
      setResult(convertedAmount);
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
      
      setHistory(prev => [historyItem, ...prev].slice(0, 10));
      
      // Get rate history and analysis
      const rateHistoryData = await currencyService.getRateHistory(fromCurrency, toCurrency);
      setRateHistory(rateHistoryData);
      
      // Calculate rate analysis
      const analysis: RateAnalysis = {
        highest: {
          rate: Math.max(...rateHistoryData.map(d => d.rate)),
          date: rateHistoryData.reduce((a, b) => a.rate > b.rate ? a : b).date
        },
        lowest: {
          rate: Math.min(...rateHistoryData.map(d => d.rate)),
          date: rateHistoryData.reduce((a, b) => a.rate < b.rate ? a : b).date
        },
        average: rateHistoryData.reduce((sum, curr) => sum + curr.rate, 0) / rateHistoryData.length,
        percentageChange: ((rate - rateHistoryData[rateHistoryData.length - 1].rate) / rateHistoryData[rateHistoryData.length - 1].rate) * 100,
        trend: rate > rateHistoryData[rateHistoryData.length - 1].rate ? 'up' : rate < rateHistoryData[rateHistoryData.length - 1].rate ? 'down' : 'stable'
      };
      
      setRateAnalysis(analysis);
    } catch (err) {
      setError('Failed to convert currency. Please try again.');
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