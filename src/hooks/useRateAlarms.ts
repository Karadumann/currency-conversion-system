import { useState, useEffect } from 'react';
import { RateAlarm } from '../types';
import { currencyService } from '../services/currencyService';

export const useRateAlarms = () => {
  const [alarms, setAlarms] = useState<RateAlarm[]>([]);
  const [showAlarmDialog, setShowAlarmDialog] = useState(false);
  const [targetRate, setTargetRate] = useState<string>('');
  const [alarmCondition, setAlarmCondition] = useState<'above' | 'below'>('above');

  const addAlarm = (fromCurrency: string, toCurrency: string) => {
    if (!targetRate || isNaN(Number(targetRate))) {
      console.error('Invalid target rate');
      return;
    }

    const newAlarm: RateAlarm = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
      targetRate: Number(targetRate),
      condition: alarmCondition,
      isActive: true
    };

    setAlarms(prev => [...prev, newAlarm]);
    setShowAlarmDialog(false);
    setTargetRate('');
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
    ));
  };

  const checkAlarms = async () => {
    for (const alarm of alarms) {
      if (!alarm.isActive) continue;

      try {
        const currentRate = await currencyService.getLatestRate(
          alarm.fromCurrency,
          alarm.toCurrency
        );

        const isTriggered = alarm.condition === 'above' 
          ? currentRate > alarm.targetRate
          : currentRate < alarm.targetRate;

        if (isTriggered) {
          // Here you could implement notification logic
          console.log(`Alarm triggered: ${alarm.fromCurrency}/${alarm.toCurrency} rate is ${alarm.condition} ${alarm.targetRate}`);
        }
      } catch (error) {
        console.error('Error checking alarm:', error);
      }
    }
  };

  // Check alarms every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkAlarms, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  return {
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
  };
}; 