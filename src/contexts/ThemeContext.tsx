import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' ? {
            background: {
              default: '#0A1929',
              paper: '#0F2744',
            },
            primary: {
              main: '#3399FF',
              light: '#66B2FF',
              dark: '#0059B2',
              contrastText: '#fff',
            },
            secondary: {
              main: '#CE93D8',
              light: '#E1BEE7',
              dark: '#AB47BC',
              contrastText: '#fff',
            },
            text: {
              primary: '#fff',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
            divider: 'rgba(194, 224, 255, 0.08)',
          } : {
            background: {
              default: '#F3F6F9',
              paper: '#fff',
            },
            primary: {
              main: '#0072E5',
              light: '#3399FF',
              dark: '#0059B2',
              contrastText: '#fff',
            },
            secondary: {
              main: '#9C27B0',
              light: '#BA68C8',
              dark: '#7B1FA2',
              contrastText: '#fff',
            },
            text: {
              primary: '#1A2027',
              secondary: '#3E5060',
            },
            divider: '#E5EAF2',
          }),
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h6: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '0.00938em',
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            letterSpacing: '0.00714em',
          },
        },
        shape: {
          borderRadius: 12,
        },
        spacing: 8,
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              },
              elevation1: {
                boxShadow: mode === 'dark' 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.32)' 
                  : '0px 2px 12px rgba(0, 0, 0, 0.08)',
              },
              elevation3: {
                boxShadow: mode === 'dark'
                  ? '0px 4px 16px rgba(0, 0, 0, 0.48)'
                  : '0px 4px 24px rgba(0, 0, 0, 0.12)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: mode === 'dark'
                    ? '0px 4px 16px rgba(51, 153, 255, 0.24)'
                    : '0px 4px 16px rgba(0, 114, 229, 0.24)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: mode === 'dark' ? '#3399FF' : '#0072E5',
                    },
                  },
                },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  backgroundColor: mode === 'dark' 
                    ? 'rgba(51, 153, 255, 0.08)'
                    : 'rgba(0, 114, 229, 0.08)',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 