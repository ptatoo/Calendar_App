import { MAX_RESULTS } from "@/utility/constants";
import { convertToGoogleEvent } from "@/utility/eventUtils";
import { EventObj } from "@/utility/types";

const req = async (url: string, method: string = "GET", token?: string, body?: any) => {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`API Error: ${await res.text().catch(() => res.statusText)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : res;
};

const bReq = (path: string, method: string, t?: string, b?: any) => 
  req(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api${path}`, method, t, b);

const gReq = (path: string, method: string, t: string, b?: any) => 
  req(`https://www.googleapis.com/calendar/v3${path}`, method, t, b);

// Backend Fetching
export const fetchJwtToken = (code: string, codeVerifier?: string, redirectUri?: string) => 
  bReq("/google-exchange", "POST", undefined, { code, ...(codeVerifier && { codeVerifier }), ...(redirectUri && { redirectUri }) });

export const fetchFamilyProfiles = (t: string) => bReq("/get-family-profiles", "POST", t);
export const fetchFamilyAccessTokens = (t: string) => bReq("/get-family-access-tokens", "POST", t);

// Google API Functions
export const fetchGivenCalendar = async (t: string, calId = "primary", isPrimary = false) => {
  let events: any[] = [], pageToken: string | undefined;
  do {
    const p = new URLSearchParams({ showDeleted: "false", singleEvents: "true", orderBy: "startTime", ...(pageToken && { pageToken }) });
    const data = await gReq(`/calendars/${encodeURIComponent(calId)}/events?${p}`, "GET", t);
    if (data.items) events.push(...data.items);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return events;
};

export const fetchGivenCalendarAndPage = async (t: string, calId = "primary", pageToken?: string, isPrimary = false): Promise<{events: any[], pageToken: string | undefined}> => {
  if (!pageToken) return { events: [], pageToken: undefined };
  const p = new URLSearchParams({ showDeleted: "false", singleEvents: "true", orderBy: "startTime", maxResults: MAX_RESULTS, pageToken });
  const data = await gReq(`/calendars/${encodeURIComponent(calId)}/events?${p}`, "GET", t);
  return { events: data.items || [], pageToken: data.nextPageToken };
};

export const fetchCalendarList = (t: string) => gReq("/users/me/calendarList", "GET", t);

export const addEventToGoogleCalendar = (t: string, e: EventObj) => 
  gReq("/calendars/primary/events", "POST", t, convertToGoogleEvent(e));

export const editEventToGoogleCalendar = (t: string, e: EventObj) => {
  if (!e.id) throw new Error("Event ID is required to edit an event.");
  return gReq(`/calendars/${encodeURIComponent(e.calendarId!)}/events/${encodeURIComponent(e.id)}`, "PATCH", t, convertToGoogleEvent(e));
};

export const deleteEventToGoogleCalendar = (t: string, e: EventObj) => {
  if (!e.id) throw new Error("Event ID is required to delete an event.");
  return gReq(`/calendars/${encodeURIComponent(e.calendarId!)}/events/${encodeURIComponent(e.id)}`, "DELETE", t);
};

export const shareCalendar = (calId: string, email: string, t: string) => 
  gReq(`/calendars/${calId}/acl`, "POST", t, { role: "reader", scope: { type: "user", value: email } });

export const getCalendarSharingSettings = (calId: string, t: string) => gReq(`/calendars/${calId}/acl`, "GET", t);
