import {
    HEADER_BACKGROUND_COLOR
} from '@/utility/constants';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DateHeader = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  const isToday = new Date().toDateString() === day.toDateString();
  return (
    <View style={[styles.date, { width: dayWidth }]}>
      <View style={styles.dateInner}>
        <Text style={[styles.dateText, isToday && styles.todayText]}>
          {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
        </Text>
        <Text style={[styles.dateNumber, isToday && styles.todayNumber]}>{day.toLocaleDateString('en-US', { day: 'numeric' })}</Text>
      </View>
    </View>
  );
};

export default memo(DateHeader);

const styles = StyleSheet.create({
  date: {
    justifyContent: 'center',
    backgroundColor: HEADER_BACKGROUND_COLOR,
  },
  dateInner: {
    alignItems: 'center',
    width: '100%',
    paddingRight: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateNumber: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
  todayText: { color: '#2563EB' },
  todayNumber: { color: '#2563EB', fontWeight: '700' },
});