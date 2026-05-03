// useCalendar.ts
import { fetchCalendarList, fetchGivenCalendar, getCalendarSharingSettings } from "@/services/api";
import { storage } from "@/services/storage";
import { processCalendar } from "@/utility/eventUtils";
import { getValidAccessToken } from "@/utility/tokenUtils";
import { calendarObj, FamilyCalendarState, sharedObj } from "@/utility/types";
import { useCallback, useEffect, useState } from "react";

export function useCalendar(jwtToken: string | null) {
  const [calendars, setCalendars] = useState<FamilyCalendarState | null>(null);
  const [calendarIds, setCalendarIds] = useState<calendarObj[]>([]);
  const [sharedObjs, setSharedObjs] = useState<sharedObj[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { storage.get("calendar").then(c => c && setCalendars(c)); }, []);

  const fetchUserEvents = useCallback(async () => {
    if (!jwtToken) return;
    setIsLoading(true); setError(null);

    try {
      const tokens = await getValidAccessToken(jwtToken);
      const { items: parentCalendars = [] } = await fetchCalendarList(tokens.parent.accessToken);
      
      const parentCalendarObjs: calendarObj[] = [];
      const allSharedObjs: sharedObj[] = [];

      const parentCalendarPromises = parentCalendars.map(async (cal: any) => {
        if (cal.accessRole === 'owner') {
          const res = await getCalendarSharingSettings(cal.id, tokens.parent.accessToken);
          allSharedObjs.push({ id: cal.id, name: cal.summary, sharedIds: res.items?.map((i: any) => ({ id: i.id, accessRole: i.role })) || [] });
        }

        const newCalendarObj: calendarObj = {
          calendarName: cal.summary, calendarId: cal.id,
          calendarDefaultColor: cal.backgroundColor || "#4285F4",
          calendarCustomColor: cal.backgroundColor || "#4285F4",
          shown: true, owner: cal.accessRole === 'owner'
        };
        parentCalendarObjs.push(newCalendarObj);

        const rawEvents = await fetchGivenCalendar(tokens.parent.accessToken, cal.id, cal.primary);
        return { id: cal.id, owner: cal.dataOwner, name: cal.summary, color: newCalendarObj.calendarDefaultColor, events: processCalendar(rawEvents, cal.id, cal.summary, newCalendarObj) };
      });

      const allParentCalendars = await Promise.all(parentCalendarPromises);
      const newState: FamilyCalendarState = { parent: allParentCalendars, children: [] };

      setCalendars(newState); setCalendarIds(parentCalendarObjs); setSharedObjs(allSharedObjs);
      await storage.save("calendar", newState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);

  useEffect(() => { fetchUserEvents(); }, [fetchUserEvents]);

  return { calendars, newCalendarIds: calendarIds, sharedObjs, isLoading, error, refetch: fetchUserEvents };
}