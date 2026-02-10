import { createContext, ReactNode, useState } from "react";

interface JwtTokenObj {
  sessionToken: string;
  expiryDate: string;
}
interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken : JwtTokenObj | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);

  return (
    <AuthContext.Provider value={{ jwtToken, setJwtToken }}>
      {children}
    </AuthContext.Provider>
  );
}