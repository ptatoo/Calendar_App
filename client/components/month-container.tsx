import { useDate } from "@/hooks/useDate";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlatList as RoundList } from "react-native-bidirectional-infinite-scroll";

const WeekBox = ({ day }: { day: Date[] }) => {
  return (
    <View>
      <Text>bruh</Text>
    </View>
  );
};

export default function MonthContainer() {
  const { days: today, refetch: refetchToday } = useDate(0, 2);
  const [firstDay, setFirstDay] = useState(new Date());
  const { days: month, refetch: refetchMonth } = useDate(0, 0);
  const [weeks, setWeeks] = useState([new Date()]);

  useEffect(() => {
    if (today && today.length != 0) {
      setFirstDay(
        new Date(today[0].date.getFullYear(), today[0].date.getMonth(), 1),
      );
      const lstDay = new Date(
        today[0].date.getFullYear(),
        today[0].date.getMonth() + 1,
        0,
      );
      refetchMonth(
        -1 * today[0].date.getDate() + 1,
        lstDay.getDate() - today[0].date.getDate() + 2,
      );
      for (let i = 0; i < month.length; i++) {}
    }
  }, [today]);

  console.log(month);
  const renderWeek = ({ item }: { item: { date: Date } }) => {
    return <WeekBox day={[item.date]} />;
  };

  return (
    <View>
      <Text>bruh</Text>
      <RoundList
        style={styles.monthContainer}
        data={month}
        onStartReached={async () => {}}
        onEndReached={async () => {}}
        renderItem={renderWeek}
      ></RoundList>
    </View>
  );
}

const styles = StyleSheet.create({
  monthContainer: {
    flexDirection: "column",
    flex: 1,
  },
});
