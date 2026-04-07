// hooks/calendarHooks/useCalendarRange.ts
import { FUTURE_BUFFER, PAST_BUFFER } from '@/utility/constants';
import { addDays, startOfDay, subDays } from 'date-fns';
import { useMemo } from 'react';

export const useCalendarRange = () => {
  // 1. Generate one massive array ONCE.
  // No state updates, no re-renders, no stutter.
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, PAST_BUFFER);
    const end = addDays(today, FUTURE_BUFFER);
    const range = [];
    let current = start;
    while (current.getTime() <= end.getTime()) {
      range.push({ date: current });
      current = addDays(current, 1);
    }
    return range;
  }, []);

  return { days, initialIndex: PAST_BUFFER };
};