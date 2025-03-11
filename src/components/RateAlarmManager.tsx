import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import { useRateAlarms } from '../hooks/useRateAlarms';
import { memoizedNumberFormatter } from '../utils/memoization';

interface RateAlarmManagerProps {
  fromCurrency: string;
  toCurrency: string;
  currentRate: number | null;
}

const RateAlarmManager: React.FC<RateAlarmManagerProps> = ({
  fromCurrency,
  toCurrency,
  currentRate
}) => {
  const {
    alarms,
    showAlarmDialog,
    setShowAlarmDialog,
    targetRate,
    setTargetRate,
    alarmCondition,
    setAlarmCondition,
    addAlarm,
    deleteAlarm,
    toggleAlarm
  } = useRateAlarms();

  const handleAddAlarm = () => {
    if (!targetRate || isNaN(Number(targetRate)) || Number(targetRate) <= 0) {
      return;
    }
    
    try {
      addAlarm(fromCurrency, toCurrency, Number(targetRate), alarmCondition);
    } catch (error) {
      console.error('Error adding alarm:', error);
      // In a production app, you'd want to show this error to the user
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Rate Alarms
        </Typography>
        <Button
          startIcon={<AddAlertIcon />}
          variant="contained"
          onClick={() => setShowAlarmDialog(true)}
        >
          Add Alarm
        </Button>
      </Box>

      <List>
        {alarms
          .filter(alarm => alarm.fromCurrency === fromCurrency && alarm.toCurrency === toCurrency)
          .map((alarm) => (
            <ListItem key={alarm.id}>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Alert when rate goes {alarm.condition}{' '}
                    {memoizedNumberFormatter(alarm.targetRate)}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Created on {new Date(alarm.createdAt).toLocaleString()}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={alarm.isActive}
                  onChange={() => toggleAlarm(alarm.id)}
                  inputProps={{ 'aria-label': 'Toggle alarm' }}
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteAlarm(alarm.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>

      <Dialog open={showAlarmDialog} onClose={() => setShowAlarmDialog(false)}>
        <DialogTitle>Add Rate Alarm</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Target Rate"
              type="number"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              fullWidth
              helperText={currentRate ? `Current rate: ${memoizedNumberFormatter(currentRate)}` : ''}
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
            Add Alarm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default React.memo(RateAlarmManager); 