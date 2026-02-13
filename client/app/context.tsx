import { storage } from "@/services/storage";
import {
  AuthContextType,
  CalendarView,
  FamilyProfileObjs,
  JwtTokenObj,
} from "@/utility/types";
import { createContext, ReactNode, useEffect, useState } from "react";

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {},

  familyProfiles: null,
  setFamilyProfiles: () => {},

  calendarType: "3",
  setCalendarType: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] =
    useState<FamilyProfileObjs | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarView>("3");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateContext = async () => {
      try {
        const [storedJwt, storedProfiles, storeCalendarType] =
          await Promise.all([
            storage.getSecure("jwt_token"),
            storage.get("profiles"),
            storage.get("calendar_type"),
          ]);
        if (storedJwt) setJwtToken(storedJwt);
        if (storedProfiles) setFamilyProfiles(storedProfiles);
        if (storeCalendarType)
          setCalendarType(storeCalendarType as CalendarView);
      } catch (err: any) {
        console.log("error as fuck: ", err.message);
      } finally {
        setIsHydrated(true);
      }
    };
    hydrateContext();
  }, []);

  if (!isHydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        jwtToken,
        setJwtToken,
        familyProfiles,
        setFamilyProfiles,
        calendarType,
        setCalendarType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
