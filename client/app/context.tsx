import { createContext, ReactNode, useState } from "react";

interface JwtTokenObj {
  sessionToken: string;
  expiryDate: string;
}
interface ProfileObj {
  id: string;
  email: string;
  name: string;
}
interface AccessTokenObj {
  id: string;
  accessToken: string;
  expiryDate: string;
}
interface FamilyProfileObjs {
  parent: ProfileObj;
  children: ProfileObj[]
}
interface FamilyAccessTokenObjs {
  parent: AccessTokenObj;
  children: AccessTokenObj[]
}
interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken : JwtTokenObj | null) => void;
  
  familyProfiles: FamilyProfileObjs | null;
  setFamilyProfiles: (familyProfile : FamilyProfileObjs | null) => void;
  
  familyAccessTokens: FamilyAccessTokenObjs | null;
  setFamilyAccessTokens: (familyAccessTokens : FamilyAccessTokenObjs | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {},

  familyProfiles: null,
  setFamilyProfiles: () => {},
  
  familyAccessTokens: null,
  setFamilyAccessTokens: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);
  const [familyAccessTokens, setFamilyAccessTokens] = useState<FamilyAccessTokenObjs | null>(null);

  return (
    <AuthContext.Provider value={{ 
      jwtToken, 
      setJwtToken,
      familyProfiles, 
      setFamilyProfiles,
      familyAccessTokens, 
      setFamilyAccessTokens,
    }}>
      {children}
    </AuthContext.Provider>
  );
}