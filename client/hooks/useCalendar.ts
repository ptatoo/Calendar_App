import { processCalendar } from "@/utility/eventUtils";
import { CalendarData, FamilyCalendarState } from "@/utility/types";
import { useCallback, useEffect, useState } from "react";
import { fetchCalendar } from "../services/api";
import { storage } from "../services/storage";
import { useAccessToken } from "./useAccessToken";

export function useCalendar(jwtToken: string | null) {
  const { getValidAccessToken } = useAccessToken(jwtToken);

  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(() => {
    return storage.get("calendar") || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = useCallback(async () => {
    if (!jwtToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // 2. Get a Guaranteed Valid Token (Waits for refresh if needed)
      const tokens = await getValidAccessToken();
      
      const parentData = await fetchCalendar(tokens.parent.accessToken);
      const processedParentData = processCalendar(parentData);

      const formattedParentCalendar : CalendarData = {
        owner: parentData.summary, // email
        name: parentData.summary,
        color: "#00000000",
        events: processedParentData
      }

      const childPromises = (tokens.children || []).map(async (token : any) => {
        const childRaw = await fetchCalendar(token.accessToken);
        
        // Return the formatted object
        const formattedChild: CalendarData = {
          owner: childRaw.summary, // Ensure this uses child data
          name: childRaw.summary,
          color: "#34A853",        // Green for Children (or dynamic)
          events: processCalendar(childRaw)
        };
        
        return formattedChild;
      });

      // Wait for all children to finish fetching
      const formattedChildrenCalendars = await Promise.all(childPromises);

      const formattedFamilyCalendars : FamilyCalendarState = {
        parent : formattedParentCalendar,
        children : formattedChildrenCalendars,
      }
      //Update State & Local Storage
      setCalendars(formattedFamilyCalendars);
      storage.save("calendar", formattedFamilyCalendars);
      
    } catch (err: any) {
      console.error("Google Calendar Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, getValidAccessToken]);

  // Automatically fetch when the token changes
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return { calendars, isLoading, error, refetch : fetchUserEvents };
}