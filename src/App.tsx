import React, { useState } from 'react';
import { CssBaseline, Container, Box, Typography, Grid } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import CurrencyConverter from './components/CurrencyConverter';
import { NewsSection } from './components/NewsSection';
import RateAnalysis from './components/RateAnalysis';
import RateChart from './components/RateChart';
import { useCurrencyConverter } from './hooks/useCurrencyConverter';

export const App: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const { rateHistory, rateAnalysis } = useCurrencyConverter({ fromCurrency, toCurrency });

  return (
    <ThemeProvider>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Currency Converter
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <CurrencyConverter
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                onFromCurrencyChange={setFromCurrency}
                onToCurrencyChange={setToCurrency}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <RateAnalysis
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                analysis={rateAnalysis}
              />
            </Grid>
            
            <Grid item xs={12}>
              <RateChart
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                data={rateHistory}
              />
            </Grid>

            <Grid item xs={12}>
              <NewsSection selectedCurrency={fromCurrency} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
