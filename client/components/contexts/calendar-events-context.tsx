//custom hooks
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useCalendarWrite } from '@/hooks/useCalendarWrite';
import { useProfiles } from '@/hooks/useProfile';
import { calendarObj, EventObj, ProfileObj } from '@/utility/types'; // Adjust path as needed
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';

export interface EventsContextType {
  // Read state
  calendarObjs: calendarObj[] | null;
  allEvents: EventObj[];
  isLoading: boolean;
  groupedData: {
    id: string;
    profile: ProfileObj;
    calendars: calendarObj[];
  }[];
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
  groupedData: [],
  createEvent: async () => {}, // Added
  isWriting: false, // Added
  writeError: null, // Added
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);
  //fetch a crazy amount of data from everywhere
  const { jwtToken } = useAuth();
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  const { familyProfiles } = useProfiles(sessionTokenString);
  const { calendars, newCalendarIds, isLoading } = useCalendar(sessionTokenString);

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

  const groupedData = useMemo(() => {
    if (!familyProfiles || !calendarObjs) return [];

    // Map parent calendars with parent profile
    const ownerGroup = {
      profile: 'owner',
      calendars: calendarObjs.filter((cal) => cal.owner === true),
    };
    const readGroup = {
      profile: 'other',
      calendars: calendarObjs.filter((cal) => cal.owner === false),
    };
    return [
      {
        id: `owner-${familyProfiles.parent.id}`, // Unique Key 1
        profile: familyProfiles.parent,
        calendars: ownerGroup.calendars,
      },
      {
        id: `read-${familyProfiles.parent.id}`, // Unique Key 2
        profile: familyProfiles.parent,
        calendars: readGroup.calendars,
      },
    ];
  }, [familyProfiles, calendarObjs]);

  return (
    <EventsContext.Provider
      value={{
        calendarObjs,
        setCalendarObj,
        allEvents,
        isLoading,
        groupedData,
        createEvent,
        isWriting,
        writeError,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
