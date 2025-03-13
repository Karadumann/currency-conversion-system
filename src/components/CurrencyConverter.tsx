import React, { useCallback, useMemo } from 'react';
import {
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
import RateAlarmManager from './RateAlarmManager';

interface CurrencyConverterProps {
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (currency: string) => void;
  onToCurrencyChange: (currency: string) => void;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange
}) => {
  const {
    amount,
    setAmount,
    result,
    loading,
    error,
    history,
    currentRate,
    rateHistory,
    rateAnalysis,
    convert
  } = useCurrencyConverter({ fromCurrency, toCurrency });

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

  const swapCurrencies = () => {
    onFromCurrencyChange(toCurrency);
    onToCurrencyChange(fromCurrency);
  };

  if (loading && !result) {
    return <LoadingSkeleton />;
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Currency Converter
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={3}>
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
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    height: '56px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="from-currency-label">From</InputLabel>
                <Select
                  labelId="from-currency-label"
                  id="from-currency"
                  value={fromCurrency}
                  onChange={(e) => onFromCurrencyChange(e.target.value)}
                  label="From"
                  aria-label="Select source currency"
                  sx={{ height: '56px' }}
                >
                  {currencyOptions}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton 
                onClick={swapCurrencies} 
                color="primary"
                aria-label="Swap currencies"
                sx={{ 
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  },
                  width: 56,
                  height: 56
                }}
              >
                <CompareArrowsIcon />
              </IconButton>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="to-currency-label">To</InputLabel>
                <Select
                  labelId="to-currency-label"
                  id="to-currency"
                  value={toCurrency}
                  onChange={(e) => onToCurrencyChange(e.target.value)}
                  label="To"
                  aria-label="Select target currency"
                  sx={{ height: '56px' }}
                >
                  {currencyOptions}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={convert}
                disabled={loading}
                sx={{ 
                  height: '56px',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
                aria-label="Convert currencies"
                aria-busy={loading}
              >
                {loading ? <CircularProgress size={24} aria-label="Converting..." /> : 'Convert'}
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" role="alert" sx={{ mt: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}

        {result !== null && (
          <Grid item xs={12}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 4, 
                mt: 2,
                backgroundColor: 'background.default',
                textAlign: 'center'
              }}
              role="region"
              aria-label="Conversion result"
            >
              <Typography variant="h4" gutterBottom>
                {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
              </Typography>
              {currentRate && (
                <Typography variant="h6" color="textSecondary">
                  Exchange rate: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {loading && rateHistory.length === 0 ? (
        <ChartLoadingSkeleton />
      ) : (
        rateHistory.length > 0 && (
          <Grid container spacing={4} sx={{ mt: 4 }}>
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
    </Paper>
  );
};

export default React.memo(CurrencyConverter); 