// hooks/useEventGrouping.ts
import { EventObj } from '@/utility/types';
import { useMemo } from 'react';

export const useEventGrouping = (events: EventObj[]) => {
  return useMemo(() => {
    const timed: Record<string, EventObj[]> = {};
    const allDay: Record<string, EventObj[]> = {};

    events.forEach((e) => {
      // Opt for string splitting or lightweight parsing if startDate is ISO string
      const dateKey = new Date(e.startDate).toDateString(); 
      const isAllDay = e.allDay === true || String(e.allDay) === 'true';

      const target = isAllDay ? allDay : timed;
      if (!target[dateKey]) target[dateKey] = [];
      target[dateKey].push(e);
    });

    return { groupedTimedEvents: timed, groupedAllDayEvents: allDay };
  }, [events]);
};

