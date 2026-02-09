import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, FlatList, Dimensions, ScrollView } from "react-native";

// --- CONSTANTS ---
const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 7;
const CONTAINER_PADDING = 40;
const CELL_SIZE = (SCREEN_WIDTH - CONTAINER_PADDING) / NUM_COLUMNS;

// --- HELPER FUNCTIONS ---
// create grid for month
function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: any[] = [];

  // empty cells
  for (let i = 0; i < startDay; i++) {
    cells.push({ key: `empty-${i}`, empty: true });
  }

  // add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      key: `day-${day}`,
      day,
      dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }

  return cells;
}

// get the Sunday at the start of the week
function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${suffix}`;
}

// --- MONTH VIEW COMPONENT ---
function MonthView({ year, month, events }: { year: number; month: number; events: any[] }) {
  const days = useMemo(() => getMonthGrid(year, month), [year, month]);

  return (
    <>
      {/* Weekday headers */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <Text key={d} style={{ width: CELL_SIZE, textAlign: "center", fontSize: 11, fontWeight: "600", color: "#666" }}>
            {d}
          </Text>
        ))}
      </View>

      {/* Month grid */}
      <FlatList
        data={days}
        numColumns={7}
        scrollEnabled={false}
        renderItem={({ item }) => {
          if (item.empty) return <View style={{ width: CELL_SIZE, height: 90, borderWidth: 1, borderColor: "#e5e5e5", padding: 6 }} />;

          const dayEvents = events.filter(
            (e) =>
              e.start?.dateTime?.startsWith(item.dateString) ||
              e.start?.date === item.dateString
          );

          return (
            <View style={{ width: CELL_SIZE, height: 90, borderWidth: 1, borderColor: "#e5e5e5", padding: 6 }}>
              <Text style={{ position: "absolute", top: 6, right: 6, fontSize: 12, fontWeight: "600", color: "#444" }}>
                {item.day}
              </Text>
                  
                  {/* events */}
              {dayEvents.map((e, i) => (
                <Text key={i} style={{ marginTop: 18, fontSize: 11, color: "#111" }} numberOfLines={1}>
                  {e.summary ?? "Untitled"}
                </Text>
              ))}
            </View>
          );
        }}
      />
    </>
  );
}

// --- WEEK VIEW COMPONENT ---
function WeekView({currentDate, events, onChangeWeek}: {currentDate: Date; events: any[]; onChangeWeek: (newDate: Date) => void;}) {
  const weekStart = getWeekStart(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours
  const HOUR_HEIGHT = 60;
  const TIME_LABEL_WIDTH = 50;

  return (
    <View style={{ flexDirection: "column", flex: 1 }}>
      {/* --- WEEK NAVIGATION --- */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Pressable onPress={() => onChangeWeek(new Date(currentDate.setDate(currentDate.getDate() - 7)))}>
          <Text style={{ fontSize: 24, paddingHorizontal: 12 }}>‹</Text>
        </Pressable>

        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Week of {weekStart.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
        </Text>

        <Pressable onPress={() => onChangeWeek(new Date(currentDate.setDate(currentDate.getDate() + 7)))}>
          <Text style={{ fontSize: 24, paddingHorizontal: 12 }}>›</Text>
        </Pressable>
      </View>

      {/* --- DAY LABELS ROW --- */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        <View style={{ width: TIME_LABEL_WIDTH }} />
        {Array.from({ length: 7 }).map((_, dayIndex) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIndex);
          const dayLabel = dayDate.toLocaleDateString("default", {
            weekday: "short",
            day: "numeric",
          });
          return (
            <Text
              key={dayIndex}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 11,
                fontWeight: "600",
                color: "#666",
              }}
            >
              {dayLabel}
            </Text>
          );
        })}
      </View>

      {/* --- SCROLLABLE HOURS --- */}
      <ScrollView
        horizontal={false}
        style={{ height: Dimensions.get("window").height - 250 }} // FIXED HEIGHT
        contentContainerStyle={{ minHeight: hours.length * HOUR_HEIGHT + HOUR_HEIGHT }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* Time labels column */}
          <View style={{ width: TIME_LABEL_WIDTH }}>
            {hours.map((h) => (
              <Text
                key={h}
                style={{
                  height: HOUR_HEIGHT,
                  fontSize: 10,
                  color: "#666",
                  textAlign: "right",
                  paddingRight: 4,
                }}
              >
                {formatHour(h)}
              </Text>
            ))}
          </View>

          {/* Day columns */}
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + dayIndex);
            const dateString = dayDate.toISOString().split("T")[0];

            return (
              <View
                key={dayIndex}
                style={{
                  flex: 1,
                  borderLeftWidth: 1,
                  borderColor: "#e5e5e5",
                  position: "relative",
                }}
              >
                {hours.map((h) => (
                  <View
                    key={h}
                    style={{
                      height: HOUR_HEIGHT,
                      borderBottomWidth: 1,
                      borderColor: "#eee",
                    }}
                  />
                ))}

                {events
                  .filter((e) => e.start?.dateTime?.startsWith(dateString))
                  .map((e, i) => {
                    const start = new Date(e.start.dateTime);
                    const top =
                      start.getHours() * HOUR_HEIGHT +
                      (start.getMinutes() * HOUR_HEIGHT) / 60;

                    return (
                      <View
                        key={i}
                        style={{
                          position: "absolute",
                          top,
                          left: 4,
                          right: 4,
                          height: 40,
                          backgroundColor: "#dbeafe",
                          borderRadius: 6,
                          padding: 4,
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>{e.summary}</Text>
                      </View>
                    );
                  })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// --- MAIN COMPONENT ---
export default function Index() {
    // --- STATE ---
    const [data, setData] = useState<string>("");
    const [events, setEvents] = useState<any[]>([]);
    const [view, setView] = useState<"month" | "week">("month"); // month/week toggle
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // --- ASYNC STORAGE FUNCTIONS ---
    const displayProfile = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("profile");
        setData(jsonValue ?? "null");
        console.log(jsonValue ?? "null");
      } catch (err) {
        console.error(err);
      }
    };

    const displayAccessToken = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("access_token");
        setData(jsonValue ?? "null");
        console.log(jsonValue ?? "null");
      } catch (err) {
        console.error(err);
      }
    };

    const displayEvents = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("events");
        if (jsonValue) {
          const parsed = JSON.parse(jsonValue);
          setEvents(Array.isArray(parsed) ? parsed : parsed.items ?? []);
          setData(jsonValue);
        } else {
          setEvents([]);
          setData("null");
        }
      } catch (err) {
        console.error(err);
      }
    };

    // --- DISPLAY ---
    return (
      <View style={styles.container}>
        {/* --- VIEW TOGGLE BUTTONS --- */}
        <View style={styles.viewToggle}>
          <Pressable
            style={[styles.toggleBtn, view === "month" && styles.toggleActive]}
            onPress={() => setView("month")}
          >
            <Text>Month</Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, view === "week" && styles.toggleActive]}
            onPress={() => setView("week")}
          >
            <Text>Week</Text>
          </Pressable>
        </View>

        {/* --- MONTH NAVIGATION --- */}
        {view === "month" && (
          <View style={styles.monthHeader}>
            <Pressable onPress={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <Text style={styles.monthArrow}>‹</Text>
            </Pressable>

            <Text style={styles.monthTitle}>
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </Text>

            <Pressable onPress={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <Text style={styles.monthArrow}>›</Text>
            </Pressable>
          </View>
        )}

        {/* --- CALENDAR DISPLAY --- */}
        {view === "month" ? (
          <MonthView year={year} month={month} events={events} />
        ) : (
          <WeekView
            currentDate={currentDate}
            events={events}
            onChangeWeek={(newDate) => setCurrentDate(new Date(newDate))}
          />
        )}

        {/* --- DEBUG DATA --- */}
        <Text>{data}</Text>

        {/* --- LOAD EVENTS BUTTON --- */}
        <Pressable onPress={displayEvents} style={styles.btnPrimary}>
          <Text style={styles.btnText}>Load Events</Text>
        </Pressable>
      </View>
    );
  }

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    paddingBottom: 50,
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
});
