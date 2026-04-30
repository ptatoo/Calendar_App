// hooks/useEventGrouping.ts
import { EventObj, EventWithOffset } from '@/utility/types';
import { useMemo } from 'react';

export const useEventGrouping = (events: EventObj[]) => {
  return useMemo(() => {
    const timed: Record<string, EventObj[]> = {};
    const allDay: Record<string, EventObj[]> = {};
    const timedWithLayout: Record<string, EventWithOffset[]> = {};
    
    events.forEach((e) => {
      // Opt for string splitting or lightweight parsing if startDate is ISO string
      const dateKey = new Date(e.startDate).toDateString(); 
      const isAllDay = e.allDay === true || String(e.allDay) === 'true';
    
      if (isAllDay) {
        //all day events added to allDay Record
        if (!allDay[dateKey]) allDay[dateKey] = [];
        allDay[dateKey].push(e);
      } else {
        //timed events added to timedRecord
        const dateKey = new Date(e.startDate).toDateString();
        if (!timed[dateKey]) timed[dateKey] = [];
        timed[dateKey].push(e);
      }
    });

    Object.keys(timed).forEach((dateKey) => {
      const dayEvents = timed[dateKey];
      
      // Sort this specific day's events chronologically
      const sortedDayEvents = dayEvents.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const resultsForDay: EventWithOffset[] = [];

      sortedDayEvents.forEach((currentEvent) => {
        // Find overlaps only within this specific day
        const overlappingEvents = resultsForDay.filter((placed) => {
          return (
            new Date(currentEvent.startDate).getTime() < new Date(placed.event.endDate).getTime() &&
            new Date(currentEvent.endDate).getTime() > new Date(placed.event.startDate).getTime()
          );
        });

        const occupiedOffsets = overlappingEvents.map((e) => e.offset);
        let firstFreeOffset = 0;
        while (occupiedOffsets.includes(firstFreeOffset)) {
          firstFreeOffset++;
        }

        resultsForDay.push({
          event: currentEvent,
          offset: firstFreeOffset,
        });
      });

      timedWithLayout[dateKey] = resultsForDay;
    });

    return { groupedTimedEvents: timedWithLayout, groupedAllDayEvents: allDay };
  }, [events]);
};

