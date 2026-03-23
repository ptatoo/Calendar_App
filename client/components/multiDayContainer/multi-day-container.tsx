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
import { isSameDay } from 'date-fns';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { DateContext } from '../calendar-context';

import EventDetails from '../eventDetailsContainer/event-details';
import DayContainer from './day-container';
import HourGuide from './hour-guide';

const GRID_WIDTH = SCREEN_WIDTH - HOUR_LABEL_WIDTH;

const DateHeader = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  const isToday = new Date().toDateString() === day.toDateString();

  return (
    <View style={[styles.date, { width: dayWidth }]}>
      <View style={styles.dateInner}>
        <Text style={[styles.dateText, isToday && styles.todayText]}>
          {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
        </Text>
        <Text style={[styles.dateNumber, isToday && styles.todayNumber]}>{day.toLocaleDateString('en-US', { day: 'numeric' })}</Text>
      </View>
    </View>
  );
};

export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  const [dayWidth, setDayWidth] = useState(Math.floor((SCREEN_WIDTH - HOUR_LABEL_WIDTH) / 3));

  const listRef = useRef<FlashListRef<any>>(null);
  const headerRef = useRef<FlatList>(null);
  const allDayRef = useRef<FlatList>(null);

  const [hourHeight, setHourHeight] = useState(HOUR_HEIGHT);
  const [baseHeight, setBaseHeight] = useState(HOUR_HEIGHT);

  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);

  const { days, initialIndex } = useCalendarRange();
  const { setCurDate } = useContext(DateContext);
  const today = new Date();

  const timedEvents = useMemo(() => events.filter((e) => !e.allDay || String(e.allDay) === 'false'), [events]);

  const allDayEvents = useMemo(() => events.filter((e) => e.allDay === true || String(e.allDay) === 'true'), [events]);

  // 🔥 SINGLE SOURCE OF TRUTH SCROLL
  const onMainScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const itemsScrolled = Math.floor(x / dayWidth + 0.5);
    setCurDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - PAST_BUFFER + itemsScrolled));

    headerRef.current?.scrollToOffset({ offset: x, animated: false });
    allDayRef.current?.scrollToOffset({ offset: x, animated: false });
  };

  //update the event and visibilty of event details
  const handlePress = (event: EventObj | null) => {
    if (!event) {
      //a null event means hide the event details
      setEventDetailsVisible(false);
    }
    setSelectedEvent(event);
    setEventDetailsVisible(true);
  };

  //set witdh of each day column (accounting for the hour guide)
  useEffect(() => {
    const dividers = parseInt(calendarType) || 3;
    const width = Math.floor((SCREEN_WIDTH - HOUR_LABEL_WIDTH) / dividers);
    setDayWidth(width);
  }, [calendarType]);

  //temporary: forces calendar to initialIndex on rerender
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused && listRef.current && initialIndex !== undefined) {
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [isFocused, initialIndex]);

  const getItemLayout = (_: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  });

  return (
    <>
      <GestureDetector
        gesture={Gesture.Pinch()
          .onUpdate((e) => {
            let newHeight = baseHeight * e.scale;
            setHourHeight(Math.min(Math.max(newHeight, 30), 200));
          })
          .onEnd(() => setBaseHeight(hourHeight))}
      >
        <View style={styles.container}>
          {/* --- HEADER --- */}
          <View style={styles.headerWrapper}>
            <View style={styles.dateHourGuide} />

            <FlatList
              ref={headerRef}
              data={days}
              renderItem={({ item }) => <DateHeader day={item.date} dayWidth={dayWidth} />}
              horizontal
              scrollEnabled={false}
              getItemLayout={getItemLayout}
              style={{ width: GRID_WIDTH }}
              scrollEventThrottle={15}
            />
          </View>

          {/* --- ALL DAY HEADER --- */}
          <View style={styles.allDayRow}>
            <View style={styles.allDaySpacer}>
              <Text style={styles.debugLabel}>ALL-DAY</Text>
            </View>

            <FlatList
              ref={allDayRef}
              data={days}
              horizontal
              scrollEnabled={false}
              getItemLayout={getItemLayout}
              style={{ width: GRID_WIDTH }}
              renderItem={({ item }) => {
                const dayEvents = allDayEvents.filter((e) => isSameDay(item.date, new Date(e.startDate)));

                return (
                  <View style={[styles.allDayColumn, { width: dayWidth }]}>
                    {dayEvents.map((event) => (
                      <Pressable
                        key={event.id}
                        onPress={() => handlePress(event)}
                        style={[
                          styles.allDayChip,
                          {
                            backgroundColor: event.displayColor || '#3B82F6',
                          },
                        ]}
                      >
                        <Text style={styles.allDayText} numberOfLines={1}>
                          {event.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                );
              }}
            />
          </View>

          {/* --- MAIN GRID --- */}
          <ScrollView
            nestedScrollEnabled
            style={{ flex: 1 }}
            contentContainerStyle={{
              height: hourHeight * 24,
              flexDirection: 'row',
            }}
          >
            <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />

            <FlashList
              ref={listRef}
              data={days}
              renderItem={({ item }) => (
                <DayContainer
                  day={item.date}
                  dayWidth={dayWidth}
                  events={timedEvents.filter((e) => isSameDay(item.date, new Date(e.startDate)))}
                  hourHeight={hourHeight}
                  handlePress={handlePress}
                  showEventDetails={setEventDetailsVisible}
                  setSelectedEvent={setSelectedEvent}
                />
              )}
              horizontal
              onScroll={onMainScroll}
              scrollEventThrottle={16}
              keyExtractor={(item) => item.date.toISOString()}
              style={{ width: GRID_WIDTH }}
            />
          </ScrollView>
        </View>
      </GestureDetector>

      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => setEventDetailsVisible(false)} />
    </>
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
    alignItems: 'flex-end',
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
    backgroundColor: HEADER_BACKGROUND_COLOR,
  },

  debugLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    fontWeight: '800',
  },

  allDayColumn: {
    paddingVertical: 4,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
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
