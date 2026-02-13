import { useCallback, useEffect, useState } from "react";
import { fetchCalendar } from "../services/api";
import { storage } from "../services/storage";
import { useAccessToken } from "./useAccessToken";

export function useCalendar(jwtToken: string | null) {
  const { getValidAccessToken } = useAccessToken(jwtToken);

  const [events, setEvents] = useState<any>(() => {
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
      
      if (!tokens?.parent?.accessToken) {
        throw new Error("oopsie, parent accesstoken no exist");
      }

      const accessToken = tokens.parent.accessToken;

      //fetch google cal
      const data = await fetchCalendar(accessToken);

      //Update State & Local Storage
      setEvents(data);
      storage.save("calendar", data);
      
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

  return { events, isLoading, error, refetch : fetchUserEvents };
}