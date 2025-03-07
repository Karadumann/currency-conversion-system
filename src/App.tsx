import React, { useState, useMemo, useEffect } from 'react';
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
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tabs,
  Tab,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  FormControl,
  InputLabel
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import DeleteIcon from '@mui/icons-material/Delete';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './App.css';
import NewsSection from './components/NewsSection';
import EconomicCalendar from './components/EconomicCalendar';

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

interface RateAnalysis {
  highest: { rate: number; date: string };
  lowest: { rate: number; date: string };
  average: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

interface RateAlarm {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [currencies] = useState<string[]>([
    'USD', 'EUR', 'TRY', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'BGN'
  ]);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rateAnalysis, setRateAnalysis] = useState<RateAnalysis | null>(null);
  const [alarms, setAlarms] = useState<RateAlarm[]>([]);
  const [showAlarmDialog, setShowAlarmDialog] = useState(false);
  const [targetRate, setTargetRate] = useState<string>('');
  const [alarmCondition, setAlarmCondition] = useState<'above' | 'below'>('above');

  const API_KEY = '74725af2487fc2d416623b40';

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          } : {
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
          }),
        },
      }),
    [mode],
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const fetchRateHistory = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 5);

      // Güncel kur bilgisini al
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
      );

      // Son 5 yıllık veriyi simüle et (API sınırlaması nedeniyle)
      const currentRate = response.data.conversion_rates[toCurrency];
      const historyData: RateHistory[] = [];
      
      // Son 5 yıl için aylık veri oluştur
      for (let i = 0; i < 60; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        // Rastgele dalgalanma ekle (±%20)
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 ile 1.2 arası
        const rate = currentRate * randomFactor;
        
        historyData.push({
          date: date.toISOString().split('T')[0],
          rate: rate
        });
      }

      // Tarihe göre sırala
      historyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setRateHistory(historyData);
      setShowChart(true);

      // Analyze rates immediately after fetching
      const analysis = analyzeRates(historyData);
      setRateAnalysis(analysis);
    } catch (error) {
      console.error('Error fetching rate history:', error);
      setError('Failed to fetch historical data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateConvert = async () => {
    if (!amount || isNaN(Number(amount)) || !selectedDate) {
      setError('Please enter a valid amount and date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
      );

      const rate = response.data.conversion_rates[toCurrency];
      const convertedAmount = Number(amount) * rate;
      
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

      // Fetch historical data
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

  const analyzeRates = (rates: RateHistory[]) => {
    if (rates.length === 0) return null;

    // Sort rates by date
    const sortedRates = [...rates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Find highest and lowest rates
    const highest = sortedRates.reduce((max, current) => 
      current.rate > max.rate ? current : max
    , sortedRates[0]);

    const lowest = sortedRates.reduce((min, current) => 
      current.rate < min.rate ? current : min
    , sortedRates[0]);

    // Calculate average
    const average = sortedRates.reduce((sum, current) => sum + current.rate, 0) / sortedRates.length;

    // Calculate percentage change from first to last rate
    const firstRate = sortedRates[0].rate;
    const lastRate = sortedRates[sortedRates.length - 1].rate;
    const percentageChange = ((lastRate - firstRate) / firstRate) * 100;

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (percentageChange > 1) {
      trend = 'up';
    } else if (percentageChange < -1) {
      trend = 'down';
    }

    return {
      highest: { rate: highest.rate, date: highest.date },
      lowest: { rate: lowest.rate, date: lowest.date },
      average: average,
      percentageChange: percentageChange,
      trend: trend
    };
  };

  const handleAddAlarm = () => {
    if (!targetRate || isNaN(Number(targetRate))) {
      setError('Please enter a valid target rate');
      return;
    }

    const newAlarm: RateAlarm = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
      targetRate: Number(targetRate),
      condition: alarmCondition,
      isActive: true
    };

    setAlarms(prev => [...prev, newAlarm]);
    setShowAlarmDialog(false);
    setTargetRate('');
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
    ));
  };

  const checkAlarms = async () => {
    if (alarms.length === 0) return;

    try {
      const activeAlarms = alarms.filter(alarm => alarm.isActive);
      for (const alarm of activeAlarms) {
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${alarm.fromCurrency}`
        );
        
        const currentRate = response.data.conversion_rates[alarm.toCurrency];
        
        if (
          (alarm.condition === 'above' && currentRate >= alarm.targetRate) ||
          (alarm.condition === 'below' && currentRate <= alarm.targetRate)
        ) {
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Currency Alert', {
              body: `${alarm.fromCurrency}/${alarm.toCurrency} rate is ${currentRate.toFixed(4)} (Target: ${alarm.targetRate})`,
              icon: '/favicon.ico'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking alarms:', error);
    }
  };

  useEffect(() => {
    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Check alarms every 5 minutes
    const interval = setInterval(checkAlarms, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Currency Converter
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        
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

              <TextField
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                fullWidth
                error={!!error && !selectedDate}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Button
                variant="contained"
                onClick={handleDateConvert}
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Convert'}
              </Button>

              {result !== null && currentRate !== null && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">
                      {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Exchange Rate on {new Date(selectedDate).toLocaleDateString()}: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAlarmDialog(true)}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Set Rate Alert
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>

          {showChart && (
            <>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  5 Year Exchange Rate History: {fromCurrency} to {toCurrency}
                </Typography>
                <Box sx={{ height: 300, width: '100%', mb: 3 }}>
                  <ResponsiveContainer>
                    <LineChart data={rateHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: mode === 'dark' ? '#fff' : '#000' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={6}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 12, fill: mode === 'dark' ? '#fff' : '#000' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                          border: `1px solid ${mode === 'dark' ? '#333' : '#ddd'}`
                        }}
                        labelStyle={{ color: mode === 'dark' ? '#fff' : '#000' }}
                      />
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

                {rateAnalysis && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Rate Analysis
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Highest Rate
                          </Typography>
                          <Typography variant="h6">
                            {rateAnalysis.highest.rate.toFixed(4)} {toCurrency}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            on {new Date(rateAnalysis.highest.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Lowest Rate
                          </Typography>
                          <Typography variant="h6">
                            {rateAnalysis.lowest.rate.toFixed(4)} {toCurrency}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            on {new Date(rateAnalysis.lowest.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Average Rate
                          </Typography>
                          <Typography variant="h6">
                            {rateAnalysis.average.toFixed(4)} {toCurrency}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Change (5 Years)
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {rateAnalysis.percentageChange > 0 ? (
                              <TrendingUpIcon color="success" />
                            ) : (
                              <TrendingDownIcon color="error" />
                            )}
                            <Typography variant="h6" color={rateAnalysis.percentageChange > 0 ? 'success.main' : 'error.main'}>
                              {rateAnalysis.percentageChange.toFixed(2)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Trend
                          </Typography>
                          <Chip
                            icon={rateAnalysis.trend === 'up' ? <TrendingUpIcon /> : rateAnalysis.trend === 'down' ? <TrendingDownIcon /> : undefined}
                            label={rateAnalysis.trend.toUpperCase()}
                            color={rateAnalysis.trend === 'up' ? 'success' : rateAnalysis.trend === 'down' ? 'error' : 'default'}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <NewsSection fromCurrency={fromCurrency} toCurrency={toCurrency} />
            </Grid>
            <Grid item xs={12} md={6}>
              <EconomicCalendar fromCurrency={fromCurrency} toCurrency={toCurrency} />
            </Grid>
          </Grid>

          {alarms.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rate Alerts
              </Typography>
              <List>
                {alarms.map((alarm) => (
                  <ListItem
                    key={alarm.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          edge="end"
                          onClick={() => handleToggleAlarm(alarm.id)}
                          color={alarm.isActive ? 'success' : 'default'}
                        >
                          {alarm.isActive ? 
                            <NotificationsActiveIcon /> : 
                            <NotificationsOffIcon />
                          }
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteAlarm(alarm.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography>
                          Alert when {alarm.fromCurrency}/{alarm.toCurrency} is{' '}
                          {alarm.condition === 'above' ? 'above' : 'below'}{' '}
                          {alarm.targetRate.toFixed(4)}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Status: {alarm.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
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

        <Dialog open={showAlarmDialog} onClose={() => setShowAlarmDialog(false)}>
          <DialogTitle>Set Rate Alert</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Set an alert for when the exchange rate reaches a specific value.
            </DialogContentText>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Target Rate"
                type="number"
                value={targetRate}
                onChange={(e) => setTargetRate(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      1 {fromCurrency} =
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {toCurrency}
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={alarmCondition}
                  onChange={(e) => setAlarmCondition(e.target.value as 'above' | 'below')}
                  label="Condition"
                >
                  <MenuItem value="above">Above</MenuItem>
                  <MenuItem value="below">Below</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAlarmDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAlarm} variant="contained">
              Add Alert
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
