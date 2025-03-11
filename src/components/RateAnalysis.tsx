import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { RateAnalysis as RateAnalysisType } from '../types';

interface RateAnalysisProps {
  analysis: RateAnalysisType | null;
  fromCurrency: string;
  toCurrency: string;
}

const RateAnalysis: React.FC<RateAnalysisProps> = ({ analysis, fromCurrency, toCurrency }) => {
  if (!analysis) return null;

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

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Rate Analysis
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Highest Rate"
            secondary={`${analysis.highest.rate.toFixed(4)} on ${new Date(analysis.highest.date).toLocaleDateString()}`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Lowest Rate"
            secondary={`${analysis.lowest.rate.toFixed(4)} on ${new Date(analysis.lowest.date).toLocaleDateString()}`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Average Rate"
            secondary={analysis.average.toFixed(4)}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Change"
            secondary={
              <Chip
                icon={getTrendIcon(analysis.trend)}
                label={`${analysis.percentageChange.toFixed(2)}%`}
                color={getTrendColor(analysis.trend)}
                variant="outlined"
              />
            }
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default RateAnalysis; 