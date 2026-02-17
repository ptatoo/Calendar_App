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
  id: string,
  title: string,
  description: string,
  organizer: string,
  allDay: boolean,
  startDate: Date,
  endDate: Date,
}

export interface CalendarData {
  owner: string;
  name: string;
  color: string;
  events: EventObj[]; // The actual calendar events
}
export interface FamilyCalendarState {
  parent: CalendarData;       // You (The User)
  children: CalendarData[];   // The Kids
}