import { EVENT_GAP, EVENT_OFFSET } from '@/utility/constants';
import { EventObj, EventWithOffset } from '@/utility/types';
import { UIContext } from '../contexts/ui-context';

import React, { useContext, useMemo } from 'react';

import { lightenColor } from '@/utility/eventUtils';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

//import { getEventLayout } from '@/utility/eventUtils';

//TODO: MOVE THIS TO A NEW FILE
const getEventLayout = (event: EventObj, offset: number, hourHeight: number, dayWidth: number, columnWidth: number) => {
  const start = new Date(event.startDate).getTime();
  const end = new Date(event.endDate).getTime();
  const durationInMinutes = (end - start) / 60000;

  const startOfDay = new Date(event.startDate).setHours(0, 0, 0, 0);
  const minutesFromMidnight = (start - startOfDay) / 60000;

  const pixelsPerMinute = hourHeight / 60;
  const left = offset * columnWidth;

  return {
    top: minutesFromMidnight * pixelsPerMinute,
    height: durationInMinutes * pixelsPerMinute,
    left: left,
    width: dayWidth - left - EVENT_GAP,
  };
};

//TODO: MAKE THIS LOOK PRETTY
const EventContainer = ({
  eventWithOffset,
  dayWidth,
  hourHeight,
  onSelect,
}: {
  eventWithOffset: EventWithOffset;
  dayWidth: number;
  hourHeight: number;
  onSelect: (event: EventObj) => void;
}) => {
  const { event, offset } = eventWithOffset;
  const { allCaches, activeCacheId, getCalendarColor } = useContext(UIContext);

  //position on screen
  const layout = useMemo(() => {
    return getEventLayout(event, offset, hourHeight, dayWidth, EVENT_OFFSET);
  }, [event, offset, hourHeight, dayWidth]);

  //color on screen
  const rawColor = useMemo(() => {
    let c = getCalendarColor(event.calendarId);
    return lightenColor(c, 0, 0);
  }, [allCaches, activeCacheId, event.calendarId]);
  const borderColor = useMemo(() => {
    return lightenColor(rawColor, 50, 20);
  }, [rawColor]);
  const textColor = useMemo(() => {
    return lightenColor(rawColor, 40, -50);
  }, [rawColor]);

  return (
    <>
      {/* --- EVENT CONTAINER --- */}
      <Pressable
        onPress={() => onSelect(event)}
        delayLongPress={0}
        style={[
          styles.eventContainer,
          {
            ...layout,
            zIndex: offset + 100,
            elevation: offset + 100, // Required for Android layering
          },
        ]}
        hitSlop={5}
      >
        {/* --- EVENT LEFT BAR --- */}
        <View style={[styles.event, { backgroundColor: rawColor, borderLeftColor: borderColor }]}>
          {/* --- EVENT TITLE --- */}
          <Text style={[styles.eventText, { color: textColor }]} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
      </Pressable>
    </>
  );
};

export default React.memo(EventContainer);

const styles = StyleSheet.create({
  eventContainer: {
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'absolute', // Allows use of 'top'
    borderRadius: 4,
  },
  event: {
    flex: 1,
    borderLeftWidth: 6,
    borderRadius: 4,
    padding: 4,
  },
  eventText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 8,
    fontWeight: '600',
    color: '#000000',
  },
});
