import { processCalendar } from "@/utility/eventUtils";
import { CalendarData, calendarObj, FamilyCalendarState } from "@/utility/types";
import { useCallback, useEffect, useState } from "react";
import { fetchCalendarList, fetchGivenCalendar } from "../services/api";
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

  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(() => {
    return storage.get("calendar") || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // 2.3 Fetch Parent Calendar Events
      const parentCalendarPromises = parentCalendarsMetadata.map(async (cal: any) => {
        // Create a CalendarObj and add it to List
        const newCalendarObj : calendarObj = 
        {
          calendarName: cal.summary,
          calendarId: cal.id,
          calendarDefaultColor: cal.backgroundColor || "#4285F4",
          calendarCustomColor: cal.backgroundColor || "#4285F4",
          shown: true,
          ownerId: familyProfiles.parent.id
        };
        parentCalendarObjs.push(newCalendarObj);
        // Fetch event and add it to list (referencing the previous calendar Obj)
        const rawEvents = await fetchGivenCalendar(tokens.parent.accessToken, cal.id, cal.primary );

        return {
          id: cal.id,
          owner: cal.dataOwner,
          name: cal.summary,
          color: cal.backgroundColor || "#4285F4",
          events: processCalendar(rawEvents, cal.id, cal.backgroundColor || "#4285F4", tokens.parent.email, newCalendarObj)
        } as CalendarData;
      });

      const allParentCalendars = await Promise.all(parentCalendarPromises);

      // 2.4 Fetch metadata for ALL children
      const childrenMetadataPromises = (tokens.children || []).map(async (token: any) => {
        try {
          const res = await fetchCalendarList(token.accessToken);
          const items = res.items || [];
          
          // Return both the metadata and the token (we need the token for the event fetch)
          return { token, items };
        } catch (err) {
          console.error(`Failed to fetch calendar list for child ${token.id}`, err);
          return { token, items: [] };
        }
      });

      const childrenMetadataResults = await Promise.all(childrenMetadataPromises);
      const childrenCalendarObjs: calendarObj[] = [];

      // 2.5 Fetch every single calendar and event found across all children
      // 2.5.1 Flatmap all children
      const allChildEventPromises = childrenMetadataResults.flatMap(({ token, items }) => {
        // 2.5.2 Map through all children calendars
        return items.map(async (cal: any) => {
          // Add calendar to list of calendars
          const newCalendarObj: calendarObj = {
            calendarName: cal.summary,
            calendarId: cal.id,
            calendarDefaultColor: cal.backgroundColor || "#4285F4",
            calendarCustomColor: cal.backgroundColor || "#4285F4",
            shown: true,
            ownerId: token.id
          }
          childrenCalendarObjs.push(newCalendarObj);

          // Add event to list of Events
          const rawEvents = await fetchGivenCalendar(token.accessToken, cal.id, cal.primary);

          return {
            id: cal.id,
            owner: token.id, 
            name: cal.summary,
            color: cal.backgroundColor || "#34A853",
            events: processCalendar(rawEvents, cal.id, cal.backgroundColor || "#34A853", token.email, newCalendarObj)
          } as CalendarData;
        })
      });

      const allChildCalendars = await Promise.all(allChildEventPromises);

      // 2.7 Combine for final state
      const formattedFamilyCalendars: FamilyCalendarState = {
        parent: allParentCalendars,
        children: allChildCalendars,
      };
     
      const allCalendars = [...parentCalendarObjs, ...childrenCalendarObjs];

      // 2.8 Update State & Local Storage
      setCalendars(formattedFamilyCalendars);
      setNewCalendarIds(allCalendars);
      storage.save("calendar", formattedFamilyCalendars);
      
    } catch (err: any) {
      console.error("Google Calendar Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, getValidAccessToken, familyProfiles]);

  // 3. Automatically fetch when the token changes
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return { calendars, newCalendarIds: calendarIds, isLoading, error, refetch : fetchUserEvents };
}