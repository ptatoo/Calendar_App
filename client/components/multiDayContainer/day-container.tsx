import { GRID_COLOR } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { isSameDay } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Svg, { Line } from 'react-native-svg';
import EventContainer from './event-container';

// time indicator component
const TimeIndicator = ({ hourHeight }: { hourHeight: number }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Logic: (Hours * height per hour) + (Minutes percentage of an hour)
  const topOffset = (hours + minutes / 60) * hourHeight;

  return (
    <View style={[styles.timeLine, { top: topOffset }]} pointerEvents="none">
      <View style={styles.timeDot} />
    </View>
  );
};

const HourTicks = ({ hourHeight }: { hourHeight: number }) => (
  <Svg height={hourHeight * 24} width="100%" style={StyleSheet.absoluteFill}>
    {Array.from({ length: 24 }).map((_, i) => (
      <Line
        key={i}
        x1="0"
        y1={(i + 1) * hourHeight} 
        x2="100%"
        y2={(i + 1) * hourHeight}
        stroke={GRID_COLOR}
        strokeWidth="1"
      />
    ))}
  </Svg>
);



//TODO: MOVE EVENTS_WITH_OFFSETS USEMEMO SOMEWHERE ELSE (AKA A HOOK)
export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  events,
  setSelectedEvent,
  showEventDetails,
  handlePress,
}: {
  day: Date;
  dayWidth: number;
  hourHeight: number;
  events: EventObj[];
  setSelectedEvent: (event: EventObj) => void;
  showEventDetails: (visibility: boolean) => void;
  handlePress: (event: EventObj | null) => void;
}) {
  const isToday = isSameDay(day, new Date());
  const eventsWithOffsets = useMemo(() => {
    //Sort by start time ascending order
    const sortedEvents = [...events].sort((a, b) => {
      // Ensure we are working with Date objects
      const startA = new Date(a.startDate).getTime();
      const startB = new Date(b.startDate).getTime();
      return startA - startB;
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
  const handleEventSelect = useCallback((event: EventObj) => {
    handlePress(event);
  }, [handlePress]);

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
          onPress={() => {
            handlePress(null);
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
  timeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563EB',
    zIndex: 10, // higher than hourticks
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginLeft: -5,
  },
});
