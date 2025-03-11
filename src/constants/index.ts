export const EXCHANGE_RATE_API_KEY = process.env.REACT_APP_EXCHANGE_RATE_API_KEY;
export const GNEWS_API_KEY = process.env.REACT_APP_GNEWS_API_KEY;
export const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

export const CURRENCIES = [
  'USD', 'EUR', 'TRY', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'BGN'
] as const;

export type Currency = typeof CURRENCIES[number]; 