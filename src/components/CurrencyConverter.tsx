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
  InputLabel
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
  const handleAmountChange = useCallback(
    debounce((value: string) => {
      setAmount(value);
    }, 300),
    [setAmount]
  );

  if (loading && !result) {
    return <LoadingSkeleton />;
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Currency Converter
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Amount"
              defaultValue={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              type="number"
              error={Boolean(error)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>From</InputLabel>
              <Select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                label="From"
              >
                {currencyOptions}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <IconButton onClick={swapCurrencies} color="primary">
                <CompareArrowsIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>To</InputLabel>
              <Select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                label="To"
              >
                {currencyOptions}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={convert}
              disabled={loading}
              sx={{ height: '100%' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Convert'}
            </Button>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {result !== null && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="h5" gutterBottom>
                  {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                </Typography>
                {currentRate && (
                  <Typography variant="body2" color="textSecondary">
                    1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
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

      <ConversionHistory history={history} />
    </Container>
  );
};

export default React.memo(CurrencyConverter); 