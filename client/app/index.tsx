import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import { useContext, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { AuthContext } from './context';

import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { jwtToken } = useAuth();

  const calendarProps = useCalendar(jwtToken?.sessionToken ?? null);
  const calendars = calendarProps.calendars;

  // Combine all CalendarDatas into one array
  const allAvailableCalendars = useMemo(() => {
    if (!calendars) return [];

    return [...(calendars.parent || []), ...(calendars.children || [])];
  }, [calendars]);

  // Holds all available Calendar Ids
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>([]);

  //set available IDs on render
  useEffect(() => {
    if (allAvailableCalendars.length > 0 && visibleCalendarIds.length === 0) {
      const initialIds = allAvailableCalendars.map((cal) => cal.id);
      setVisibleCalendarIds(initialIds);
    }
  }, [allAvailableCalendars]);

  //list all events
  const allEvents = useMemo(() => {
    return (
      allAvailableCalendars
        // toggle event visibilty based on calendar ID
        .filter((cal) => visibleCalendarIds.includes(cal.id))
        .flatMap((cal) =>
          cal.events.map((event) => ({
            ...event,
          })),
        )
    );
  }, [allAvailableCalendars, visibleCalendarIds]);

  // --- DISPLAY ---
  return (
    <View style={{ flex: 1 }}>
      {(calendarType === '3' || calendarType === '2' || calendarType === '1') && (
        <MultiDayContainer calendarType={calendarType} events={allEvents} />
      )}

      {calendarType === 'M' && <MonthContainer numWeeks={6} />}
    </View>
  );
}
