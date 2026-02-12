import { useCallback, useMemo, useState } from "react";

export function useDate(startDay: number, endDay: number) {
  const [days, setDays] = useState<{date: Date}[]>([]);

  const updateDays = useCallback(() => {
    const newDays : {date: Date}[] = [];
    for (let i = startDay; i < endDay; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      newDays.push({ date });
    }
    setDays(newDays);

  }, [startDay, endDay]);

  // Automatically fetch when the token changes
  useMemo(() => {
    updateDays();
  }, [updateDays]);

  return days;
}