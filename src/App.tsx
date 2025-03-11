import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import CurrencyConverter from './components/CurrencyConverter';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline />
      <CurrencyConverter />
    </ThemeProvider>
  );
};

export default App;
