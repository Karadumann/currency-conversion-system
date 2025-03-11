import React, { useMemo } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
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
  if (!analysis) return null;

  // Memoize trend color and icon calculations
  const trendInfo = useMemo(() => {
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
  }, [analysis.trend]);

  // Memoize formatted values
  const formattedValues = useMemo(() => ({
    highestRate: memoizedNumberFormatter(analysis.highest.rate),
    highestDate: memoizedDateFormatter(analysis.highest.date),
    lowestRate: memoizedNumberFormatter(analysis.lowest.rate),
    lowestDate: memoizedDateFormatter(analysis.lowest.date),
    averageRate: memoizedNumberFormatter(analysis.average),
    percentageChange: memoizedNumberFormatter(analysis.percentageChange, 2)
  }), [analysis]);

  return (
    <Paper 
      elevation={3} 
      sx={{ p: 3 }}
      role="region"
      aria-label={`Rate analysis for ${fromCurrency} to ${toCurrency}`}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Rate Analysis
      </Typography>
      <List aria-label="Exchange rate statistics">
        <ListItem divider>
          <ListItemText
            primary={
              <Typography component="h3" variant="subtitle1">
                Highest Rate
              </Typography>
            }
            secondary={
              <Typography component="p" variant="body2">
                {formattedValues.highestRate} on {formattedValues.highestDate}
              </Typography>
            }
            aria-label={`Highest rate: ${formattedValues.highestRate} on ${formattedValues.highestDate}`}
          />
        </ListItem>
        <ListItem divider>
          <ListItemText
            primary={
              <Typography component="h3" variant="subtitle1">
                Lowest Rate
              </Typography>
            }
            secondary={
              <Typography component="p" variant="body2">
                {formattedValues.lowestRate} on {formattedValues.lowestDate}
              </Typography>
            }
            aria-label={`Lowest rate: ${formattedValues.lowestRate} on ${formattedValues.lowestDate}`}
          />
        </ListItem>
        <ListItem divider>
          <ListItemText
            primary={
              <Typography component="h3" variant="subtitle1">
                Average Rate
              </Typography>
            }
            secondary={
              <Typography component="p" variant="body2">
                {formattedValues.averageRate}
              </Typography>
            }
            aria-label={`Average rate: ${formattedValues.averageRate}`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <Typography component="h3" variant="subtitle1">
                Change
              </Typography>
            }
            secondary={
              <Chip
                icon={trendInfo.icon}
                label={`${formattedValues.percentageChange}%`}
                color={trendInfo.color}
                variant="outlined"
                role="status"
                aria-label={`${trendInfo.description}: ${formattedValues.percentageChange}% change`}
              />
            }
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default React.memo(RateAnalysis); 