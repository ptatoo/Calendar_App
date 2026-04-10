//custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useProfiles } from '@/hooks/useProfile';
import { calendarObj, EventObj, FamilyProfileObjs } from '@/utility/types'; // Adjust path as needed
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';

export interface EventsContextType {
  // Read state
  calendarObjs: calendarObj[] | null;
  allEvents: EventObj[];
  familyProfiles: FamilyProfileObjs | null;
  isLoading: boolean;
  groupedCalendars: {
    id: string;
    calendars: calendarObj[];
  }[];
  setCalendarObj: Dispatch<SetStateAction<calendarObj[] | null>>;
  updateSingleGroup: (groupId: string, newCalendars: calendarObj[]) => void;
  updateMultipleGroups: (
    updates: {
      groupId: string;
      newCalendars: calendarObj[];
    }[],
  ) => void;

  // Write state
  deleteEvent: (event: EventObj) => Promise<any>;
  createEvent: (event: EventObj) => Promise<any>;
  editEvent: (event: EventObj) => Promise<any>;
  isWriting: boolean;
  writeError: string | null;
}

// 2. Add defaults to createContext
export const EventsContext = createContext<EventsContextType>({
  calendarObjs: null,
  allEvents: [],
  familyProfiles: null,
  isLoading: false,
  setCalendarObj: () => {},
  groupedCalendars: [],
  updateSingleGroup: () => {},
  updateMultipleGroups: () => {},
  deleteEvent: async () => {}, // Added
  createEvent: async () => {}, // Added
  editEvent: async () => {}, // Added
  isWriting: false, // Added
  writeError: null, // Added
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);
  //fetch a crazy amount of data from everywhere
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  const { calendars, newCalendarIds, isLoading } = useCalendar(sessionTokenString);
  const [groupedCalendars, setGroupedCalendars] = useState<{ id: string; calendars: calendarObj[] }[]>([]);

  //write functionality
  const { editEvent, createEvent, deleteEvent, loading: isWriting, error: writeError } = useCalendarWrite(sessionTokenString);

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
        let targetGroupId = isOwner ? 'owner' : 'other';
        if (cal.calendarName === 'alexsong6@g.ucla.edu') targetGroupId = 'primary';

        const targetGroup = ensureGroup(targetGroupId);
        targetGroup.calendars.push(cal);
      });

      return nextGroups;
    });
  }, [calendarObjs]);

  const updateSingleGroup = (groupId: string, newCalendars: calendarObj[]) => {
    setGroupedCalendars((prev) => prev.map((group) => (group.id === groupId ? { ...group, calendars: newCalendars } : group)));
  };

  const updateMultipleGroups = (updates: { groupId: string; newCalendars: calendarObj[] }[]) => {
    setGroupedCalendars((prev) =>
      prev.map((group) => {
        // Find if there is an update for this specific group
        const update = updates.find((u) => u.groupId === group.id);

        // If an update exists, return the new calendars, otherwise return the group as is
        return update ? { ...group, calendars: update.newCalendars } : group;
      }),
    );
  };

  return (
    <EventsContext.Provider
      value={{
        calendarObjs,
        setCalendarObj,
        allEvents,
        familyProfiles,
        isLoading,
        groupedCalendars,
        updateSingleGroup,
        updateMultipleGroups,
        deleteEvent,
        createEvent,
        editEvent,
        isWriting,
        writeError,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
