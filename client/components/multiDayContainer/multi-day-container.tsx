import { useIsFocused } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle } from 'react-native-reanimated';

import { useCalendarRange } from '@/hooks/calendarHooks/useCalendarRange';
import { useEventGrouping } from '@/hooks/calendarHooks/useEventGrouping';
import { usePinchZoom } from '@/hooks/calendarHooks/usePinchZoom';
import {
  DATE_HEADER_HEIGHT,
  GRID_COLOR,
  GRID_WIDTH,
  HEADER_BACKGROUND_COLOR,
  HOUR_LABEL_WIDTH,
  PAST_BUFFER,
  SCREEN_WIDTH,
} from '@/utility/constants';
import { CalendarView, EventObj } from '@/utility/types';
import { useCalendarIndex } from '../contexts/calendar-index-context';

import EventDetails from '../eventDetailsContainer/event-details';
import AllDayChip from './allday-chip';
import DateHeader from './date-header';
import DayContainer from './day-container';
import HourGuide from './hour-guide';
import TrackWindow from './track-window';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  const dividers = parseInt(calendarType) || 3;
  const dayWidth = Math.round(GRID_WIDTH / dividers);
  const { hourHeight, pinchGesture } = usePinchZoom();

  //calendarIndex
  const listRef = useAnimatedRef<FlashListRef<any>>();
  const { setDayWidth, scrollX } = useCalendarIndex();
  useLayoutEffect(() => {
    setDayWidth(dayWidth);
  }, [dayWidth, setDayWidth]);

  const { groupedTimedEvents, groupedAllDayEvents } = useEventGrouping(events);
  const { days, initialIndex, extendFuture, totalItems } = useCalendarRange();

  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);

  const handlePress = useCallback((event: EventObj | null) => {
    setSelectedEvent(event);
    setEventDetailsVisible(!!event);
  }, []);

  const onMainScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetX = event.contentOffset.x;
      scrollX.value = offsetX;

      //TODO: MOVE THIS LOGIC ELSWHERE
      // scheduleOnRN((offsetX: number) => {
      //   const itemsScrolled = Math.floor(offsetX / dayWidth + 0.5);
      //   const today = new Date();
      //   setCurDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - PAST_BUFFER + itemsScrolled));
      // }, event.contentOffset.x);
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -scrollX.value }],
    flexDirection: 'row',
  }));

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused && listRef.current && initialIndex !== undefined) {
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [isFocused, initialIndex]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.container}>
          {/* DATE HEADER */}
          <View style={styles.headerWrapper}>
            <View style={styles.dateHourGuide} />
            <TrackWindow animatedStyle={headerAnimatedStyle}>
              {days.map((item) => (
                <DateHeader key={item.date.toISOString()} day={item.date} dayWidth={dayWidth} />
              ))}
            </TrackWindow>
          </View>

          {/* ALL DAY HEADER */}
          <View style={styles.allDayRow}>
            <View style={styles.allDaySpacer}>
              <Text style={styles.debugLabel}>ALL-DAY</Text>
            </View>
            <TrackWindow animatedStyle={headerAnimatedStyle}>
              {days.map((item) => (
                <View key={item.date.toISOString()} style={[styles.allDayColumn, { width: dayWidth }]}>
                  {(groupedAllDayEvents[item.date.toDateString()] || []).map((event) => (
                    <AllDayChip key={event.id} event={event} handlePress={handlePress} />
                  ))}
                </View>
              ))}
            </TrackWindow>
          </View>

          {/* MAIN GRID */}
          <ScrollView nestedScrollEnabled style={{ flex: 1 }} contentContainerStyle={{ height: hourHeight * 24, flexDirection: 'row' }}>
            <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />
            <AnimatedFlashList
              ref={listRef}
              data={days}
              horizontal
              onScroll={onMainScroll}
              scrollEventThrottle={16}
              keyExtractor={(item: any) => item.date.toISOString()}
              style={{ width: GRID_WIDTH }}
              initialScrollIndex={PAST_BUFFER}
              renderItem={({ item }) => (
                <DayContainer
                  day={(item as any).date}
                  dayWidth={dayWidth}
                  eventsWithOffsets={groupedTimedEvents[(item as any).date.toDateString()] || []}
                  hourHeight={hourHeight}
                  handlePress={handlePress}
                />
              )}
            />
          </ScrollView>
        </View>
      </GestureDetector>

      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => handlePress(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', flex: 1 },

  headerWrapper: {
    height: DATE_HEADER_HEIGHT,
    flexDirection: 'row',
    width: SCREEN_WIDTH,
  },

  date: {
    justifyContent: 'center',
    backgroundColor: HEADER_BACKGROUND_COLOR,
  },

  dateInner: {
    alignItems: 'center',
    width: '100%',
    paddingRight: 8,
  },

  dateText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },

  dateNumber: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },

  todayText: { color: '#2563EB' },
  todayNumber: { color: '#2563EB', fontWeight: '700' },

  dateHourGuide: {
    width: HOUR_LABEL_WIDTH,
    backgroundColor: HEADER_BACKGROUND_COLOR,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
  },

  allDayRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    minHeight: 45,
  },

  allDaySpacer: {
    width: HOUR_LABEL_WIDTH,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  debugLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    fontWeight: '400',
  },

  allDayColumn: {
    paddingVertical: 4,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
    backgroundColor: 'white',
  },

  allDayChip: {
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 2,
    marginHorizontal: 4,
  },

  allDayText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
});
