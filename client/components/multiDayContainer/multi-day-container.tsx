import { CalendarView, EventObj } from '@/utility/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlatList as RoundList } from 'react-native-bidirectional-infinite-scroll';
import { useDate } from '../../hooks/useDate';
import DayContainer from './day-container';

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const HOUR_HEIGHT = 40;
const GRID_COLOR = '#f0f0f0';
const INIT_DAYS_LOADED = 5;

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
  const [dayWidth, setDayWidth] = useState(3);

  //days generator
  const [startDay, setStartDay] = useState(INIT_DAYS_LOADED * -1);
  const [endDay, setEndDay] = useState(INIT_DAYS_LOADED);
  const { days, refetch } = useDate(startDay, endDay);
  //technical stuff
  const headerRef = useRef<FlatList>(null);
  const isUpdating = useRef(false);

  //render Flatlist Items
  const renderDay = ({ item }: { item: { date: Date } }) => {
    const day = item.date;
    if (!day) return null; // skip invalid day

    const eventsForDay = events.filter((event) => event.start && event.start.toDateString() === day.toDateString());

    return <DayContainer day={day} dayWidth={dayWidth} events={eventsForDay} />;
  };

  const renderDate = ({ item }: { item: { date: Date } }) => {
    return <DayHeader day={item.date} dayWidth={dayWidth} />;
  };

  //update dayWidth of calendar
  useEffect(() => {
    if (calendarType === '1') setDayWidth(SCREEN_WIDTH / 1);
    else if (calendarType === '2') setDayWidth(SCREEN_WIDTH / 2);
    else setDayWidth(SCREEN_WIDTH / 3);
  }, [calendarType]);

  //moves the header with the calendar
  const onGridScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;

    // Directly tell the header to scroll to the same position
    headerRef.current?.scrollToOffset({
      offset: xOffset,
      animated: false,
    });
    const itemsScrolled = Math.floor(xOffset / dayWidth + 0.5);
  };

  //get layouts of item for "RoundList"
  const getItemLayout = (data: any, index: number) => ({
    length: dayWidth,
    offset: dayWidth * index,
    index,
  });

  //load more events
  const handleEndReached = useCallback(async () => {
    if (isUpdating.current) return;

    isUpdating.current = true;
    setEndDay((prev) => prev + 10);

    setTimeout(() => {
      isUpdating.current = false;
    }, 500);
  }, []);
  const handleStartReached = useCallback(async () => {
    if (isUpdating.current) return;

    isUpdating.current = true;
    setStartDay((prev) => prev - 10);

    setTimeout(() => {
      isUpdating.current = false;
    }, 500);
  }, []);

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
            snapToInterval={dayWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {/* --- VERTICAL SCROLL --- */}
        <ScrollView
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          contentContainerStyle={{
            height: HOUR_HEIGHT * 24,
          }}
          horizontal={false}
        >
          {/* --- HORIZONTAL SCROLL --- */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            {days.length > 0 && (
              <RoundList
                style={styles.multiDayContainer}
                snapToInterval={dayWidth}
                decelerationRate="fast"
                snapToAlignment="start"
                onScroll={onGridScroll}
                data={days}
                getItemLayout={getItemLayout}
                initialScrollIndex={INIT_DAYS_LOADED}
                onStartReached={async () => {}}
                onEndReached={async () => {}}
                renderItem={renderDay}
                horizontal={true}
                scrollEventThrottle={16}
                onStartReachedThreshold={10} // Try a small pixel value or 0.1 ratio
                onEndReachedThreshold={10}
                keyExtractor={(item) => item.date.toISOString()}
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

  // --- DAY ---
  multiDayContainer: {
    flexDirection: 'row',
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
