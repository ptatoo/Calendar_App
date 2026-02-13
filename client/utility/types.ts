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
export interface CalendarType {
  type: "M" | "W" | "3" | "2" | "1";
  setType: (newType: "M" | "W" | "3" | "2" | "1") => void;
}
export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken : JwtTokenObj | null) => void;
  
  familyProfiles: FamilyProfileObjs | null;
  setFamilyProfiles: (familyProfile : FamilyProfileObjs | null) => void;

  CalendarType: "M" | "W" | "3" | "2" | "1";
  setCalendarType: (CalendarType: "M" | "W" | "3" | "2" | "1") => void;
}
