import { calendarObj, EventsContextType } from '@/utility/types';
import { createContext, ReactNode, useState } from 'react';

export const EventsContext = createContext<EventsContextType>({
  calendarObjs: null,
  setCalendarObj: () => {},
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [calendarObjs, setCalendarObj] = useState<calendarObj[] | null>(null);

  return <EventsContext.Provider value={{ calendarObjs, setCalendarObj }}>{children}</EventsContext.Provider>;
};
