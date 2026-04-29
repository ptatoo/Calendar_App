import { PAST_BUFFER } from '@/utility/constants';
import React, { createContext, ReactNode, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export interface DateContextType {
  curDate: Date;
  setCurDate: (curDate: Date) => void;
  setDayWidth: React.Dispatch<React.SetStateAction<number>>;
}

export const DateContext = createContext<DateContextType>({
  curDate: new Date(),
  setCurDate: () => {},
  setDayWidth: () => {},
});

// 3. Create the Provider (The actual "Broadcaster")
export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [curDate, setCurDate] = useState<Date>(new Date());
  const [dayWidth, setDayWidth] = useState<number>(0);
  const scrollX = useSharedValue(PAST_BUFFER * dayWidth);

  return <DateContext.Provider value={{ curDate, setCurDate, setDayWidth }}>{children}</DateContext.Provider>;
};
