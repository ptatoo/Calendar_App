// hooks/calendarHooks/useCalendarScroll.ts
import { DateContext } from '@/components/calendar-context';
import { PAST_BUFFER } from '@/utility/constants';
import { useContext, useRef } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useCalendarScroll = (dayWidth: number) => {
  const headerRef = useRef<FlatList>(null);
  const { curDate, setCurDate } = useContext(DateContext);
  const today = new Date();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    
    const itemsScrolled = Math.floor(xOffset / dayWidth + 0.5);
    setCurDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - PAST_BUFFER + itemsScrolled));

    // Sync header position
    headerRef.current?.scrollToOffset({
      offset: xOffset,
      animated: false,
    });
  };

  return { handleScroll, headerRef };
};