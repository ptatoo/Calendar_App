import { createContext, ReactNode, useState } from "react";

interface AuthContextType {
  jwtToken: object | null;
  setJwtToken: (jwtToken : object | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  jwtToken: null,
  setJwtToken: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<object | null>(null);

  return (
    <AuthContext.Provider value={{ jwtToken, setJwtToken }}>
      {children}
    </AuthContext.Provider>
  );
}