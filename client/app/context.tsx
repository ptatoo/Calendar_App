import { createContext, ReactNode, useState } from "react";

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
export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken : JwtTokenObj | null) => void;
  
  familyProfiles: FamilyProfileObjs | null;
  setFamilyProfiles: (familyProfile : FamilyProfileObjs | null) => void;
  
}

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {},

  familyProfiles: null,
  setFamilyProfiles: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);

  return (
    <AuthContext.Provider value={{ 
      jwtToken, 
      setJwtToken,
      familyProfiles, 
      setFamilyProfiles,
    }}>
      {children}
    </AuthContext.Provider>
  );
}