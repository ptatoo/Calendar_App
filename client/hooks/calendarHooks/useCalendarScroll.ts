import { DateContext } from '@/components/calendar-context';
import { INIT_DAYS_LOADED } from '@/utility/constants';
import { useContext, useRef } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useCalendarScroll = (dayWidth: number, onStartReached?: () => void, onEndReached?: () => void) => {
    //technical stuff
    const headerRef = useRef<FlatList>(null);
    const { curDate, setCurDate } = useContext(DateContext);
    const today = new Date();

    //moves the header with the calendar
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const xOffset = event.nativeEvent.contentOffset.x;

        // Directly tell the header to scroll to the same position
        headerRef.current?.scrollToOffset({
        offset: xOffset,
        animated: false,
        });

        const itemsScrolled = Math.floor(xOffset / dayWidth + 0.5);
        setCurDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - INIT_DAYS_LOADED + itemsScrolled));

        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

        // Calculate how close to edge we are; if at edge, trigger load
        const distanceFromEnd = contentSize.width - (contentOffset.x + layoutMeasurement.width);
        if (distanceFromEnd < 200) {
            onEndReached?.();
        }
    };

    return {
        handleScroll, headerRef
    };
}