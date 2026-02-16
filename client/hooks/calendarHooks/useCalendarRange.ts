// hooks/useCalendarRange.ts
import { INIT_DAYS_LOADED, NEW_DAYS_LOADED } from '@/utility/constants';
import { useCallback, useRef, useState } from 'react';
import { useDate } from '../../hooks/calendarHooks/useDate'; // Your existing hook

export const useCalendarRange = () => {  
  //days generator
  const [startDay, setStartDay] = useState(INIT_DAYS_LOADED * -1);
  const [endDay, setEndDay] = useState(INIT_DAYS_LOADED);
  const { days, refetch } = useDate(startDay, endDay);
  const isUpdating = useRef(false);

  //load more events foward and backward
  const loadForward = useCallback(async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;
    try {
      const newEnd = endDay + NEW_DAYS_LOADED;
      setEndDay(newEnd);
      await refetch(startDay, newEnd);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } catch (error) {
    } finally {
      isUpdating.current = false;
    }
  }, [startDay, endDay, refetch]);

  const loadBackward = useCallback(async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;
    try {
      const newStart = startDay - NEW_DAYS_LOADED;
      setStartDay(newStart);
      await refetch(newStart, endDay);

      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } catch (error) {
    } finally {
      isUpdating.current = false;
    }
  }, [startDay, endDay, refetch]);

  return {
    loadBackward, loadForward, days
  };
}