import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Select, 
  MenuItem, 
  Button, 
  Typography, 
  Box,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './App.css';

interface ConversionHistory {
  from: string;
  to: string;
  amount: string;
  result: number;
  rate: number;
  date: Date;
}

interface RateHistory {
  date: string;
  rate: number;
}

function App() {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [currencies] = useState<string[]>([
    'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'BGN'
  ]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [showChart, setShowChart] = useState(false);

  const fetchRateHistory = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 5);

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await axios.get(
        `https://api.frankfurter.app/${formattedStartDate}..${formattedEndDate}?from=${fromCurrency}&to=${toCurrency}`
      );

      const historyData: RateHistory[] = Object.entries(response.data.rates).map(([date, rates]: [string, any]) => ({
        date,
        rate: rates[toCurrency]
      }));

      setRateHistory(historyData);
      setShowChart(true);
    } catch (error) {
      console.error('Error fetching rate history:', error);
      setError('Failed to fetch historical data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setShowChart(false);

    try {
      // Use Frankfurter API for current rate
      const response = await axios.get(
        `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );

      const convertedAmount = response.data.rates[toCurrency];
      const rate = convertedAmount / parseFloat(amount);
      
      setResult(convertedAmount);
      setCurrentRate(rate);

      // Add to history
      const newConversion: ConversionHistory = {
        from: fromCurrency,
        to: toCurrency,
        amount,
        result: convertedAmount,
        rate: rate,
        date: new Date()
      };
      setHistory(prev => [newConversion, ...prev].slice(0, 5));

      // Fetch historical data after conversion
      await fetchRateHistory();
    } catch (error) {
      setError('Failed to fetch exchange rate. Please try again.');
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Currency Converter
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              error={!!error && !amount}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                fullWidth
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>

              <IconButton onClick={handleSwapCurrencies}>
                <CompareArrowsIcon />
              </IconButton>

              <Select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                fullWidth
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              variant="contained"
              onClick={handleConvert}
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Convert'}
            </Button>

            {result !== null && currentRate !== null && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h5">
                  {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Exchange Rate: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date().toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {showChart && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              5 Year Exchange Rate History: {fromCurrency} to {toCurrency}
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={rateHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={6}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#8884d8" 
                    name={`${fromCurrency} to ${toCurrency} Rate`}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Conversion History
          </Typography>
          <List>
            {history.map((item, index) => (
              <ListItem key={index} divider={index !== history.length - 1}>
                <ListItemText
                  primary={
                    <Typography>
                      {item.amount} {item.from} = {item.result.toFixed(2)} {item.to}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Rate: 1 {item.from} = {item.rate.toFixed(4)} {item.to}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.date.toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            {history.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No conversion history yet"
                  secondary="Your recent conversions will appear here"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
