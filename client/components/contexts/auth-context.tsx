import { fetchJwtToken } from '@/services/api';
import { storage } from '@/services/storage';
import { AuthContextType, CalendarView, FamilyProfileObjs, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useEffect, useState } from 'react';

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {},

  familyProfiles: null,
  setFamilyProfiles: () => {},

  calendarType: '3',
  setCalendarType: () => {},

  loginWithCode: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarView>('3');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateContext = async () => {
      try {
        const [storedJwt, storedProfiles, storeCalendarType] = await Promise.all([
          storage.getSecure('jwt_token'),
          storage.get('profiles'),
          storage.get('calendar_type'),
        ]);
        if (storedJwt) setJwtToken(storedJwt);
        if (storedProfiles) setFamilyProfiles(storedProfiles);
        if (storeCalendarType) setCalendarType(storeCalendarType as CalendarView);
      } catch (err: any) {
        console.error('Failed to hydrate auth context:', err.message);
      } finally {
        setIsHydrated(true);
      }
    };
    hydrateContext();
  }, []);

  //send Code to backend for JWT Token
  const loginWithCode = async (code: string, codeVerifier: string, redirectUri: string) => {
    try {
      const newJwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);

      // Clear old data
      await storage.clearAll();

      // Save and Update State
      await storage.saveSecure('jwt_token', newJwtToken);
      setJwtToken(newJwtToken as JwtTokenObj);
      return newJwtToken;
    } catch (error) {
      console.error('Backend Login Failed', error);
      throw error;
    }
  };

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
        loginWithCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
