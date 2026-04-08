import { GRID_COLOR } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { isSameDay } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { createEventObj } from '@/utility/eventUtils';
import Svg, { Line } from 'react-native-svg';
import EventContainer from './event-container';
import TimeIndicator from './time-indicator';

const HourTicks = ({ hourHeight }: { hourHeight: number }) => (
  <Svg height={hourHeight * 24} width="100%" style={StyleSheet.absoluteFill}>
    {Array.from({ length: 24 }).map((_, i) => (
      <Line key={i} x1="0" y1={(i + 1) * hourHeight} x2="100%" y2={(i + 1) * hourHeight} stroke={GRID_COLOR} strokeWidth="1" />
    ))}
  </Svg>
);

//TODO: MOVE EVENTS_WITH_OFFSETS USEMEMO SOMEWHERE ELSE (AKA A HOOK)
export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  events,
  handlePress,
}: {
  day: Date;
  dayWidth: number;
  hourHeight: number;
  events: EventObj[];
  handlePress: (event: EventObj | null) => void;
}) {
  const isToday = isSameDay(day, new Date());
    
  //calculate the necessary offset for each event
  const eventsWithOffsets = useMemo(() => {
    //sort events by start time
    const sortedEvents = [...events].sort((a, b) => {
      return Number(a.startDate) - Number(b.startDate);
    });

    const results: EventWithOffset[] = [];

    sortedEvents.forEach((currentEvent) => {
      //Find all events that are already "placed" and overlap with this one
      const overlappingEvents = results.filter((placed) => {
        return currentEvent.startDate < placed.event.endDate && currentEvent.endDate > placed.event.startDate;
      });

      //Find the first available offset (0, 1, 2...) not used by overlapping events
      const occupiedOffsets = overlappingEvents.map((e) => e.offset);
      let firstFreeOffset = 0;
      while (occupiedOffsets.includes(firstFreeOffset)) {
        firstFreeOffset++;
      }

      results.push({
        event: currentEvent,
        offset: firstFreeOffset,
      });
    });

    return results;
  }, [events]);

  //create a stable ref for selection handling
  const handleEventSelect = useCallback(
    (event: EventObj) => {
      handlePress(event);
    },
    [handlePress],
  );

  const getYofEventPress = (event: any) => {
    const locationY = event.nativeEvent.locationY;
    const offsetY = event.nativeEvent.offsetY;
    return locationY ?? offsetY; // Use locationY if available, otherwise fallback to offsetY
  }


  //console.log(day, events);
  return (
    <View key={day.toLocaleDateString()} style={{ borderRightWidth: 1, borderColor: '#f0f0f0', width: dayWidth }}>
      <View style={[styles.dayContainer, { width: dayWidth, zIndex: 999 }]} pointerEvents="box-none">
        <HourTicks hourHeight={hourHeight} />
        {isToday && <TimeIndicator hourHeight={hourHeight} />}
        {/* --- EVENTS --- */}
        {eventsWithOffsets.map((item) => (
          <EventContainer
            key={item.event.id}
            eventWithOffset={item}
            dayWidth={dayWidth}
            hourHeight={hourHeight}
            // Pass the setter down
            onSelect={handleEventSelect}
          />
        ))}
        {/* --- CLOSE EVENT DETAILS BUTTON --- */}
        <Pressable
          onPress={(event) => {
            handlePress(null); // closes event container
            const y = getYofEventPress(event); 
            const hour = Math.floor(y / hourHeight);

            const clickedTime = new Date(day);
            clickedTime.setHours(hour, 0, 0, 0);

            const draftEvent = createEventObj({
              startDate: clickedTime,
              endDate: new Date(clickedTime.getTime() + 60 * 60 * 1000), // Default 1 hr duration
              title: 'New Event' // Or empty string, handled by your UI
            });
            handlePress(draftEvent);
          }}
          style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'transparent' }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
    position: 'relative', // for absolute positioning of indicator
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
  },
});
