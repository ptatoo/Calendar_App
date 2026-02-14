import { useDate } from "@/hooks/useDate";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function MonthContainer() {
  const { days: today, refetch: refetchToday } = useDate(0, 2);
  const [firstDay, setFirstDay] = useState(new Date());
  const [lastDay, setLastDay] = useState(new Date());
  const { days: month, refetch: refetchMonth } = useDate(0, 0);

  useEffect(() => {
    if (today && today.length != 0) {
      setFirstDay(
        new Date(today[0].date.getFullYear(), today[0].date.getMonth(), 1),
      );
      setLastDay(
        new Date(today[0].date.getFullYear(), today[0].date.getMonth() + 1, 0),
      );
    }
    if (today && today.length != 0 && lastDay) {
      console.log("here");
      refetchMonth(
        -1 * today[0].date.getDate() + 1,
        lastDay.getDay() - today[0].date.getDate(),
      );
    }
  }, [today]);

  console.log(month);
  //const grid = getMonthGrid(today.getFullYear(), today.getMonth());

  return <View></View>;
}
