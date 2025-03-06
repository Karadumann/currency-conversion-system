import React, { useState } from 'react';
import { Container, TextField, Select, MenuItem, Button, Typography, Box } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [currencies] = useState<string[]>(['USD', 'EUR', 'TRY', 'GBP', 'JPY']);

  const handleConvert = async () => {
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const rate = response.data.rates[toCurrency];
      setResult(parseFloat(amount) * rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Currency Converter
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          sx={{ mt: 2 }}
        >
          Convert
        </Button>

        {result !== null && (
          <Typography variant="h5" align="center" sx={{ mt: 2 }}>
            {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default App;
