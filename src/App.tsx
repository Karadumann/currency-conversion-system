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
  Paper
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
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

function App() {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [currencies] = useState<string[]>([
    'USD', 'EUR', 'TRY', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BGN'
  ]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const rate = response.data.rates[toCurrency];
      const convertedAmount = parseFloat(amount) * rate;
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
    } catch (error) {
      setError('Failed to fetch exchange rate. Please try again.');
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Currency Converter
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box sx={{ flex: 1 }}>
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
        </Box>

        <Box sx={{ flex: 1 }}>
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
      </Box>
    </Container>
  );
}

export default App;
