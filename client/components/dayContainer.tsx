import { Dimensions, StyleSheet, View } from "react-native";

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const HOUR_HEIGHT = 40;
const DAY_WIDTH = SCREEN_WIDTH / 3;
const DATE_HEIGHT = 20;
const GRID_COLOR = "#f0f0f0";

const HourTicks = () => {
  return (
    <View style={{}}>
      {Array.from({ length: 24 }).map((_, i) => (
        <View key={i} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
          {/* <Text style={{}}>{i}:00</Text> */}
        </View>
      ))}
    </View>
  );
};

export default function DayContainer({ day }: { day: Date }) {
  return (
    <View
      key={day.toLocaleDateString()}
      style={{ borderRightWidth: 1, borderColor: "#f0f0f0", width: DAY_WIDTH }}
    >
      <View style={styles.dayContainer}>
        <HourTicks />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },

  // --- DAY ---
  multiDayContainer: {
    flexDirection: "row",
    flex: 1,
  },

  dayContainer: {
    width: DAY_WIDTH,
    flex: 1,
  },

  dateContainer: {
    flexDirection: "row",
    height: DATE_HEIGHT,
  },

  date: {
    width: DAY_WIDTH,
    height: DATE_HEIGHT,
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingLeft: 5,
  },
});
