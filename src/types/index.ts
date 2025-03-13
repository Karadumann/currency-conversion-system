export interface ConversionHistory {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  date: Date;
}

export interface RateHistory {
  date: string;
  rate: number;
}

export interface RateAnalysis {
  highest: {
    rate: number;
    date: string;
  };
  lowest: {
    rate: number;
    date: string;
  };
  average: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RateAlarm {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;
  source: string;
} 