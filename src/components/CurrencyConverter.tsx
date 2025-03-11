import React, { useCallback, useMemo } from 'react';
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
  Paper,
  Grid,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { CURRENCIES } from '../constants';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import ConversionHistory from './ConversionHistory';
import RateAnalysis from './RateAnalysis';
import RateChart from './RateChart';
import LoadingSkeleton from './LoadingSkeleton';
import ChartLoadingSkeleton from './ChartLoadingSkeleton';
import { debounce } from '../utils/memoization';
import RateAlarmManager from './RateAlarmManager';

const CurrencyConverter: React.FC = () => {
  const {
    amount,
    setAmount,
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    result,
    loading,
    error,
    history,
    currentRate,
    rateHistory,
    rateAnalysis,
    convert,
    swapCurrencies
  } = useCurrencyConverter();

  // Memoize currency options to prevent unnecessary re-renders
  const currencyOptions = useMemo(() => 
    CURRENCIES.map((currency) => (
      <MenuItem key={currency} value={currency}>
        {currency}
      </MenuItem>
    )),
    []
  );

  // Debounce amount changes to prevent too many re-renders
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }, [setAmount]);

  const debouncedHandleAmountChange = useMemo(
    () => debounce(handleAmountChange, 300),
    [handleAmountChange]
  );

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      convert();
    }
  };

  if (loading && !result) {
    return <LoadingSkeleton />;
  }

  return (
    <Container maxWidth="lg" role="main" aria-label="Currency Converter">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              Currency Converter
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Amount"
              defaultValue={amount}
              onChange={debouncedHandleAmountChange}
              onKeyPress={handleKeyPress}
              type="number"
              error={Boolean(error)}
              inputProps={{
                'aria-label': 'Enter amount to convert',
                'aria-describedby': error ? 'amount-error' : undefined,
                min: "0",
                step: "0.01"
              }}
              helperText={error && <span id="amount-error">{error}</span>}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="from-currency-label">From</InputLabel>
              <Select
                labelId="from-currency-label"
                id="from-currency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                label="From"
                aria-label="Select source currency"
              >
                {currencyOptions}
              </Select>
              <FormHelperText>Select source currency</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <IconButton 
                onClick={swapCurrencies} 
                color="primary"
                aria-label="Swap currencies"
              >
                <CompareArrowsIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="to-currency-label">To</InputLabel>
              <Select
                labelId="to-currency-label"
                id="to-currency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                label="To"
                aria-label="Select target currency"
              >
                {currencyOptions}
              </Select>
              <FormHelperText>Select target currency</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={convert}
              disabled={loading}
              sx={{ height: '100%' }}
              aria-label="Convert currencies"
              aria-busy={loading}
            >
              {loading ? <CircularProgress size={24} aria-label="Converting..." /> : 'Convert'}
            </Button>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" role="alert">
                {error}
              </Alert>
            </Grid>
          )}

          {result !== null && (
            <Grid item xs={12}>
              <Paper 
                elevation={1} 
                sx={{ p: 2, backgroundColor: 'background.default' }}
                role="region"
                aria-label="Conversion result"
              >
                <Typography variant="h5" gutterBottom>
                  {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                </Typography>
                {currentRate && (
                  <Typography variant="body2" color="textSecondary">
                    Exchange rate: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>

      {loading && rateHistory.length === 0 ? (
        <ChartLoadingSkeleton />
      ) : (
        rateHistory.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <RateChart data={rateHistory} fromCurrency={fromCurrency} toCurrency={toCurrency} />
            </Grid>
            <Grid item xs={12} md={4}>
              <RateAnalysis analysis={rateAnalysis} fromCurrency={fromCurrency} toCurrency={toCurrency} />
            </Grid>
          </Grid>
        )
      )}

      <RateAlarmManager 
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        currentRate={currentRate}
      />

      <ConversionHistory history={history} />
    </Container>
  );
};

export default React.memo(CurrencyConverter); 