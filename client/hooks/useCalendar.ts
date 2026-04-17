import { processCalendar } from "@/utility/eventUtils";
import { CalendarData, calendarObj, FamilyCalendarState, sharedObj } from "@/utility/types";
import { useCallback, useEffect, useState } from "react";
import { fetchCalendarList, fetchGivenCalendar, getCalendarSharingSettings, shareCalendar } from "../services/api";
import { storage } from "../services/storage";
import { useAccessToken } from "./useAccessToken";
import { useProfiles } from "./useProfile";

//given the JWT: does the following:
//fetches parent calendar List
//fetches parent and child calendar events
//returns them
//used by the eventContext to store globally
export function useCalendar(jwtToken: string | null) {
  // 1. States
  const { getValidAccessToken } = useAccessToken(jwtToken);
  const { familyProfiles } = useProfiles(jwtToken);
  const [calendarIds, setNewCalendarIds] = useState<calendarObj[]>([]);
  const [calendars, setCalendars] = useState<FamilyCalendarState | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharedObjs, setSharedObjs] = useState<sharedObj[]>([]);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await storage.get("calendar");
      if (stored) setCalendars(stored);
    };
    hydrate();
  }, []); // Empty = Mount only

  // 2. Fetch Events
  const fetchUserEvents = useCallback(async () => {
    if (!jwtToken) return;
    if (!familyProfiles) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // 2.1 Get a Guaranteed Valid Token (Waits for refresh if needed)
      const tokens = await getValidAccessToken();

      // 2.2 Fetch Parent Calendar List
      const calendarListRes = await fetchCalendarList(tokens.parent.accessToken);
      const parentCalendarsMetadata = calendarListRes.items || [];
      
      const parentCalendarObjs: calendarObj[] = [];
      const allSharedObjs: sharedObj[] = [];

      // 2.3 Fetch Parent Calendar Events
      const parentCalendarPromises = parentCalendarsMetadata.map(async (cal: any) => {
        if (cal.accessRole === 'owner') {
          const res = await getCalendarSharingSettings(cal.id, tokens.parent.accessToken);
          console.log(cal.id, cal.summary);
          console.log(res.items);
          const newSharedObj = {
            id: cal.id,
            name: cal.summary,
            sharedIds: res.items.map((item: any) => {
              return {id: item.id, accessRole: item.role};
            })
          } as sharedObj;
          allSharedObjs.push(newSharedObj);
        }

        // Create a CalendarObj and add it to List
        const newCalendarObj : calendarObj = 
        {
          calendarName: cal.summary,
          calendarId: cal.id,
          calendarDefaultColor: cal.backgroundColor || "#4285F4",
          calendarCustomColor: cal.backgroundColor || "#4285F4",
          shown: true,
          owner: cal.accessRole === 'owner',
        };
        parentCalendarObjs.push(newCalendarObj);
        // Fetch event and add it to list (referencing the previous calendar Obj)
        
        const rawEvents = await fetchGivenCalendar(tokens.parent.accessToken, cal.id, cal.primary );

        return {
          id: cal.id,
          owner: cal.dataOwner,
          name: cal.summary,
          color: cal.backgroundColor || "#4285F4",
          events: processCalendar(rawEvents, cal.id, cal.summary, newCalendarObj)
        } as CalendarData;
      });

      const allParentCalendars = await Promise.all(parentCalendarPromises);


      // 2.7 Combine for final state
      const formattedFamilyCalendars: FamilyCalendarState = { parent: allParentCalendars, children: [] };
      
      const allCalendars = [...parentCalendarObjs ];

      // 2.8 Update State & Local Storage
      setCalendars(formattedFamilyCalendars);
      setNewCalendarIds(allCalendars);
      setSharedObjs(allSharedObjs);
      storage.save("calendar", formattedFamilyCalendars);

      
      shareCalendar('alexsong6@g.ucla.edu', 'i.alexander.song@gmail.com', tokens.parent.accessToken);
      
    } catch (err: any) {
      console.error("Google Calendar Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, getValidAccessToken, familyProfiles]);

  const fetchingCalendarList = useCallback(async () : Promise<calendarObj[]> => {
    if (!jwtToken) return[] as calendarObj[];
    
    setIsLoading(true);
    setError(null);

    try {
      // 2.1 Get a Guaranteed Valid Token (Waits for refresh if needed)
      const tokens = await getValidAccessToken();

      // 2.2 Fetch Parent Calendar List
      const calendarListRes = await fetchCalendarList(tokens.parent.accessToken);
      const parentCalendarsMetadata = calendarListRes.items || [];
      const allSharedObjs: sharedObj[] = [];
      
      // Fetch Calendar Lists
      // Create SharedObjs
      const parentCalendarPromises = parentCalendarsMetadata.map(async (cal: any) => {
        //if we own the calendar, keep track of sharing status
        if (cal.accessRole === 'owner') {
          const res = await getCalendarSharingSettings(cal.id, tokens.parent.accessToken);
          console.log(cal.id, cal.summary);
          console.log(res.items);
          const newSharedObj = {
            id: cal.id,
            name: cal.summary,
            sharedIds: res.items.map((item: any) => {
              return {id: item.id, accessRole: item.role};
            })
          } as sharedObj;
          allSharedObjs.push(newSharedObj);
        }

        // Create a CalendarObj return
        return {
          calendarName: cal.summary,
          calendarId: cal.id,
          calendarDefaultColor: cal.backgroundColor || "#4285F4",
          calendarCustomColor: cal.backgroundColor || "#4285F4",
          shown: true,
          owner: cal.accessRole === 'owner',
        } as calendarObj;
      });

      //update states
      const parentCalendarObjs: calendarObj[] = await Promise.all(parentCalendarPromises);
      setNewCalendarIds(parentCalendarObjs);
      setSharedObjs(allSharedObjs);
      return parentCalendarObjs;

    } catch (err: any) {
      console.error("Google Calendar List Fetch Error:", err);
      setError(err.message);
      return [] as calendarObj[];
    } finally {
      setIsLoading(false);
    }

  }, [jwtToken, getValidAccessToken])

  const fetchEventsForCalendars = useCallback(async (targetCalendars: calendarObj[]) => {
    if (!jwtToken) return;
    setIsLoading(true);
    setError(null);

    try {
      const tokens = await getValidAccessToken();
      
      const eventPromises = targetCalendars.map(async (cal: any) => {
        const rawEvents = await fetchGivenCalendar(tokens.parent.accessToken, cal.calendarId, cal.primary);
        
        return {
          id: cal.calendarId,
          name: cal.calendarName,
          color: cal.calendarDefaultColor || "#4285F4",
          events: processCalendar(rawEvents, cal.calendarId, cal.calendarName, cal)
        } as CalendarData;
      });

      const allEvents = await Promise.all(eventPromises);
      const newState: FamilyCalendarState = { parent: allEvents, children: [] };
      
      setCalendars(newState);
      storage.save("calendar", newState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, getValidAccessToken]);

  // 3. The Coordinator (The "Main" function)
  const initCalendarData = useCallback(async () => {
    const metaData = await fetchingCalendarList();
    if (metaData.length > 0) {
      await fetchEventsForCalendars(metaData);
    }
  }, [fetchingCalendarList, fetchEventsForCalendars]);


  // Automatic fetch when the token changes since we use useCallback
  useEffect(() => {
    fetchingCalendarList();
    fetchUserEvents();
  }, [fetchUserEvents]);

  return { calendars, newCalendarIds: calendarIds, isLoading, error, refetch : fetchUserEvents };
}