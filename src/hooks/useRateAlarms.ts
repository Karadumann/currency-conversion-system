import { useState, useEffect, useCallback } from 'react';
import { RateAlarm } from '../types';
import { currencyService } from '../services/currencyService';

export const useRateAlarms = () => {
  const [alarms, setAlarms] = useState<RateAlarm[]>([]);
  const [showAlarmDialog, setShowAlarmDialog] = useState(false);
  const [targetRate, setTargetRate] = useState<string>('');
  const [alarmCondition, setAlarmCondition] = useState<'above' | 'below'>('above');

  const addAlarm = (fromCurrency: string, toCurrency: string, targetRate: number, condition: 'above' | 'below') => {
    if (targetRate <= 0) {
      throw new Error('Target rate must be greater than 0');
    }

    const existingAlarm = alarms.find(
      alarm => alarm.fromCurrency === fromCurrency && 
               alarm.toCurrency === toCurrency && 
               alarm.targetRate === targetRate &&
               alarm.condition === condition
    );

    if (existingAlarm) {
      throw new Error('An alarm with these parameters already exists');
    }

    const newAlarm: RateAlarm = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
      targetRate,
      condition,
      isActive: true,
      createdAt: new Date()
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

  const checkAlarms = useCallback(async () => {
    for (const alarm of alarms) {
      if (!alarm.isActive) continue;

      try {
        const currentRate = await currencyService.getLatestRate(
          alarm.fromCurrency,
          alarm.toCurrency
        );

        const isTriggered = alarm.condition === 'above' 
          ? currentRate >= alarm.targetRate
          : currentRate <= alarm.targetRate;

        if (isTriggered) {
          // Here you could implement notification logic
          console.log(`Alarm triggered: ${alarm.fromCurrency}/${alarm.toCurrency} ${alarm.condition} ${alarm.targetRate}`);
          
          // Deactivate the alarm after triggering
          toggleAlarm(alarm.id);
        }
      } catch (error) {
        console.error('Error checking alarm:', error);
      }
    }
  }, [alarms, toggleAlarm]);

  // Check alarms every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkAlarms, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

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