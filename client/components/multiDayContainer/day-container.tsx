import { EventObj } from '@/utility/types';
import { StyleSheet, View } from 'react-native';

// --- CONSTANTS ---
const HOUR_HEIGHT = 40;
const GRID_COLOR = '#f0f0f0';

const HourTicks = () => {
  return (
    <View style={{}}>
      {Array.from({ length: 24 }).map((_, i) => (
        <View key={i} style={[styles.hourRow, { height: HOUR_HEIGHT }]}></View>
      ))}
    </View>
  );
};

export default function DayContainer({ day, dayWidth, events }: { day: Date; dayWidth: number; events: EventObj[] }) {
  console.log(day, events);
  return (
    <View key={day.toLocaleDateString()} style={{ borderRightWidth: 1, borderColor: '#f0f0f0', width: dayWidth }}>
      <View style={[styles.dayContainer, { width: dayWidth }]}>
        <HourTicks />
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
