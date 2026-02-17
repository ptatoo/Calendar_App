import { DateContextType } from '@/utility/types';
import React, { createContext, ReactNode, useState } from 'react';

// 2. Initialize the context
export const DateContext = createContext<DateContextType>({
  curDate: new Date(),
  setCurDate: () => {},
});

// 3. Create the Provider (The actual "Broadcaster")
export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [curDate, setCurDate] = useState<Date>(new Date());

  return <DateContext.Provider value={{ curDate, setCurDate }}>{children}</DateContext.Provider>;
};
