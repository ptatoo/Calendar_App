import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

//index thing
export default function Index() {
  let [token, setToken] = useState("");
  let [data, setData] = useState([]);
  const route = useRoute();

  //uses fetchData, processes raw Data into an array of objects

  return (
    <View style={styles.homepg}>
      <View style={styles.header}>
        <Text>Calendar</Text>
      </View>
      <View style={styles.calenderContainer}>
        <View style={styles.dayOfWeek}>
          <Text style={styles.dayOfWeekTimeZone}>PST</Text>
          <Text style={styles.dayOfWeekItem}>Mon</Text>
          <Text style={styles.dayOfWeekItem}>Tues</Text>
          <Text style={styles.dayOfWeekItem}>Wed</Text>
        </View>
        <ScrollView alwaysBounceVertical={true} style={styles.calendarGrid}>
          {data.map((item: any, index) => (
            <View key={index}>
              <Text>{item.evt.summary || "No Title"}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "white",
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F68BA2",
    gap: 10,
  },
  calenderContainer: {
    flex: 5,
    flexDirection: "column",
  },
  dayOfWeek: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderColor: "lightgrey",
    borderBottomWidth: 1,
    gap: 1,
  },
  dayOfWeekTimeZone: {
    flex: 1,
    textAlign: "center",
    borderColor: "lightgrey",
  },
  dayOfWeekItem: {
    flex: 3,
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: "lightgrey",
  },
  calendarGrid: {},
});
