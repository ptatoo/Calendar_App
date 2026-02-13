import MultiDayContainer from "@/components/multiDayContainer";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AuthContext } from "./context";

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const [data, setData] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const { calendarType, setCalendarType } = useContext(AuthContext);

  useEffect(() => {
    console.log("Type changed to:", calendarType);
  }, [calendarType]);

  // --- DISPLAY ---
  return (
    <View style={{ flex: 1 }}>
      {(calendarType === "3" ||
        calendarType === "2" ||
        calendarType === "1") && (
        <MultiDayContainer calendarType={calendarType} />
      )}
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({});
