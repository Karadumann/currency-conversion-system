import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { ConversionHistory as ConversionHistoryType } from '../types';
import { memoizedNumberFormatter } from '../utils/memoization';

interface ConversionHistoryProps {
  history: ConversionHistoryType[];
}

const ConversionHistoryItem: React.FC<{ item: ConversionHistoryType; isLast: boolean }> = React.memo(
  ({ item, isLast }) => {
    const formattedValues = useMemo(() => ({
      result: memoizedNumberFormatter(item.result, 2),
      rate: memoizedNumberFormatter(item.rate),
      date: new Date(item.date).toLocaleString()
    }), [item]);

    const conversionDescription = `${item.amount} ${item.from} converted to ${formattedValues.result} ${item.to}`;
    const rateDescription = `Exchange rate: 1 ${item.from} equals ${formattedValues.rate} ${item.to}`;

    return (
      <React.Fragment>
        {!isLast && <Divider role="presentation" />}
        <ListItem role="listitem">
          <ListItemText
            primary={
              <Typography component="h3" variant="subtitle1">
                {conversionDescription}
              </Typography>
            }
            secondary={
              <>
                <Typography component="p" variant="body2" color="textSecondary">
                  {rateDescription}
                </Typography>
                <Typography component="p" variant="body2" color="textSecondary">
                  Converted on {formattedValues.date}
                </Typography>
              </>
            }
            aria-label={`${conversionDescription}. ${rateDescription}. Converted on ${formattedValues.date}`}
          />
        </ListItem>
      </React.Fragment>
    );
  }
);

const ConversionHistory: React.FC<ConversionHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <Paper 
      elevation={3} 
      sx={{ p: 3, mt: 3 }}
      role="region"
      aria-label="Conversion History"
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Recent Conversions
      </Typography>
      <List 
        aria-label="List of recent currency conversions"
        role="list"
      >
        {history.map((item, index) => (
          <ConversionHistoryItem
            key={item.date.getTime()}
            item={item}
            isLast={index === history.length - 1}
          />
        ))}
      </List>
    </Paper>
  );
};

export default React.memo(ConversionHistory); 