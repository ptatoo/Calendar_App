//custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useProfiles } from '@/hooks/useProfile';

import { calendarObj, EventsContextType } from '@/utility/types';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

export const EventsContext = createContext<EventsContextType>({
  calendarObjs: null,
  allEvents: [],
  isLoading: false,
  setCalendarObj: () => {},
  groupedData: [],
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);

  //fetch a crazy amount of data from everywhere
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const { calendars, newCalendarIds, isLoading } = useCalendar(jwtToken?.sessionToken ?? null);

  //update calendarObjs (list of calendars)
  useEffect(() => {
    if (newCalendarIds && newCalendarIds.length > 0) {
      setCalendarObj(newCalendarIds);
    }
  }, [newCalendarIds]);

  // process and store calendar events (only keeping visible calendars)
  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];

    const combined = [...(calendars.parent || []), ...(calendars.children || [])];
    const visibleIds = calendarObjs.filter((c) => c.shown).map((c) => c.calendarId);

    return combined.filter((cal) => visibleIds.includes(cal.id)).flatMap((cal) => cal.events);
  }, [calendars, calendarObjs]);

  const groupedData = useMemo(() => {
    if (!familyProfiles || !calendarObjs) return [];

    // Map parent calendars with parent profile
    const parentGroup = {
      profile: familyProfiles.parent,
      calendars: calendarObjs.filter((cal) => cal.ownerId === familyProfiles.parent.id),
    };

    // Map children calendars with children profile
    const childrenGroups = familyProfiles.children.map((child) => ({
      profile: child,
      calendars: calendarObjs.filter((cal) => cal.ownerId === child.id),
    }));

    return [parentGroup, ...childrenGroups];
  }, [familyProfiles, calendarObjs]);

  return (
    <EventsContext.Provider value={{ calendarObjs, setCalendarObj, allEvents, isLoading, groupedData }}>{children}</EventsContext.Provider>
  );
};
