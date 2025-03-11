import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { ConversionHistory as ConversionHistoryType } from '../types';

interface ConversionHistoryProps {
  history: ConversionHistoryType[];
}

const ConversionHistory: React.FC<ConversionHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Conversions
      </Typography>
      <List>
        {history.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider />}
            <ListItem>
              <ListItemText
                primary={
                  <Typography>
                    {item.amount} {item.from} = {item.result.toFixed(2)} {item.to}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      Rate: 1 {item.from} = {item.rate.toFixed(4)} {item.to}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(item.date).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ConversionHistory; 