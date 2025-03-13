import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Box,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { RateAnalysis as RateAnalysisType } from '../types';
import { memoizedDateFormatter, memoizedNumberFormatter } from '../utils/memoization';

interface RateAnalysisProps {
  analysis: RateAnalysisType | null;
  fromCurrency: string;
  toCurrency: string;
}

const RateAnalysis: React.FC<RateAnalysisProps> = ({ analysis, fromCurrency, toCurrency }) => {
  // Move useMemo hooks to the top level
  const trendInfo = useMemo(() => {
    if (!analysis) return { color: 'default', icon: null, description: 'No data' };

    const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
      switch (trend) {
        case 'up':
          return 'success';
        case 'down':
          return 'error';
        default:
          return 'default';
      }
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
      switch (trend) {
        case 'up':
          return <TrendingUpIcon aria-hidden="true" />;
        case 'down':
          return <TrendingDownIcon aria-hidden="true" />;
        default:
          return null;
      }
    };

    const getTrendDescription = (trend: 'up' | 'down' | 'stable') => {
      switch (trend) {
        case 'up':
          return 'Increasing trend';
        case 'down':
          return 'Decreasing trend';
        default:
          return 'Stable trend';
      }
    };

    return {
      color: getTrendColor(analysis.trend),
      icon: getTrendIcon(analysis.trend),
      description: getTrendDescription(analysis.trend)
    };
  }, [analysis]);

  const formattedValues = useMemo(() => {
    if (!analysis) return null;

    return {
      highestRate: memoizedNumberFormatter(analysis.highest.rate),
      highestDate: memoizedDateFormatter(analysis.highest.date),
      lowestRate: memoizedNumberFormatter(analysis.lowest.rate),
      lowestDate: memoizedDateFormatter(analysis.lowest.date),
      averageRate: memoizedNumberFormatter(analysis.average),
      percentageChange: memoizedNumberFormatter(analysis.percentageChange, 2)
    };
  }, [analysis]);

  if (!analysis || !formattedValues) return null;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4,
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
      role="region"
      aria-label={`Rate analysis for ${fromCurrency} to ${toCurrency}`}
    >
      <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
        Historical Exchange Rate: {fromCurrency} to {toCurrency}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Highest Rate
            </Typography>
            <Typography component="p" variant="body2" sx={{ color: 'text.secondary' }}>
              {formattedValues.highestRate} on {formattedValues.highestDate}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Lowest Rate
            </Typography>
            <Typography component="p" variant="body2" sx={{ color: 'text.secondary' }}>
              {formattedValues.lowestRate} on {formattedValues.lowestDate}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
              height: '100%'
            }}
          >
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Average Rate
            </Typography>
            <Typography component="p" variant="body2" sx={{ color: 'text.secondary' }}>
              {formattedValues.averageRate}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Change
            </Typography>
            <Chip
              icon={trendInfo.icon || undefined}
              label={`${formattedValues.percentageChange}%`}
              color={trendInfo.color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
              variant="outlined"
              role="status"
              aria-label={`${trendInfo.description}: ${formattedValues.percentageChange}% change`}
              sx={{
                fontSize: '0.9rem',
                '& .MuiChip-icon': {
                  fontSize: '1.2rem'
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(RateAnalysis); 