// auth-context.tsx
import { fetchJwtToken } from '@/services/api';
import { storage } from '@/services/storage';
import { CalendarView, FamilyProfileObjs, JwtTokenObj } from '@/utility/types';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken: JwtTokenObj | null) => void;

  familyProfiles: FamilyProfileObjs | null;
  setFamilyProfiles: (familyProfile: FamilyProfileObjs | null) => void;

  calendarType: CalendarView;
  setCalendarType: (calendarType: CalendarView) => void;

  loginWithCode: (code: string, codeVerifier: string, redirectUri: string) => void;
  logout: () => Promise<void>;

  isLoading: boolean;
  error: string | null;
  promptAsync: () => Promise<AuthSession.AuthSessionResult>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarView>('3');
  const [isHydrated, setIsHydrated] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Expo Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        default: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      })!,
      scopes: [
        'openid',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      responseType: 'code',
      usePKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
      redirectUri: AuthSession.makeRedirectUri(),
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    },
  );

  // Initial Hydration
  useEffect(() => {
    Promise.all([
      storage.getSecure('jwt_token').then((t) => t && setJwtToken(t)),
      storage.get('profiles').then((p) => p && setFamilyProfiles(p)),
      storage.get('calendar_type').then((c) => c && setCalendarType(c as CalendarView)),
    ]).finally(() => setIsHydrated(true));
  }, []);

  // Handle Auth Response
  useEffect(() => {
    if (response?.type === 'success' && request?.codeVerifier) {
      setIsLoading(true);
      loginWithCode(response.params.code, request.codeVerifier, request.redirectUri)
        .catch(() => setError('Login failed'))
        .finally(() => setIsLoading(false));
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Authentication error');
    }
  }, [response]);

  const loginWithCode = async (code: string, codeVerifier?: string, redirectUri?: string) => {
    const newJwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);
    await storage.clearAll();
    await storage.saveSecure('jwt_token', newJwtToken);
    setJwtToken(newJwtToken as JwtTokenObj);
    return newJwtToken;
  };

  //logout
  const logout = async () => {
    // Clear storage completely
    await storage.clearAll();

    // Reset local state variables
    setJwtToken(null);
    setFamilyProfiles(null);
    setError(null);
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
        logout,
        isLoading,
        error,
        promptAsync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
