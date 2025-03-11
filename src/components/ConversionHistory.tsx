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

    return (
      <React.Fragment>
        {!isLast && <Divider />}
        <ListItem>
          <ListItemText
            primary={
              <Typography>
                {item.amount} {item.from} = {formattedValues.result} {item.to}
              </Typography>
            }
            secondary={
              <>
                <Typography variant="body2" color="textSecondary">
                  Rate: 1 {item.from} = {formattedValues.rate} {item.to}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formattedValues.date}
                </Typography>
              </>
            }
          />
        </ListItem>
      </React.Fragment>
    );
  }
);

const ConversionHistory: React.FC<ConversionHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Conversions
      </Typography>
      <List>
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