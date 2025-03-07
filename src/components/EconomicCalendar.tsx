import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface ForexData {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

interface EconomicCalendarProps {
  fromCurrency: string;
  toCurrency: string;
}

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ fromCurrency, toCurrency }) => {
  const [forexData, setForexData] = React.useState<ForexData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchForexData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&apikey=SE70PFSP8HQ2GX91`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forex data');
      }

      const data = await response.json();
      
      if (!data['Time Series FX (Daily)']) {
        throw new Error('Invalid data format');
      }

      // Convert the data into our format
      const formattedData: ForexData[] = Object.entries(data['Time Series FX (Daily)'])
        .slice(0, 3) // Get last 3 days
        .map(([date, values]: [string, any]) => ({
          date,
          open: values['1. open'],
          high: values['2. high'],
          low: values['3. low'],
          close: values['4. close'],
          volume: values['5. volume']
        }));

      setForexData(formattedData);
    } catch (err) {
      setError('Failed to fetch forex data. Please try again later.');
      console.error('Error fetching forex data:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchForexData();
  }, [fromCurrency, toCurrency]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EventIcon />
        <Typography variant="h6">
          Daily Forex Data
        </Typography>
      </Box>
      
      <List>
        {forexData.map((day, index) => {
          const priceChange = Number(day.close) - Number(day.open);
          const priceChangePercent = (priceChange / Number(day.open)) * 100;
          const isPositive = priceChange >= 0;

          return (
            <ListItem
              key={index}
              divider={index !== forexData.length - 1}
              sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {new Date(day.date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      size="small"
                      icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={`${priceChangePercent.toFixed(2)}%`}
                      color={isPositive ? 'success' : 'error'}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="body2">
                        Open: {Number(day.open).toFixed(4)}
                      </Typography>
                      <Typography variant="body2">
                        High: {Number(day.high).toFixed(4)}
                      </Typography>
                      <Typography variant="body2">
                        Low: {Number(day.low).toFixed(4)}
                      </Typography>
                      <Typography variant="body2">
                        Close: {Number(day.close).toFixed(4)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Volume: {Number(day.volume).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        size="small"
                        label={fromCurrency}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={toCurrency}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default EconomicCalendar; 