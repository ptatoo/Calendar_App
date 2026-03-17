import { EventObj, EventWithOffset } from '@/utility/types';
import { differenceInMinutes, getHours, getMinutes } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';

//maybe move this to a util file
const getEventLayout = (event: EventObj, offset: number, hourHeight: number, dayWidth: number, columnWidth: number) => {
  const startHour = getHours(event.startDate);
  const startMin = getMinutes(event.startDate);
  const durationInMinutes = differenceInMinutes(event.endDate, event.startDate);

  const pixelsPerMinute = hourHeight / 60;
  const minutesFromMidnight = startHour * 60 + startMin;
  const left = offset * columnWidth;

  return {
    top: minutesFromMidnight * pixelsPerMinute,
    height: durationInMinutes * pixelsPerMinute,
    // Each offset shifts the event to the right by one column width
    left: left,
    width: dayWidth - left,
  };
};

export const EventContainer = (eventWithOffset: EventWithOffset, dayWidth: number, hourHeight: number) => {
  const { event, offset } = eventWithOffset;
  const COLUMN_WIDTH = dayWidth * 0.8;
  const { top, height, left, width } = getEventLayout(
    event,
    offset,
    hourHeight,
    dayWidth,
    15, // This is the horizontal "step" for each offset (e.g., 30px)
  );

  return (
    <View
      key={event.id}
      style={[
        styles.event,
        {
          top,
          height,
          left,
          width,
          zIndex: offset,
        },
      ]}
    >
      <Text style={styles.eventText} numberOfLines={1}>
        {event.title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  event: {
    position: 'absolute', // Allows use of 'top'
    backgroundColor: '#dbeafe',
    borderLeftWidth: 8,
    borderLeftColor: '#2563eb',
    borderRadius: 8,
    padding: 4,
    overflow: 'hidden',
  },
  eventText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
});
