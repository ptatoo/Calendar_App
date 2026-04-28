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

  useEffect(() => {
    if (newCalendarIds?.length) setCalendarObj(newCalendarIds);
  }, [newCalendarIds]);

  const allEvents = useMemo(() => {
    if (!calendars || !calendarObjs) return [];
    const visibleIds = new Set(calendarObjs.filter(c => c.shown).map(c => c.calendarId));
    
    // Only map parent array, ignore deprecated children
    return (calendars.parent || [])
      .filter(cal => visibleIds.has(cal.id))
      .flatMap(cal => cal.events);
  }, [calendars, calendarObjs]);

  const groupedCalendars = useMemo(() => {
    if (!calendarObjs) return [];
    return calendarObjs.reduce((groups, cal) => {
      const type = cal.owner ? 'owner' : 'other';
      let group = groups.find(g => g.id === type);
      if (!group) groups.push(group = { id: type, calendars: [] });
      group.calendars.push(cal);
      return groups;
    }, [] as { id: string; calendars: calendarObj[] }[]);
  }, [calendarObjs]);

  const updateSingleGroup = (groupId: string, newCalendars: calendarObj[]) => {
    setCalendarObj(prev => !prev ? null : prev.map(c => newCalendars.find(n => n.calendarId === c.calendarId) || c));
  };

  const updateMultipleGroups = (updates: { groupId: string; newCalendars: calendarObj[] }[]) => {
    const flatUpdates = updates.flatMap(u => u.newCalendars);
    setCalendarObj(prev => !prev ? null : prev.map(c => flatUpdates.find(n => n.calendarId === c.calendarId) || c));
  };

  return (
    <EventsContext.Provider value={{ calendarObjs, setCalendarObj, allEvents, familyProfiles, isLoading, groupedCalendars, updateSingleGroup, updateMultipleGroups, deleteEvent, createEvent, editEvent, isWriting, writeError }}>
      {children}
    </EventsContext.Provider>
  );
};