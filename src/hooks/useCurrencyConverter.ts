import { useState } from 'react';
import { ConversionHistory, RateHistory, RateAnalysis } from '../types';
import { currencyService } from '../services/currencyService';

export const useCurrencyConverter = () => {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [rateAnalysis, setRateAnalysis] = useState<RateAnalysis | null>(null);

  const analyzeRates = (rates: RateHistory[]): RateAnalysis => {
    if (rates.length === 0) throw new Error('No rates to analyze');

    const sortedRates = [...rates].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const highest = sortedRates.reduce((max, current) => 
      current.rate > max.rate ? current : max
    , sortedRates[0]);

    const lowest = sortedRates.reduce((min, current) => 
      current.rate < min.rate ? current : min
    , sortedRates[0]);

    const average = sortedRates.reduce((sum, current) => 
      sum + current.rate, 0
    ) / sortedRates.length;

    const firstRate = sortedRates[0].rate;
    const lastRate = sortedRates[sortedRates.length - 1].rate;
    const percentageChange = ((lastRate - firstRate) / firstRate) * 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 1) trend = 'up';
    else if (percentageChange < -1) trend = 'down';

    return {
      highest,
      lowest,
      average,
      percentageChange,
      trend
    };
  };

  const convert = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rate = await currencyService.getLatestRate(fromCurrency, toCurrency);
      const convertedAmount = Number(amount) * rate;
      
      setResult(convertedAmount);
      setCurrentRate(rate);

      const newConversion: ConversionHistory = {
        from: fromCurrency,
        to: toCurrency,
        amount,
        result: convertedAmount,
        rate,
        date: new Date()
      };
      setHistory(prev => [newConversion, ...prev].slice(0, 5));

      // Fetch and analyze historical data
      const historyData = await currencyService.getRateHistory(fromCurrency, toCurrency);
      setRateHistory(historyData);
      setRateAnalysis(analyzeRates(historyData));
    } catch (error) {
      setError('Failed to fetch exchange rate. Please try again.');
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  return {
    amount,
    setAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    result,
    loading,
    error,
    history,
    currentRate,
    rateHistory,
    rateAnalysis,
    convert,
    swapCurrencies
  };
}; 