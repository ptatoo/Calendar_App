//custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { calendarObj, EventObj } from '@/utility/types'; // Adjust path as needed
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';

export interface EventsContextType {
  // Read state
  calendarObjs: calendarObj[] | null;
  allEvents: EventObj[];
  isLoading: boolean;
  groupedCalendars: {
    id: string;
    calendars: calendarObj[];
  }[];
  moveCalendar: (calendarId: string, targetGroupId: string) => void;
  setCalendarObj: Dispatch<SetStateAction<calendarObj[] | null>>;

  // Write state
  createEvent: (eventDetails: any) => Promise<any>;
  isWriting: boolean;
  writeError: string | null;
}

// 2. Add defaults to createContext
export const EventsContext = createContext<EventsContextType>({
  calendarObjs: null,
  allEvents: [],
  isLoading: false,
  setCalendarObj: () => {},
  groupedCalendars: [],
  moveCalendar: () => {},
  createEvent: async () => {}, // Added
  isWriting: false, // Added
  writeError: null, // Added
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);
  //fetch a crazy amount of data from everywhere
  const { jwtToken } = useAuth();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  const { calendars, newCalendarIds, isLoading } = useCalendar(sessionTokenString);
  const [groupedCalendars, setGroupedCalendars] = useState<{ id: string; calendars: calendarObj[] }[]>([]);

  //write functionality
  const { createEvent, loading: isWriting, error: writeError } = useCalendarWrite(sessionTokenString);

  //update calendarObjs (list of calendars)
  useEffect(() => {
    if (newCalendarIds && newCalendarIds.length > 0) {
      setCalendarObj(newCalendarIds);
    }
  }, [newCalendarIds]);

  // process and store calendar events (only keeping visible calendars)
  const allEvents = useMemo(() => {
    if (!sessionTokenString || !calendars || !calendarObjs) return [];

    const combined = [...(calendars.parent || []), ...(calendars.children || [])];
    const visibleIds = calendarObjs.filter((c) => c.shown).map((c) => c.calendarId);

    return combined.filter((cal) => visibleIds.includes(cal.id)).flatMap((cal) => cal.events);
  }, [sessionTokenString, calendars, calendarObjs]);

  //update groupedCalendars
  useEffect(() => {
    if (!calendarObjs) return;

    setGroupedCalendars((prevGroups) => {
      // Find Existing and New Calendars
      const existingIds = new Set(prevGroups.flatMap((group) => group.calendars.map((c) => c.calendarId)));
      const newCalendars = calendarObjs.filter((cal) => !existingIds.has(cal.calendarId));
      if (newCalendars.length === 0) return prevGroups;

      //Create a fresh copy of the groups
      const nextGroups = [...prevGroups];

      // Helper to find or create a group by ID
      const ensureGroup = (id: string) => {
        let group = nextGroups.find((g) => g.id === id);
        if (!group) {
          group = { id, calendars: [] };
          nextGroups.push(group);
        }
        return group;
      };

      //Distribute new calendars
      newCalendars.forEach((cal) => {
        const isOwner = cal.owner;
        const targetGroupId = isOwner ? 'owner' : 'other';

        const targetGroup = ensureGroup(targetGroupId);
        targetGroup.calendars.push(cal);
      });

      return nextGroups;
    });
  }, [calendarObjs]);

  const moveCalendar = (calendarId: string, targetGroupId: string) => {
    setGroupedCalendars((prev) => {
      // 1. Find the calendar in the current groups and remove it
      let calendarToMove: calendarObj | undefined;
      const cleanedGroups = prev.map((group) => {
        const filtered = group.calendars.filter((c) => {
          if (c.calendarId === calendarId) {
            calendarToMove = c;
            return false;
          }
          return true;
        });
        return { ...group, calendars: filtered };
      });

      // 2. Add it to the target group
      if (calendarToMove) {
        return cleanedGroups.map((group) => {
          if (group.id === targetGroupId) {
            return { ...group, calendars: [...group.calendars, calendarToMove!] };
          }
          return group;
        });
      }
      return prev;
    });
  };

  return (
    <EventsContext.Provider
      value={{
        calendarObjs,
        setCalendarObj,
        allEvents,
        isLoading,
        groupedCalendars,
        moveCalendar,
        createEvent,
        isWriting,
        writeError,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
