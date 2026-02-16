import { GRID_COLOR, HOUR_HEIGHT, INIT_DAYS_LOADED, NEW_DAYS_LOADED, SCREEN_WIDTH } from '@/utility/constants';
import { CalendarView, EventObj } from '@/utility/types';
import { isSameDay } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlatList as RoundList } from 'react-native-bidirectional-infinite-scroll';
import { useDate } from '../../hooks/useDate';
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

    //probably need a better method for this
    const eventsForDay = events.filter((event) => event.startDate && isSameDay(day, event.startDate));
    //probably need a better method of doing this

    return <DayContainer day={day} dayWidth={dayWidth} events={eventsForDay} />;
  };
  const renderDate = ({ item }: { item: { date: Date } }) => {
    return <DayHeader day={item.date} dayWidth={dayWidth} />;
  };

  //load more events foward and backward
  const handleEndReached = useCallback(async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;
    try {
      const newEnd = endDay + NEW_DAYS_LOADED;
      setEndDay(newEnd);
      await refetch(startDay, newEnd);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } catch (error) {
    } finally {
      isUpdating.current = false;
    }
  }, [startDay, endDay, refetch]);
  const handleStartReached = useCallback(async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;
    try {
      const newStart = startDay - NEW_DAYS_LOADED;
      setEndDay(newStart);
      await refetch(newStart, endDay);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } catch (error) {
    } finally {
      isUpdating.current = false;
    }
  }, [startDay, endDay, refetch]);

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

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Calculate how close to edge we are; if at edge, trigger load
    const distanceFromEnd = contentSize.width - (contentOffset.x + layoutMeasurement.width);
    if (distanceFromEnd < 200 && !isUpdating.current) {
      handleEndReached();
    }
  };

  //get layouts of item for "RoundList"
  const getItemLayout = (data: any, index: number) => ({
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
            inverted={false}
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
                onEndReached={async () => {}}
                onStartReached={async () => {}}
                renderItem={renderDay}
                horizontal={true}
                scrollEventThrottle={16}
                onStartReachedThreshold={0.1} // Try a small pixel value or 0.1 ratio
                onEndReachedThreshold={0.1}
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
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
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
