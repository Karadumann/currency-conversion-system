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
          return <TrendingUpIcon />;
        case 'down':
          return <TrendingDownIcon />;
        default:
          return null;
      }
    };

    return {
      color: getTrendColor(analysis.trend),
      icon: getTrendIcon(analysis.trend)
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
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Rate Analysis
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Highest Rate"
            secondary={`${formattedValues.highestRate} on ${formattedValues.highestDate}`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Lowest Rate"
            secondary={`${formattedValues.lowestRate} on ${formattedValues.lowestDate}`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Average Rate"
            secondary={formattedValues.averageRate}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Change"
            secondary={
              <Chip
                icon={trendInfo.icon}
                label={`${formattedValues.percentageChange}%`}
                color={trendInfo.color}
                variant="outlined"
              />
            }
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default React.memo(RateAnalysis); 