import { DEFAULT_COLORS, EVENT_GAP, EVENT_OFFSET } from '@/utility/constants';
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

const lightenColor = (hex: string, percent: number): string => {
  // Remove the hash if it exists
  let color = hex.replace(/^#/, '');

  // Parse the RGB components
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Lighten each channel
  // Formula: current + (255 - current) * percent
  r = Math.floor(r + (255 - r) * (percent / 100));
  g = Math.floor(g + (255 - g) * (percent / 100));
  b = Math.floor(b + (255 - b) * (percent / 100));

  // Convert back to hex and pad with zeros if necessary
  const toHex = (c: number) => c.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

  const colors = [3, 5, 7, 9, 14, 21];
  const rawColor = DEFAULT_COLORS[colors[Math.floor(Math.random() * 6)]];
  const color = lightenColor(rawColor, 50);

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
            zIndex: offset + 100,
            elevation: offset + 100, // Required for Android layering
          },
        ]}
        hitSlop={5}
      >
        {/* --- EVENT LEFT BAR --- */}
        <View key={event.id} style={[styles.event, { backgroundColor: color, borderLeftColor: rawColor }]}>
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
    borderLeftWidth: 8,
    borderRadius: 8,
    padding: 4,
  },
  eventText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
});
