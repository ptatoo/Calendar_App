import React, { createContext, ReactNode, useState } from 'react';

interface DateContextType {
  curDate: Date;
  setCurDate: React.Dispatch<React.SetStateAction<Date>>;
}

// 2. Initialize the context
export const DateContext = createContext<DateContextType | undefined>(undefined);

// 3. Create the Provider (The actual "Broadcaster")
export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [curDate, setCurDate] = useState<Date>(new Date());

  return <DateContext.Provider value={{ curDate, setCurDate }}>{children}</DateContext.Provider>;
};
