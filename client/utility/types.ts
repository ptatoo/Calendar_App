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
export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken : JwtTokenObj | null) => void;
  
  familyProfiles: FamilyProfileObjs | null;
  setFamilyProfiles: (familyProfile : FamilyProfileObjs | null) => void;

  calendarType: CalendarView;
  setCalendarType: (calendarType: CalendarView) => void;
}

export interface DateContextType {
  curDate: Date,
  setCurDate: (curDate: Date) => void;
}

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
  displayColor: string;
}

export interface CalendarData {
  id: string;
  owner: string;
  name: string;
  color: string;
  events: EventObj[]; // The actual calendar events
}
export interface FamilyCalendarState {
  parent: CalendarData[];       // You (The User)
  children: CalendarData[];   // The Kids
}

export interface EventWithOffset {
  event: EventObj;
  offset: number;
}