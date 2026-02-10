import { storage } from "@/services/storage";
import { createContext, ReactNode, useEffect, useState } from "react";

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
      } catch (err : any) {
        console.log("error as fuck: ", err.message);
      } finally {
        setIsHydrated(true);
      }
    };
    
    hydrateContext();
  },[]);

  if (!isHydrated) return null;

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