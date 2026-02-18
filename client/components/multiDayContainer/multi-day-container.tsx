import { useCalendarRange } from '@/hooks/calendarHooks/useCalendarRange';
import { useCalendarScroll } from '@/hooks/calendarHooks/useCalendarScroll';
import { GRID_COLOR, HOUR_HEIGHT, SCREEN_WIDTH } from '@/utility/constants';
import { CalendarView, EventObj } from '@/utility/types';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { isSameDay } from 'date-fns';
import { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DateContext } from '../calendar-context';
import DayContainer from './day-container';

const DayHeader = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  return (
    <View style={[styles.date, { width: dayWidth }]}>
      <Text style={{ height: 20, textAlign: 'center' }}>
        {day.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + day.toLocaleDateString('en-US', { day: 'numeric' })}
      </Text>
    </View>
  );
};

// --- MAIN COMPONENT ---
export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  //width
  const [dayWidth, setDayWidth] = useState(SCREEN_WIDTH / 3); // Set default to avoid 0 width issues
  const listRef = useRef<FlashListRef<any>>(null);

  //hooks
  // Note: Ensure useCalendarRange initializes with a large past buffer (e.g. 365 days)
  // so users don't hit the start edge immediately.
  const { days, initialIndex } = useCalendarRange();
  const { headerRef, handleScroll } = useCalendarScroll(dayWidth);
  const { curDate, setCurDate } = useContext(DateContext);

  //update dayWidth
  useEffect(() => {
    if (calendarType === '1') setDayWidth(SCREEN_WIDTH / 1);
    else if (calendarType === '2') setDayWidth(SCREEN_WIDTH / 2);
    else setDayWidth(SCREEN_WIDTH / 3);
  }, [calendarType]);

  /////////////////////
  //render logic
  const renderDay = ({ item }: { item: { date: Date } }) => {
    const day = item.date;
    if (!day) return null;

    const eventsForDay = events.filter((event) => event.startDate && isSameDay(day, event.startDate));

    return <DayContainer day={day} dayWidth={dayWidth} events={eventsForDay} />;
  };

  const renderDate = ({ item }: { item: { date: Date } }) => {
    return <DayHeader day={item.date} dayWidth={dayWidth} />;
  };
  //render logic
  /////////////////////

  // Layout for Header FlatList (Keep this for the header sync)
  const getHeaderLayout = (data: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  });

  // --- DISPLAY ---
  return (
    <View style={styles.container}>
      {/* --- MAIN CALENDAR --- */}
      <View style={{ borderRightWidth: 1, borderColor: GRID_COLOR, flex: 1 }}>
        
        {/* --- DATE HEADER --- */}
        <View style={{ height: HOUR_HEIGHT }}>
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
          contentContainerStyle={{ height: HOUR_HEIGHT * 24 }}
        >
          {/* --- HORIZONTAL SCROLL (FlashList) --- */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            {days.length > 0 && (
              <FlashList
                ref={listRef}
                data={days}
                renderItem={renderDay}
                snapToInterval={SCREEN_WIDTH}
                horizontal
                // 5. Start Body at Today (Matching Header)
                initialScrollIndex={initialIndex-1}
                // 6. Sync logic
                onScroll={handleScroll}
                // 7. Render optimization
                drawDistance={dayWidth * 5}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </View>
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
    height: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    backgroundColor: '#f0f0f0',
  },
});