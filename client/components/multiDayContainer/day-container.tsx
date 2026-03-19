import { GRID_COLOR } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import EventContainer from './event-container';

const HourTicks = ({ hourHeight }: { hourHeight: number }) => {
  return (
    <View style={{}}>
      {Array.from({ length: 24 }).map((_, i) => (
        <View key={i} style={[styles.hourRow, { height: hourHeight }]}></View>
      ))}
    </View>
  );
};

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

  //console.log(day, events);
  return (
    <View key={day.toLocaleDateString()} style={{ borderRightWidth: 1, borderColor: '#f0f0f0', width: dayWidth }}>
      <View style={[styles.dayContainer, { width: dayWidth, zIndex: 999 }]} pointerEvents="box-none">
        <HourTicks hourHeight={hourHeight} />
        {/* --- EVENTS --- */}
        {eventsWithOffsets.map((item) => (
          <EventContainer
            key={item.event.id}
            eventWithOffset={item}
            dayWidth={dayWidth}
            hourHeight={hourHeight}
            // Pass the setter down
            onSelect={() => {
              handlePress(item.event);
            }}
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
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    paddingLeft: 5,
  },
});
