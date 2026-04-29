export interface JwtTokenObj {
  sessionToken: string;
  expiryDate: string;
}
export interface ProfileObj {
  id: string;
  email: string;
  name: string;
}
export interface AccessTokenObj {
  id: string;
  accessToken: string;
  expiryDate: string;
}
export interface FamilyProfileObjs {
  parent: ProfileObj;
  children: ProfileObj[]
}
export interface FamilyAccessTokenObjs {
  parent: AccessTokenObj;
  children: AccessTokenObj[]
}
export type CalendarView = "M" | "W" | "3" | "2" | "1";

export interface calendarObj {
  calendarName: string;
  calendarId: string;
  owner: boolean,
  calendarDefaultColor: string;
  calendarCustomColor: string;
  shown: boolean,
}

//Processed calendar data 
export interface EventObj {
  //event data
  id: string,
  title: string,
  description: string,
  location: string;
  organizer: string,
  allDay: boolean,
  startDate: Date,
  endDate: Date,
  eventType: string;

  //recurrence
  recurrence?: string[];
  sequence: number; 
  reminders: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
  recurringEventId?: string;

  //calendar data
  calendarId: string;
  calendar: calendarObj;
}

export interface CalendarData {
  id: string;
  owner: string;
  name: string;
  color: string;
  events: EventObj[];
}

export interface sharedObj {
  id: string;
  name: string,
  sharedIds: {id: string, accessRole: string}[];
}

export interface FamilyCalendarState {
  parent: CalendarData[];
  children: CalendarData[];
}

export interface EventWithOffset {
  event: EventObj;
  offset: number;
}

export interface colorCache {
  paletteId: number;
  name: string;
  palette: string[];
  colorMap: Record<string, string>;
}