import React, { useMemo } from 'react';
import { Paper, Typography } from '@mui/material';
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

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Historical Exchange Rate: {fromCurrency} to {toCurrency}
      </Typography>
      <div style={{ width: '100%', height: 400 }}>
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
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => memoizedNumberFormatter(value)}
            />
            <Tooltip
              labelFormatter={memoizedDateFormatter}
              formatter={(value: number) => [memoizedNumberFormatter(value), 'Rate']}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8 }}
              isAnimationActive={false} // Disable animation for better performance
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default React.memo(RateChart); 