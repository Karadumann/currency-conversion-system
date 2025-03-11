import React, { useMemo } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { RateHistory } from '../types';
import { memoizedDateFormatter, memoizedNumberFormatter } from '../utils/memoization';

interface RateChartProps {
  data: RateHistory[];
  fromCurrency: string;
  toCurrency: string;
}

const RateChart: React.FC<RateChartProps> = ({ data, fromCurrency, toCurrency }) => {
  // Memoize chart data to prevent unnecessary calculations
  const chartData = useMemo(() => data, [data]);

  // Create accessible description of the data
  const chartDescription = useMemo(() => {
    if (data.length === 0) return '';
    
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startDate = memoizedDateFormatter(sortedData[0].date);
    const endDate = memoizedDateFormatter(sortedData[sortedData.length - 1].date);
    const lowestRate = Math.min(...data.map(d => d.rate));
    const highestRate = Math.max(...data.map(d => d.rate));

    return `Historical exchange rate chart from ${startDate} to ${endDate}. ` +
           `Rates range from ${memoizedNumberFormatter(lowestRate)} to ${memoizedNumberFormatter(highestRate)} ` +
           `${toCurrency} per ${fromCurrency}.`;
  }, [data, fromCurrency, toCurrency]);

  return (
    <Paper 
      elevation={3} 
      sx={{ p: 3 }}
      role="region"
      aria-label="Exchange Rate Chart"
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Historical Exchange Rate: {fromCurrency} to {toCurrency}
      </Typography>
      
      {/* Hidden description for screen readers */}
      <Box sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        <p>{chartDescription}</p>
      </Box>

      <div 
        style={{ width: '100%', height: 400 }}
        role="img"
        aria-label={`Line chart showing exchange rates from ${fromCurrency} to ${toCurrency}`}
      >
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={memoizedDateFormatter}
              label={{ value: 'Date', position: 'bottom' }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => memoizedNumberFormatter(value)}
              label={{ 
                value: `Exchange Rate (${toCurrency}/${fromCurrency})`, 
                angle: -90, 
                position: 'left' 
              }}
            />
            <Tooltip
              labelFormatter={memoizedDateFormatter}
              formatter={(value: number) => [memoizedNumberFormatter(value), 'Rate']}
              wrapperStyle={{ outline: 'none' }}
              role="tooltip"
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8 }}
              isAnimationActive={false}
              name={`${fromCurrency} to ${toCurrency} Rate`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default React.memo(RateChart); 