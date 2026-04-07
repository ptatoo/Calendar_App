import { useCalendarRange } from '@/hooks/calendarHooks/useCalendarRange';
import {
  DATE_HEADER_HEIGHT,
  GRID_COLOR,
  HEADER_BACKGROUND_COLOR,
  HOUR_HEIGHT,
  HOUR_LABEL_WIDTH,
  PAST_BUFFER,
  SCREEN_WIDTH,
} from '@/utility/constants';
import { CalendarView, EventObj } from '@/utility/types';
import { useIsFocused } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { DateContext } from '../contexts/calendar-index-context';

import Animated, { useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import EventDetails from '../eventDetailsContainer/event-details';
import AllDayChip from './allday-chip';
import DateHeader from './date-header';
import DayContainer from './day-container';
import HourGuide from './hour-guide';

const GRID_WIDTH = SCREEN_WIDTH - HOUR_LABEL_WIDTH;
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  //set witdh of each day column (accounting for the hour guide)
  const dividers = parseInt(calendarType) || 3;
  const dayWidth = Math.floor(GRID_WIDTH / dividers);

  const listRef = useAnimatedRef<FlashListRef<any>>();
  //replace other two refs with scrollX
  const scrollX = useSharedValue(PAST_BUFFER * dayWidth);

  const [hourHeight, setHourHeight] = useState(HOUR_HEIGHT);
  const [baseHeight, setBaseHeight] = useState(HOUR_HEIGHT);

  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);

  const { days, initialIndex } = useCalendarRange();
  const { curDate, setCurDate } = useContext(DateContext);
  const today = new Date();

  //stabilizes callback
  const handlePress = useCallback((event: EventObj | null) => {
    if (!event) setEventDetailsVisible(false);
    setSelectedEvent(event);
    setEventDetailsVisible(!!event);
  }, []);

  //pregroups events instead of on render
  const { groupedTimedEvents, groupedAllDayEvents } = useMemo(() => {
    const timed: Record<string, EventObj[]> = {};
    const allDay: Record<string, EventObj[]> = {};

    events.forEach((e) => {
      const dateKey = new Date(e.startDate).toDateString();
      const isAllDay = e.allDay === true || String(e.allDay) === 'true';

      if (isAllDay) {
        if (!allDay[dateKey]) allDay[dateKey] = [];
        allDay[dateKey].push(e);
      } else {
        if (!timed[dateKey]) timed[dateKey] = [];
        timed[dateKey].push(e);
      }
    });

    return { groupedTimedEvents: timed, groupedAllDayEvents: allDay };
  }, [events]);

  const updateContextOnScroll = (offsetX: number) => {
    const itemsScrolled = Math.floor(offsetX / dayWidth + 0.5);
    setCurDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - PAST_BUFFER + itemsScrolled));
  };

  const onMainScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      scheduleOnRN(updateContextOnScroll, event.contentOffset.x);
    },
  });

  //animated style for all headers
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: -scrollX.value }],
      flexDirection: 'row',
    };
  });

  //temporary: forces calendar to initialIndex on rerender
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused && listRef.current && initialIndex !== undefined) {
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [isFocused, initialIndex]);

  const [viewType, setViewType] = useState('3-Day');

  return (
    <View style={styles.container}>
      <GestureDetector
        gesture={Gesture.Pinch()
          .onUpdate((e) => {
            let newHeight = baseHeight * e.scale;
            setHourHeight(Math.min(Math.max(newHeight, 30), 200));
          })
          .onEnd(() => setBaseHeight(hourHeight))}
      >
        <View style={styles.container}>
          {/* --- DATE HEADER --- */}
          <View style={styles.headerWrapper}>
            <View style={styles.dateHourGuide} />
            {/* The clipping window */}
            <View style={{ width: GRID_WIDTH, overflow: 'hidden' }}>
              {/* The sliding track */}
              <Animated.View style={headerAnimatedStyle}>
                {days.map((item) => (
                  <DateHeader key={item.date.toISOString()} day={item.date} dayWidth={dayWidth} />
                ))}
              </Animated.View>
            </View>
          </View>

          {/* --- ALL DAY HEADER --- */}
          <View style={styles.allDayRow}>
            <View style={styles.allDaySpacer}>
              <Text style={styles.debugLabel}>ALL-DAY</Text>
            </View>
            {/* The clipping window */}
            <View style={{ width: GRID_WIDTH, overflow: 'hidden' }}>
              {/* The sliding track */}
              <Animated.View style={headerAnimatedStyle}>
                {days.map((item) => {
                  const dayEvents = groupedAllDayEvents[item.date.toDateString()] || [];
                  return (
                    <View key={item.date.toISOString()} style={[styles.allDayColumn, { width: dayWidth }]}>
                      {dayEvents.map((event) => (
                        <AllDayChip key={event.id} event={event} handlePress={handlePress} />
                      ))}
                    </View>
                  );
                })}
              </Animated.View>
            </View>
          </View>

          {/* --- MAIN GRID --- */}
          <ScrollView nestedScrollEnabled style={{ flex: 1 }} contentContainerStyle={{ height: hourHeight * 24, flexDirection: 'row' }}>
            <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />

            <AnimatedFlashList
              ref={listRef}
              data={days}
              renderItem={(props) => {
                const item = props.item as { date: Date };
                return (
                  <DayContainer
                    day={item.date}
                    dayWidth={dayWidth}
                    events={groupedTimedEvents[item.date.toDateString()] || []}
                    hourHeight={hourHeight}
                    handlePress={handlePress}
                    //showEventDetails={setEventDetailsVisible}
                    //setSelectedEvent={setSelectedEvent}
                  />
                );
              }}
              horizontal
              onScroll={onMainScroll} // Native UI Thread scroll
              scrollEventThrottle={16}
              keyExtractor={(item: any) => item.date.toISOString()}
              style={{ width: GRID_WIDTH }}
              initialScrollIndex={PAST_BUFFER}
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
