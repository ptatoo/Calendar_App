import { useCalendarRange } from '@/hooks/calendarHooks/useCalendarRange';
import { useCalendarScroll } from '@/hooks/calendarHooks/useCalendarScroll';

import { DATE_HEADER_HEIGHT, GRID_COLOR, HOUR_HEIGHT, HOUR_LABEL_WIDTH, SCREEN_WIDTH } from '@/utility/constants';
import { CalendarView, EventObj } from '@/utility/types';
import { FlashList, FlashListRef } from '@shopify/flash-list';

import { isSameDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import EventDetails from '../event-details';
import DayContainer from './day-container';
import HourGuide from './hour-guide';

const DateHeader = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  return (
    <View style={[styles.date, { width: dayWidth }]}>
      <Text style={{ height: DATE_HEADER_HEIGHT, textAlign: 'center' }}>
        {day.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + day.toLocaleDateString('en-US', { day: 'numeric' })}
      </Text>
    </View>
  );
};

// --- MAIN COMPONENT ---
export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  //width
  const [dayWidth, setDayWidth] = useState((SCREEN_WIDTH - HOUR_LABEL_WIDTH) / 3);
  const listRef = useRef<FlashListRef<any>>(null);

  const [hourHeight, setHourHeight] = useState(60);
  const [baseHeight, setBaseHeight] = useState(60);

  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [eventDetailsVisible, setEventDetailsVisible] = useState<boolean>(false);
  console.log('visibility: ' + eventDetailsVisible);

  //change hourHeight with GestureDectector
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Direct calculation
      const scale = event.scale;
      let newHeight = baseHeight * scale;

      // Constraints
      if (newHeight < 30) newHeight = 30;
      if (newHeight > 200) newHeight = 200;

      setHourHeight(newHeight);
    })
    .onEnd(() => {
      setBaseHeight(hourHeight);
    });

  // hooks
  // Note: Ensure useCalendarRange initializes with a large past buffer (e.g. 365 days)
  // so users don't hit the start edge immediately.
  const { days, initialIndex } = useCalendarRange();
  const { headerRef, handleScroll } = useCalendarScroll(dayWidth);

  //render vertical day columns and date headers
  const renderDay = ({ item }: { item: { date: Date } }) => {
    const day = item.date;
    if (!day) return null;

    const eventsForDay = events.filter((event) => event.startDate && isSameDay(day, event.startDate));
    return (
      <DayContainer
        day={day}
        dayWidth={dayWidth}
        events={eventsForDay}
        hourHeight={hourHeight}
        showEventDetails={setEventDetailsVisible}
        setSelectedEvent={setSelectedEvent}
      />
    );
  };
  const renderDate = ({ item }: { item: { date: Date } }) => {
    return <DateHeader day={item.date} dayWidth={dayWidth} />;
  };

  //Set witdh of each day column (accounting for the hour guide)
  useEffect(() => {
    if (calendarType === '1') setDayWidth((SCREEN_WIDTH - HOUR_LABEL_WIDTH) / 1);
    else if (calendarType === '2') setDayWidth((SCREEN_WIDTH - HOUR_LABEL_WIDTH) / 2);
    else setDayWidth((SCREEN_WIDTH - HOUR_LABEL_WIDTH) / 3);
  }, [calendarType]);

  //get layouts of item for "RoundList"
  const getHeaderLayout = (data: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  });

  // --- DISPLAY ---
  return (
    <>
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.container}>
          {/* --- MAIN CALENDAR --- */}
          <View style={{ borderRightWidth: 1, borderColor: GRID_COLOR, flex: 1 }}>
            {/* --- DATE HEADER --- */}
            <View style={{ height: DATE_HEADER_HEIGHT, flexDirection: 'row' }}>
              {/* --- DATE HEADER HOUR GUIDE --- */}
              <View style={{ width: HOUR_LABEL_WIDTH }}></View>
              {/* --- DATE HORIZONTAL SCROLL --- */}
              <FlatList
                ref={headerRef}
                style={styles.dateContainer}
                data={days}
                renderItem={renderDate}
                horizontal={true}
                scrollEnabled={false}
                getItemLayout={getHeaderLayout}
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={0}
              />
            </View>

            {/* --- VERTICAL SCROLL --- */}
            <ScrollView
              nestedScrollEnabled={true}
              style={{ flex: 1 }}
              contentContainerStyle={{
                height: hourHeight * 24,
                flexDirection: 'row',
                width: SCREEN_WIDTH,
              }}
              horizontal={false}
            >
              {/* --- HOUR GUIDE --- */}
              <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />
              {/* --- HORIZONTAL SCROLL --- */}
              <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
                {days.length > 0 && (
                  <FlashList
                    ref={listRef}
                    data={days}
                    renderItem={renderDay}
                    snapToInterval={SCREEN_WIDTH}
                    horizontal
                    // 5. Start Body at Today (Matching Header)
                    initialScrollIndex={initialIndex - 1}
                    // 6. Sync logic
                    onScroll={handleScroll}
                    // 7. Render optimization
                    drawDistance={dayWidth * 5}
                    nestedScrollEnabled={true}
                    // This ensures the list doesn't swallow touches meant for the items
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </GestureDetector>
      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => setEventDetailsVisible(false)} />
    </>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    height: HOUR_HEIGHT,
  },
  date: {
    padding: 10,
    height: DATE_HEADER_HEIGHT,
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    backgroundColor: '#f0f0f0',
  },
});
