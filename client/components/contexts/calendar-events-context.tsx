// events-context.tsx
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useProfiles } from '@/hooks/useProfile';
import { calendarObj, EventObj, FamilyProfileObjs } from '@/utility/types';
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';

export interface EventsContextType {
  calendarObjs: calendarObj[] | null;
  allEvents: EventObj[];
  familyProfiles: FamilyProfileObjs | null;
  isLoading: boolean;
  groupedCalendars: { id: string; calendars: calendarObj[] }[];
  setCalendarObj: Dispatch<SetStateAction<calendarObj[] | null>>;
  updateSingleGroup: (groupId: string, newCalendars: calendarObj[]) => void;
  updateMultipleGroups: (updates: { groupId: string; newCalendars: calendarObj[] }[]) => void;
  deleteEvent: (event: EventObj) => Promise<any>;
  createEvent: (event: EventObj) => Promise<any>;
  editEvent: (event: EventObj) => Promise<any>;
  isWriting: boolean;
  writeError: string | null;
}

export const EventsContext = createContext<EventsContextType>({} as EventsContextType);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);
  const { jwtToken } = useAuth();
  const sessionTokenString = jwtToken?.sessionToken ?? null;
  const { familyProfiles } = useProfiles(sessionTokenString);
  const { calendars, newCalendarIds, isLoading } = useCalendar(sessionTokenString);
  const { editEvent, createEvent, deleteEvent, loading: isWriting, error: writeError } = useCalendarWrite(sessionTokenString);
  const [timeZone, setTimeZone] = useState<number>(0);

  useEffect(() => {
    if (newCalendarIds?.length) setCalendarObj(newCalendarIds);
  }, [newCalendarIds]);

  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];
    const visibleIds = new Set(calendarObjs.filter((c) => c.shown).map((c) => c.calendarId));

    // Only map parent array, ignore deprecated children
    return (calendars.parent || []).filter((cal) => visibleIds.has(cal.id)).flatMap((cal) => cal.events);
  }, [calendars, calendarObjs]);

  // -------------------------------------------
  // calendar groups
  // -------------------------------------------
  const [groupedCalendars, setGroupedCalendars] = useState<{ id: string; calendars: calendarObj[] }[]>([]);

  //add new calendarObjs to either "owner" or "other" group
  useEffect(() => {
    if (!calendarObjs) return;

    const initialGroups = calendarObjs.reduce(
      (groups, cal) => {
        const type = cal.owner ? 'owner' : 'other';
        let group = groups.find((g) => g.id === type);

        if (!group) {
          group = { id: type, calendars: [] };
          groups.push(group);
        }

        group.calendars.push(cal);
        return groups;
      },
      [] as { id: string; calendars: calendarObj[] }[],
    );

    setGroupedCalendars(initialGroups);
  }, [calendarObjs]);

  const updateSingleGroup = (groupId: string, newCalendars: calendarObj[]) => {
    setGroupedCalendars((prev) => prev.map((group) => (group.id === groupId ? { ...group, calendars: newCalendars } : group)));
  };

  const updateMultipleGroups = (updates: { groupId: string; newCalendars: calendarObj[] }[]) => {
    setGroupedCalendars((prev) => {
      const updatesMap = new Map(updates.map((u) => [u.groupId, u.newCalendars]));

      return prev.map((group) => (updatesMap.has(group.id) ? { ...group, calendars: updatesMap.get(group.id)! } : group));
    });
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
