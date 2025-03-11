import React from 'react';
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

interface RateChartProps {
  data: RateHistory[];
  fromCurrency: string;
  toCurrency: string;
}

const RateChart: React.FC<RateChartProps> = ({ data, fromCurrency, toCurrency }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Historical Exchange Rate: {fromCurrency} to {toCurrency}
      </Typography>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
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
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(4)}
            />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value: number) => [value.toFixed(4), 'Rate']}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default RateChart; 