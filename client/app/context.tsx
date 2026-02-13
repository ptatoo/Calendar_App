import { storage } from "@/services/storage";
import {
  AuthContextType,
  FamilyProfileObjs,
  JwtTokenObj,
  CalendarType,
} from "@/utility/types";
import { createContext, ReactNode, useEffect, useState } from "react";

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {},

  familyProfiles: null,
  setFamilyProfiles: () => {},

  CalendarType: "3",
  setCalendarType: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] =
    useState<FamilyProfileObjs | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarType>("3");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateContext = async () => {
      try {
        const [storedJwt, storedProfiles] = await Promise.all([
          storage.getSecure("jwt_token"),
          storage.get("profiles"),
        ]);
        if (storedJwt) setJwtToken(storedJwt);
        if (storedProfiles) setFamilyProfiles(storedProfiles);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
