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
  InputLabel,
  Tooltip
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { CURRENCIES } from '../constants';
import { useCurrencyConverter } from '../hooks/useCurrencyConverter';
import { useTheme } from '../contexts/ThemeContext';
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

  const { mode, toggleColorMode } = useTheme();

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
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
        width: '100%',
      }}
    >
      <Grid container spacing={4}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton 
              onClick={toggleColorMode} 
              color="inherit"
              size="large"
              sx={{
                width: 48,
                height: 48,
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Grid>
        
        <Grid item xs={12}>
          <Typography 
            variant="h2" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 4,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              fontWeight: 600
            }}
          >
            Currency Converter
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper 
            elevation={1}
            sx={{ 
              p: { xs: 2, sm: 3 },
              backgroundColor: 'background.default'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={amount}
                  onChange={debouncedHandleAmountChange}
                  onKeyPress={handleKeyPress}
                  type="number"
                  error={Boolean(error)}
                  inputProps={{
                    'aria-label': 'Enter amount to convert',
                    'aria-describedby': error ? 'amount-error' : undefined,
                    min: "0.01",
                    max: "999999999.99",
                    step: "0.01"
                  }}
                  helperText={error || 'Enter amount between 0.01 and 999,999,999.99'}
                  FormHelperTextProps={{
                    error: Boolean(error)
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
                    width: 48,
                    height: 48,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: mode === 'dark' 
                        ? 'rgba(51, 153, 255, 0.08)'
                        : 'rgba(0, 114, 229, 0.08)',
                    }
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
                  size="large"
                  sx={{ 
                    height: 56,
                    fontSize: '1rem'
                  }}
                  aria-label="Convert currencies"
                  aria-busy={loading}
                >
                  {loading ? <CircularProgress size={24} aria-label="Converting..." /> : 'Convert'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert 
              severity="error" 
              role="alert"
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {error}
            </Alert>
          </Grid>
        )}

        {result !== null && (
          <Grid item xs={12}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: { xs: 3, sm: 4 },
                backgroundColor: 'background.default',
                textAlign: 'center'
              }}
              role="region"
              aria-label="Conversion result"
            >
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  fontWeight: 600
                }}
              >
                {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
              </Typography>
              {currentRate && (
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
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
              <Paper 
                elevation={1}
                sx={{ 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  backgroundColor: 'background.default'
                }}
              >
                <RateChart data={rateHistory} fromCurrency={fromCurrency} toCurrency={toCurrency} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <RateAnalysis analysis={rateAnalysis} fromCurrency={fromCurrency} toCurrency={toCurrency} />
            </Grid>
          </Grid>
        )
      )}

      <Box sx={{ mt: 4 }}>
        <RateAlarmManager 
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          currentRate={currentRate}
        />
      </Box>

      <Box sx={{ mt: 4 }}>
        <ConversionHistory history={history} />
      </Box>
    </Paper>
  );
};

export default React.memo(CurrencyConverter); 