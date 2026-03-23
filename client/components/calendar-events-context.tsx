import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { calendarObj, EventsContextType } from '@/utility/types';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

export const EventsContext = createContext<EventsContextType>({
  calendarObjs: null,
  allEvents: [],
  isLoading: false,
  setCalendarObj: () => {},
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const { jwtToken } = useAuth(); // Access auth here
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);

  // fetch all calendar data from google api
  const { calendars, newCalendarIds, isLoading } = useCalendar(jwtToken?.sessionToken ?? null);

  //update calendarObjs (list of calendars)
  useEffect(() => {
    if (newCalendarIds && newCalendarIds.length > 0) {
      setCalendarObj(newCalendarIds);
    }
  }, [newCalendarIds]);

  // process calendar data (only keeping visible calendars)
  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];

    const combined = [...(calendars.parent || []), ...(calendars.children || [])];
    const visibleIds = calendarObjs.filter((c) => c.shown).map((c) => c.calendarId);

    return combined.filter((cal) => visibleIds.includes(cal.id)).flatMap((cal) => cal.events);
  }, [calendars, calendarObjs]);

  return <EventsContext.Provider value={{ calendarObjs, setCalendarObj, allEvents, isLoading }}>{children}</EventsContext.Provider>;
};
