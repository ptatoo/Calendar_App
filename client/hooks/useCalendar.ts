import { processCalendar } from "@/utility/eventUtils";
import { CalendarData, FamilyCalendarState } from "@/utility/types";
import { useCallback, useEffect, useState } from "react";
import { fetchCalendarList, fetchGivenCalendar } from "../services/api";
import { storage } from "../services/storage";
import { useAccessToken } from "./useAccessToken";

export function useCalendar(jwtToken: string | null) {
  // 1. States
  const { getValidAccessToken } = useAccessToken(jwtToken);

  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(() => {
    return storage.get("calendar") || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Fetch Events
  const fetchUserEvents = useCallback(async () => {
    if (!jwtToken) return;
    setIsLoading(true);
    setError(null);

    try {
      // 2.1 Get a Guaranteed Valid Token (Waits for refresh if needed)
      const tokens = await getValidAccessToken();

      // 2.2 Fetch Calendar List
      const calendarListRes = await fetchCalendarList(tokens.parent.accessToken);
      const parentCalendarsMetadata = calendarListRes.items || [];

      // 2.3 Fetch Parent Calendars
      const parentCalendarPromises = parentCalendarsMetadata.map(async (cal: any) => {
        const rawEvents = await fetchGivenCalendar(tokens.parent.accessToken, cal.id, cal.primary );

        return {
          id: cal.id,
          owner: tokens.parent.email,
          name: cal.summary,
          color: cal.backgroundColor || "#4285F4", // Use Google's color or fallback blue
          events: processCalendar(rawEvents, cal.id, cal.backgroundColor || "#4285F4")
        } as CalendarData;
      });

      const allParentCalendars = await Promise.all(parentCalendarPromises);

      // 2.4 Handle Children (just their primary)
      const childPromises = (tokens.children || []).map(async (token: any) => {
        const childRaw = await fetchGivenCalendar(token.accessToken, "primary");
        return {
          id: "primary",
          owner: childRaw.summary,
          name: "Child Calendar",
          color: "#34A853",
          events: processCalendar(childRaw, "primary", "#34A853") // Using your original processCalendar
        } as CalendarData;
      });

      const allChildCalendars = await Promise.all(childPromises);

      // 2.4 Combine for final state
      const formattedFamilyCalendars: FamilyCalendarState = {
        // Option A: If your UI expects 1 parent object, pick the first one (primary)
        parent: allParentCalendars,
        children: allChildCalendars,
      };

      // 2.5 Update State & Local Storage
      setCalendars(formattedFamilyCalendars);
      storage.save("calendar", formattedFamilyCalendars);
      
    } catch (err: any) {
      console.error("Google Calendar Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken, getValidAccessToken]);

  // 3. Automatically fetch when the token changes
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return { calendars, isLoading, error, refetch : fetchUserEvents };
}