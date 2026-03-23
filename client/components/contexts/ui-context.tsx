import React, { createContext, ReactNode, useState } from 'react';

interface UIContextType {
  isLoginVisible: boolean;
  setLoginVisible: (visible: boolean) => void;
}

export const UIContext = createContext<UIContextType>({
  isLoginVisible: false,
  setLoginVisible: () => {},
});

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginVisible, setLoginVisible] = useState(false);

  return <UIContext.Provider value={{ isLoginVisible, setLoginVisible }}>{children}</UIContext.Provider>;
};
