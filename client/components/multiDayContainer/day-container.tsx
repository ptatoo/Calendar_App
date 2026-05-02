import { isSameDay } from 'date-fns';
import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SharedValue, scrollTo, useAnimatedReaction, useAnimatedRef, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import DateHeader from './date-header';

import { GRID_COLOR } from '@/utility/constants';
import { createEventObj } from '@/utility/eventUtils';
import { EventObj, EventWithOffset } from '@/utility/types';
import EventContainer from './event-container';
import TimeIndicator from './time-indicator';

const HourTicks = React.memo(({ hourHeight }: { hourHeight: number }) => (
  <Svg height={hourHeight * 24} width="100%" style={StyleSheet.absoluteFill}>
    {Array.from({ length: 24 }).map((_, i) => (
      <Line key={i} x1="0" y1={(i + 1) * hourHeight} x2="100%" y2={(i + 1) * hourHeight} stroke={GRID_COLOR} strokeWidth="1" />
    ))}
  </Svg>
));

//TODO: MOVE EVENTS_WITH_OFFSETS USEMEMO SOMEWHERE ELSE (AKA A HOOK)
export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  eventsWithOffsets,
  handlePress,
  scrollY,
  contextY,
}: {
  day: Date;
  dayWidth: number;
  hourHeight: number;
  eventsWithOffsets: EventWithOffset[];
  handlePress: (event: EventObj | null) => void;
  scrollY: SharedValue<number>;
  contextY: SharedValue<number>;
}) {
  const clickStartInside = useRef(false);
  const isToday = useMemo(() => {
    return isSameDay(day, new Date());
  }, [day]);

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
  };

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useAnimatedReaction(
    () => scrollY.value,
    (now) => {
      scrollTo(scrollRef, 0, now, false);
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -scrollY.value }],
    };
  });

  return (
    <View>
      <DateHeader key={day.toISOString()} day={day} dayWidth={dayWidth} />
      <Animated.View
        ref={scrollRef}
        key={day.toLocaleDateString()}
        style={[styles.dayContainer, animatedStyle, { width: dayWidth, zIndex: 999 }]}
        pointerEvents="box-none"
      >
        <HourTicks hourHeight={hourHeight} />
        {/* --- TIME INDICATOR --- */}
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
          onPressIn={(event) => {
            clickStartInside.current = true;
          }}
          onPressOut={() => {
            // Delay reset slightly to ensure onPress checks it first
            setTimeout(() => {
              clickStartInside.current = false;
            }, 0);
          }}
          onPress={(event) => {
            if (!clickStartInside.current) return;
            const y = getYofEventPress(event);
            const hour = Math.floor(y / hourHeight);

            const clickedTime = new Date(day);
            clickedTime.setHours(hour, 0, 0, 0);

            const draftEvent = createEventObj({
              startDate: clickedTime,
              endDate: new Date(clickedTime.getTime() + 60 * 60 * 1000), // Default 1 hr duration
              title: 'New Event', // Or empty string, handled by your UI
            });
            console.log('Clicked at hour: ', hour);
            handlePress(draftEvent);
          }}
          style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'transparent' }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
    position: 'relative', // for absolute positioning of indicator
    borderRightWidth: 1,
    borderColor: '#f0f0f0',
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
  },
});
