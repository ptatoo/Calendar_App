import { useCallback, useEffect, useState } from "react";
import { fetchCalendar } from "../services/api";
import { storage } from "../services/storage";

export function useCalendar(accessToken: string | null) {
  const [events, setEvents] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      //Fetch from Backend
      const data = await fetchCalendar(accessToken);
      console.log("calendar fetcing clled");

      //Update State & Local Storage
      setEvents(data);
      storage.save("calendar", data);
      
    } catch (err: any) {
      console.error("Google Calendar Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Automatically fetch when the token changes
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return { events, isLoading, error, refetch : fetchUserEvents };
}