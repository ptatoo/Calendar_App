import { DEFAULT_COLORS } from '@/utility/constants';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { EventsContext } from './calendar-events-context';

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
  const { calendarObjs } = useContext(EventsContext);
  const [colors, updateColors] = useState<string[]>(DEFAULT_COLORS);

  const updateCustomColors = useEffect(() => {});

  return <UIContext.Provider value={{ isLoginVisible, setLoginVisible }}>{children}</UIContext.Provider>;
};
