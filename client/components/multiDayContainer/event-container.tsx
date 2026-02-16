
import { HOUR_HEIGHT } from '@/utility/constants';
import { EventObj } from '@/utility/types';
import { differenceInMinutes, getHours, getMinutes } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

//maybe move this to a util file
const getEventLayout = (event : EventObj) => {
  const startHour = getHours(event.startDate);
  const startMin = getMinutes(event.startDate);
  const durationInMinutes = differenceInMinutes(event.endDate, event.startDate);
  const pixelsPerMinute = HOUR_HEIGHT / 60;
  const minutesFromMidnight = (startHour * 60) + startMin;
  return {
    top: minutesFromMidnight * pixelsPerMinute,
    height: durationInMinutes * pixelsPerMinute,
  };
}

export const EventContainer = (event: EventObj, dayWidth : number) => {
  const { top, height } = getEventLayout(event); // uses the math function we made

  return (
    <View 
      key={event.id} 
      style={[styles.event, { top, height }, { width: dayWidth }]} // Apply calculated top/height
    >
      <Text style={styles.eventText}>{event.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    event: {
    position: 'absolute', // Allows use of 'top'
    left: 2,
    backgroundColor: '#dbeafe',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    borderRadius: 4,
    padding: 2,
    overflow: 'hidden',
  },
  eventText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  }
});