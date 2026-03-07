import { GRID_COLOR } from '@/utility/constants';
import { EventObj } from '@/utility/types';
import { StyleSheet, View } from 'react-native';
import { EventContainer } from './event-container';

const HourTicks = ({ hourHeight }: { hourHeight: number }) => {
  return (
    <View style={{}}>
      {Array.from({ length: 24 }).map((_, i) => (
        <View key={i} style={[styles.hourRow, { height: hourHeight }]}></View>
      ))}
    </View>
  );
};

export default function DayContainer({
  day,
  dayWidth,
  hourHeight,
  events,
}: {
  day: Date;
  dayWidth: number;
  hourHeight: number;
  events: EventObj[];
}) {
  //console.log(day, events);
  return (
    <View key={day.toLocaleDateString()} style={{ borderRightWidth: 1, borderColor: '#f0f0f0', width: dayWidth }}>
      <View style={[styles.dayContainer, { width: dayWidth }]}>
        <HourTicks hourHeight={hourHeight} />
        {events.map((event) => {
          return EventContainer(event, dayWidth);
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    flex: 1,
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    paddingLeft: 5,
  },
});
