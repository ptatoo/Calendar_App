import { createContext } from "react";

interface AuthContext {
  jwtToken: string | null;
  setJwtToken: (jwtToken : string | null) => void;
}

export const context = createContext<AuthContext>({
  jwtToken: null,
  setJwtToken: () => {}
});