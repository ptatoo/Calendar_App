import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
//import { FlatList } from "react-native-bidirectional-infinite-scroll";

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 7;
const CONTAINER_PADDING = 40;
const CELL_SIZE = (SCREEN_WIDTH - CONTAINER_PADDING) / NUM_COLUMNS;
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

const DayContainer = () => {
  return (
    <View style={{ borderRightWidth: 1, borderColor: "#f0f0f0", flex: 1 }}>
      <View style={styles.dayContainer}>
        <HourTicks />
      </View>
    </View>
  );
};

const DayHeader = ({ day }) => {
  return (
    <View style={styles.date}>
      <Text style={{ height: 10, textAlign: "center" }}>
        {day.toLocaleDateString("en-US", { weekday: "short" })}
      </Text>
    </View>
  );
};

const generateDays = (count = 20) => {
  const days = [];
  for (let i = 0; i < count; i++) {
    const date = new Date();
    // This adds 'i' number of days to today's date
    date.setDate(date.getDate() + i);

    days.push({
      id: date.getTime().toString(), // Unique ID for FlatList
      date: date,
      fullDateString: date.toDateString(), // e.g. "Wed Feb 11 2026"
    });
  }
  return days;
};

interface BasicDate {
  id: string; // Unique ID for FlatList
  date: Date;
  fullDateString: string; // e.g. "Wed Feb 11 2026"
}

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const [data, setData] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<"M" | "W" | "3" | "2" | "1">("3"); // month/week toggle
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState(() => generateDays(20));
  const headerRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const renderDay = ({ item }) => {
    return <DayContainer />;
  };
  const renderDate = ({ item, index }) => {
    return <DayHeader day={item.date} />;
  };

  const onGridScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;

    // Directly tell the header to scroll to the same position
    headerRef.current?.scrollToOffset({
      offset: xOffset,
      animated: false, // Must be false for "perfect" syncing
    });
  };

  // --- DISPLAY ---
  return (
    <View style={styles.container}>
      {/* --- VIEW TOGGLE BUTTONS --- */}
      <View style={{ borderRightWidth: 1, borderColor: GRID_COLOR, flex: 1 }}>
        <View style={{ height: DATE_HEIGHT }}>
          <FlatList
            ref={headerRef}
            style={styles.dateContainer}
            data={days}
            renderItem={renderDate}
            horizontal={true}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <ScrollView
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          contentContainerStyle={{
            height: HOUR_HEIGHT * 24,
          }}
        >
          <FlatList
            style={styles.multiDayContainer}
            onScroll={onGridScroll}
            data={days}
            renderItem={renderDay}
            horizontal={true}
          />
        </ScrollView>
      </View>
    </View>
  );
}

// --- STYLES ---
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

  // --- WEEKDAY ROW ---
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekday: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },

  // --- MONTH CELLS ---
  cell: {
    width: CELL_SIZE,
    height: 90,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 6,
  },
  dateNumber: {
    position: "absolute",
    top: 6,
    right: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },
  event: {
    marginTop: 18,
    fontSize: 11,
    color: "#111",
  },

  // --- MONTH NAVIGATION ---
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  monthArrow: {
    fontSize: 24,
    paddingHorizontal: 12,
  },

  // --- VIEW TOGGLE BUTTONS ---
  viewToggle: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  toggleActive: {
    backgroundColor: "white",
    fontWeight: "600",
  },

  // --- LOAD EVENTS BUTTON ---
  btnPrimary: {
    backgroundColor: "#4285F4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
  column: {
    width: "auto",
    borderRightWidth: 1,
    borderColor: "#eee",
  },
  hourRow: {
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingLeft: 5,
  },
});
