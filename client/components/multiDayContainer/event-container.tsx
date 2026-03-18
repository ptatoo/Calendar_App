import { EVENT_GAP, EVENT_OFFSET } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { differenceInMinutes, getHours, getMinutes } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

//TODO: MOVE THIS TO A NEW FILE
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
    left: left,
    width: dayWidth - left - EVENT_GAP,
  };
};

//TODO: MAKE THIS LOOK PRETTY
export default function EventContainer({
  eventWithOffset,
  dayWidth,
  hourHeight,
  onSelect,
}: {
  eventWithOffset: EventWithOffset;
  dayWidth: number;
  hourHeight: number;
  onSelect: () => void;
}) {
  const { event, offset } = eventWithOffset;
  const { top, height, left, width } = getEventLayout(
    event,
    offset,
    hourHeight,
    dayWidth,
    EVENT_OFFSET, //horizontal offset step
  );

  return (
    <>
      {/* --- EVENT CONTAINER --- */}
      <Pressable
        onPress={() => {
          onSelect();
        }}
        delayLongPress={0}
        style={[
          styles.eventContainer,
          {
            top,
            height,
            left,
            width,
            zIndex: offset + 100, // Boost this to ensure it's on top of grid lines
            elevation: offset + 100, // Required for Android layering
          },
        ]}
        hitSlop={5}
      >
        {/* --- EVENT LEFT BAR --- */}
        <View key={event.id} style={styles.event}>
          {/* --- EVENT TITLE --- */}
          <Text style={styles.eventText} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'absolute', // Allows use of 'top'
    borderRadius: 8,
  },
  event: {
    flex: 1,
    backgroundColor: '#dbeafe',
    borderLeftWidth: 8,
    borderLeftColor: '#2563eb',
    borderRadius: 8,
    padding: 4,
  },
  eventText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
});
