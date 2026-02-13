import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlatList as RoundList } from "react-native-bidirectional-infinite-scroll";
import DayContainer from "../components/dayContainer";
import { useDate } from "../hooks/useDate";

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 7;
const CONTAINER_PADDING = 40;
const CELL_SIZE = (SCREEN_WIDTH - CONTAINER_PADDING) / NUM_COLUMNS;
const HOUR_HEIGHT = 40;
const DAY_WIDTH = SCREEN_WIDTH / 3;
const DATE_HEIGHT = 20;
const GRID_COLOR = "#f0f0f0";
const INIT_DAYS_LOADED = 5;

const DayHeader = ({ day }: { day: Date }) => {
  return (
    <View style={styles.date}>
      <Text style={{ height: 20, textAlign: "center" }}>
        {day.toLocaleDateString("en-US", { weekday: "short" }) +
          " " +
          day.toLocaleDateString("en-US", { day: "numeric" })}
      </Text>
    </View>
  );
};

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const [data, setData] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<"M" | "W" | "3" | "2" | "1">("3"); // month/week toggle
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDay, setStartDay] = useState(INIT_DAYS_LOADED * -1);
  const [endDay, setEndDay] = useState(INIT_DAYS_LOADED);
  const days = useDate(startDay, endDay);
  const headerRef = useRef<FlatList>(null);
  const isUpdating = useRef(false);

  const renderDay = ({ item }: { item: { date: Date } }) => {
    return <DayContainer day={item.date} />;
  };
  const renderDate = ({ item }: { item: { date: Date } }) => {
    return <DayHeader day={item.date} />;
  };

  //moves the header with the calendar
  const onGridScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;

    // Directly tell the header to scroll to the same position
    headerRef.current?.scrollToOffset({
      offset: xOffset,
      animated: false,
    });
    const itemsScrolled = Math.floor(xOffset / DAY_WIDTH + 0.5);
    console.log(itemsScrolled);
  };

  const getItemLayout = (data: any, index: number) => ({
    length: DAY_WIDTH,
    offset: DAY_WIDTH * index,
    index,
  });

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
        <View style={{ height: DATE_HEIGHT }}>
          <FlatList
            ref={headerRef}
            style={styles.dateContainer}
            data={days}
            renderItem={renderDate}
            horizontal={true}
            scrollEnabled={false}
            snapToInterval={DAY_WIDTH}
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
                snapToInterval={DAY_WIDTH}
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
