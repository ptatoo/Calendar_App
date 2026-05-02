import { isSameDay } from 'date-fns';
import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
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

const DayContainer = React.memo(
  function DayContainer({
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
    
    const isToday = useMemo(() => isSameDay(day, new Date()), [day]);

    const handleEventSelect = useCallback(
      (event: EventObj) => {
        handlePress(event);
      },
      [handlePress]
    );

    const getYofEventPress = (event: any) => {
      const locationY = event.nativeEvent.locationY;
      const offsetY = event.nativeEvent.offsetY;
      return locationY ?? offsetY;
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: -scrollY.value }],
      };
    });

    return (
      <View>
        <DateHeader key={day.toISOString()} day={day} dayWidth={dayWidth} />
        <Animated.View
          key={day.toLocaleDateString()}
          style={[styles.dayContainer, animatedStyle, { width: dayWidth, zIndex: 999 }]}
          pointerEvents="box-none"
        >
          <HourTicks hourHeight={hourHeight} />
          {isToday && <TimeIndicator hourHeight={hourHeight} />}
          {eventsWithOffsets.map((item) => (
            <EventContainer
              key={item.event.id}
              eventWithOffset={item}
              dayWidth={dayWidth}
              hourHeight={hourHeight}
              onSelect={handleEventSelect}
            />
          ))}
          <Pressable
            onPressIn={() => {
              clickStartInside.current = true;
            }}
            onPressOut={() => {
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
                endDate: new Date(clickedTime.getTime() + 60 * 60 * 1000),
                title: 'New Event',
              });
              handlePress(draftEvent);
            }}
            style={[StyleSheet.absoluteFill, { zIndex: 0, backgroundColor: 'transparent' }]}
          />
        </Animated.View>
      </View>
    );
  },
  (prev, next) => {
    return (
      prev.day.getTime() === next.day.getTime() &&
      prev.dayWidth === next.dayWidth &&
      prev.hourHeight === next.hourHeight &&
      prev.eventsWithOffsets.length === next.eventsWithOffsets.length
    );
  }
);

export default DayContainer;

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
    position: 'relative',
    borderRightWidth: 1,
    borderColor: '#f0f0f0',
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
  },
});