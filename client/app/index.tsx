import MonthContainer from "@/components/month-container";
import MultiDayContainer from "@/components/multi-day-container";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AuthContext } from "./context";

import { useAuth } from "@/hooks/useAuth";
import { useCalendar } from "@/hooks/useCalendar";
import { useProfiles } from "@/hooks/useProfile";

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const [data, setData] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const calendarProps = useCalendar(jwtToken?.sessionToken ?? null);

  console.log(calendarProps.calendars);

  useEffect(() => {
    //auto updates calendar when it changes
    calendarProps.refetch();
    console.log(calendarProps.calendars);
    //console.log("Type changed to:", calendarType);
  }, [jwtToken]);

  // --- DISPLAY ---
  return (
    <View style={{ flex: 1 }}>
      {(calendarType === "3" ||
        calendarType === "2" ||
        calendarType === "1") && (
        <MultiDayContainer calendarType={calendarType} />
      )}

      {calendarType === "M" && <MonthContainer />}
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({});
