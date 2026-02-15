import { useDate } from '@/hooks/useDate';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { FlatList as RoundList } from 'react-native-bidirectional-infinite-scroll';

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLOR = '#f0f0f0';

// --- WeekBox Element (NEEDS TO BE ABSTRACTED AWAY) ---
const WeekBox = ({ day, weekHeight }: { day: { id: string; date: Date }; weekHeight: number }) => {
  const ref = useRef(null);
  const [unitWidth, setUnitWidth] = useState(0);
  const [daysOfWeek, setDaysOfWeek] = useState<Date[]>([]);

  //create a list of days in the week
  useLayoutEffect(() => {
    for (let i = 0; i < 7; i++) {
      const tempDay = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate() + i);
      const tempDaysOfWeek = daysOfWeek;
      tempDaysOfWeek.push(tempDay);
      setDaysOfWeek(tempDaysOfWeek);
    }
  }, []);

  useLayoutEffect(() => {
    if (ref && ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      // or unstable_getBoundingClientRect()
      console.log(height);
      setUnitWidth(width / 7);
    }
  }, []);

  //return statement
  return (
    <View style={{ flex: 1, flexDirection: 'row', height: 'auto' }} ref={ref}>
      {daysOfWeek.map((dayItem) => (
        <DayBox key={dayItem.toISOString()} day={dayItem} weekHeight={weekHeight} dayWidth={unitWidth} />
      ))}
    </View>
  );
};

const DayBox = ({ day, weekHeight, dayWidth, key }: { day: Date; weekHeight: number; dayWidth: number; key: string }) => {
  return (
    <View
      style={{
        width: dayWidth,
        height: weekHeight,
        borderWidth: 1,
        borderColor: GRID_COLOR,
      }}
      key={key}
    >
      <Text>{day.getDate()}</Text>
    </View>
  );
};

export default function MonthContainer() {
  const { days: today, refetch: refetchToday } = useDate(0, 2);
  const [weeksObject, setWeeksObject] = useState<{ id: string; date: Date }[]>();
  const ref = useRef(null);
  const [unitHeight, setUnitHeight] = useState(0);

  //get the height for each component
  useLayoutEffect(() => {
    if (ref && ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      // or unstable_getBoundingClientRect()
      setUnitHeight(height / 6);
    }
  }, []);

  //create weeks element; a list of first days of each week
  useEffect(() => {
    if (today && today.length != 0) {
      const tempWeeks = [];
      for (let i = 0; i < 6; i++) {
        const nextDay = new Date(today[0].date.getFullYear(), today[0].date.getMonth(), 1 + i * 7);
        tempWeeks.push(nextDay);
      }
      const dateData = tempWeeks.map((date) => ({
        id: date.toISOString(), // Unique key for FlatList
        date: date,
      }));
      setWeeksObject(dateData);
    }
  }, [today]);

  //render each week
  const renderWeek = ({ item }: { item: { id: string; date: Date } }) => {
    return <WeekBox day={item} weekHeight={unitHeight} />;
  };

  //return statement
  return (
    <View style={{ flex: 1 }} ref={ref}>
      <RoundList
        style={styles.monthContainer}
        data={weeksObject}
        onStartReached={async () => {}}
        onEndReached={async () => {}}
        renderItem={renderWeek}
      ></RoundList>
    </View>
  );
}

const styles = StyleSheet.create({
  monthContainer: {
    flexDirection: 'column',
    backgroundColor: 'white',
    flex: 1,
  },
  weekContainer: {
    width: SCREEN_WIDTH,
  },
});
