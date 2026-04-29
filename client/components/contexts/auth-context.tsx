// auth-context.tsx
import { fetchJwtToken } from '@/services/api';
import { storage } from '@/services/storage';
import { CalendarView, FamilyProfileObjs, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useEffect, useState } from 'react';
export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken : JwtTokenObj | null) => void;
  
  familyProfiles: FamilyProfileObjs | null;
  setFamilyProfiles: (familyProfile : FamilyProfileObjs | null) => void;

  calendarType: CalendarView;
  setCalendarType: (calendarType: CalendarView) => void;

  loginWithCode: (code: string, codeVerifier: string, redirectUri: string) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarView>('3');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([
      storage.getSecure('jwt_token').then(t => t && setJwtToken(t)),
      storage.get('profiles').then(p => p && setFamilyProfiles(p)),
      storage.get('calendar_type').then(c => c && setCalendarType(c as CalendarView)),
    ]).finally(() => setIsHydrated(true));
  }, []);

  const loginWithCode = async (code: string, codeVerifier?: string, redirectUri?: string) => {
    const newJwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);
    await storage.clearAll();
    await storage.saveSecure('jwt_token', newJwtToken);
    setJwtToken(newJwtToken as JwtTokenObj);
    return newJwtToken;
  };

  if (!isHydrated) return null;

  return (
    <AuthContext.Provider value={{ jwtToken, setJwtToken, familyProfiles, setFamilyProfiles, calendarType, setCalendarType, loginWithCode }}>
      {children}
    </AuthContext.Provider>
  );
};