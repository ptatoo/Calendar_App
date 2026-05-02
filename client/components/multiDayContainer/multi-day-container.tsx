import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useCalendarRange } from '@/hooks/calendarHooks/useCalendarRange';
import { useEventGrouping } from '@/hooks/calendarHooks/useEventGrouping';
import { usePinchZoom } from '@/hooks/calendarHooks/usePinchZoom';
import {
  DATE_HEADER_HEIGHT,
  DAYS_PADDING_THRESHOLD,
  GRID_COLOR,
  GRID_WIDTH,
  HEADER_BACKGROUND_COLOR,
  HEADER_HEIGHT,
  HOUR_LABEL_WIDTH,
  PAST_BUFFER,
  SCREEN_WIDTH,
} from '@/utility/constants';
import { CalendarView, EventObj, EventWithOffset } from '@/utility/types';
import { useCalendarIndex } from '../contexts/calendar-index-context';

import EventDetails from '../eventDetailsContainer/event-details';
import DayContainer from './day-container';
import HourGuide from './hour-guide';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
const EMPTY_EVENTS: EventWithOffset[] = [];

export default function MultiDayContainer({ calendarType, events }: { calendarType: CalendarView; events: EventObj[] }) {
  const dividers = parseInt(calendarType) || 3;
  const dayWidth = Math.round(GRID_WIDTH / dividers);
  const { hourHeight, pinchGesture } = usePinchZoom();

  // calendarIndex
  const listRef = useAnimatedRef<FlashListRef<any>>();
  const { setDayWidth } = useCalendarIndex();
  useLayoutEffect(() => {
    setDayWidth(dayWidth);
  }, [dayWidth, setDayWidth]);

  const { groupedTimedEvents, groupedAllDayEvents } = useEventGrouping(events);
  const { days, initialIndex, extendFuture, extendPast } = useCalendarRange();

  const [selectedEvent, setSelectedEvent] = useState<EventObj | null>(null);
  const [eventDetailsVisible, setEventDetailsVisible] = useState(false);

  const handlePress = useCallback((event: EventObj | null) => {
    setSelectedEvent(event);
    setEventDetailsVisible(!!event);
  }, []);

  const scrollX = useSharedValue<number>(0);
  const contextX = useSharedValue<number>(0);
  const contextY = useSharedValue<number>(0);
  const scrollY = useSharedValue<number>(0);
  const startX = useSharedValue<number>(0);
  const startY = useSharedValue<number>(0);
  const nativeRef = useRef(Gesture.Native());

  const verticalPan = Gesture.Pan()
    .simultaneousWithExternalGesture(nativeRef)
    .manualActivation(true)
    .shouldCancelWhenOutside(false)
    .onTouchesDown((event) => {
      startX.value = event.allTouches[0].x;
      startY.value = event.allTouches[0].y;
    })
    .onTouchesMove((event, state) => {
      const currentX = event.changedTouches[0].x;
      const currentY = event.changedTouches[0].y;

      const diffX = Math.abs(currentX - startX.value);
      const diffY = Math.abs(currentY - startY.value);

      if (diffY > 10 && diffY > diffX) {
        state.activate();
      } else if (diffX > 10) {
        state.fail();
      }
    })
    .onStart(() => {
      cancelAnimation(scrollY);
      contextY.value = scrollY.value;
    })
    .onUpdate((event) => {
      const nextY = contextY.value - event.translationY;
      scrollY.value = Math.max(0, Math.min(nextY, hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT));
    })
    .onEnd((event) => {
      const maxScroll = hourHeight * 24 - SCREEN_HEIGHT + HEADER_HEIGHT + DATE_HEADER_HEIGHT;
      scrollY.value = withDecay({
        velocity: -event.velocityY,
        clamp: [0, maxScroll],
        deceleration: 0.99,
      });
    });

  const horizontalPan = Gesture.Pan()
    .simultaneousWithExternalGesture(nativeRef)
    .manualActivation(true)
    .shouldCancelWhenOutside(false)
    .onTouchesDown((event) => {
      startX.value = event.allTouches[0].x;
      startY.value = event.allTouches[0].y;
    })
    .onTouchesMove((event, state) => {
      const currentX = event.changedTouches[0].x;
      const currentY = event.changedTouches[0].y;

      const diffX = Math.abs(currentX - startX.value);
      const diffY = Math.abs(currentY - startY.value);

      if (diffX > 10 && diffX > diffY) {
        state.activate();
      } else if (diffY > 10) {
        state.fail();
      }
    })
    .onStart(() => {
      cancelAnimation(scrollX);
      contextX.value = scrollX.value;
    })
    .onUpdate((event) => {
      const nextX = contextX.value - event.translationX;
      scrollX.value = Math.max(0, nextX);
    })
    .onEnd((event) => {
      scrollX.value = withDecay({
        velocity: -event.velocityX,
        deceleration: 0.998,
      });
    });

  const combined = Gesture.Simultaneous(verticalPan, horizontalPan);

  // Sync FlashList horizontal scrolling programmatically and handle infinite loading
  useAnimatedReaction(
    () => scrollX.value,
    (x) => {
      scrollTo(listRef, x, 0, false);

      const currentIndex = Math.floor(x / dayWidth);
      const totalDays = days.length; // Ensure this dynamically matches your data length if needed

      if (currentIndex > totalDays - DAYS_PADDING_THRESHOLD) {
        scheduleOnRN(extendFuture);
      }
      if (currentIndex < DAYS_PADDING_THRESHOLD) {
        console.log('entering the past...');
      }
    },
  );

  // Apply vertical scroll to the HourGuide (assuming DayContainer handles its own Y offset internally)
  const animatedHourGuideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combined}>
        <Animated.View style={{ flex: 1, overflow: 'hidden' }}>
          {/* HOUR GUIDE */}
          <View style={{ flex: 1, flexDirection: 'row' }}>
            {/* HourGuide syncs vertically via useAnimatedStyle */}
            <Animated.View style={animatedHourGuideStyle}>
              <HourGuide hourHeight={hourHeight} labelWidth={HOUR_LABEL_WIDTH} />
            </Animated.View>

            {/* MAIN GRID */}
            <AnimatedFlashList
              ref={listRef}
              data={days}
              horizontal
              scrollEnabled={false}
              nestedScrollEnabled={true}
              keyExtractor={(item: any) => item.date.toISOString()}
              style={{ width: GRID_WIDTH }}
              initialScrollIndex={PAST_BUFFER}
              maintainVisibleContentPosition={{
                autoscrollToTopThreshold: 0,
              }}
              renderItem={({ item }) => (
                <DayContainer
                  day={(item as any).date}
                  dayWidth={dayWidth}
                  eventsWithOffsets={groupedTimedEvents[(item as any).date.toDateString()] ?? EMPTY_EVENTS}
                  hourHeight={hourHeight}
                  handlePress={handlePress}
                  scrollY={scrollY}
                  contextY={contextY}
                />
              )}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <EventDetails event={selectedEvent} isVisible={eventDetailsVisible} onClose={() => handlePress(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', flex: 1 },
  headerWrapper: {
    height: DATE_HEADER_HEIGHT,
    flexDirection: 'row',
    width: SCREEN_WIDTH,
  },
  date: {
    justifyContent: 'center',
    backgroundColor: HEADER_BACKGROUND_COLOR,
  },
  dateInner: {
    alignItems: 'center',
    width: '100%',
    paddingRight: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateNumber: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
  todayText: { color: '#2563EB' },
  todayNumber: { color: '#2563EB', fontWeight: '700' },
  dateHourGuide: {
    width: HOUR_LABEL_WIDTH,
    backgroundColor: HEADER_BACKGROUND_COLOR,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
  },
  allDayRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderColor: GRID_COLOR,
    minHeight: 45,
  },
  allDaySpacer: {
    width: HOUR_LABEL_WIDTH,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  debugLabel: {
    fontSize: 8,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  allDayColumn: {
    paddingVertical: 4,
    borderRightWidth: 1,
    borderColor: GRID_COLOR,
    backgroundColor: 'white',
  },
  allDayChip: {
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 2,
    marginHorizontal: 4,
  },
  allDayText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
});
