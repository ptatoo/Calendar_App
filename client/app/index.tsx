import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import { useContext } from 'react';
import { View } from 'react-native';

import { EventsContext } from '@/components/calendar-events-context';
import { AuthContext } from './context';

import { useAuth } from '@/hooks/useAuth';

import { postInviteAdd } from '@/services/api';

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { calendarObjs, allEvents, isLoading } = useContext(EventsContext);
  // Holds all available Calendar Ids

  const { jwtToken } = useAuth();

  //const calendarProps = useCalendar(jwtToken?.sessionToken ?? null);
  //const calendars = calendarProps.calendars;

  const output = postInviteAdd(jwtToken?.sessionToken || '', 'i.alexander.song@gmail.com');
  console.log(output);

  // Combine all CalendarDatas into one array
  // const allAvailableCalendars = useMemo(() => {
  //   if (!calendars) return [];

  //   return [...(calendars.parent || []), ...(calendars.children || [])];
  // }, [calendars]);

  // //Set Available IDs on render
  // const visibleCalendarIds = useMemo(() => {
  //   return calendarObjs ? calendarObjs.filter((cal) => cal.shown).map((cal) => cal.calendarId) : [];
  // }, [calendarObjs]);

  // //list all events
  // const allEvents = useMemo(() => {
  //   return (
  //     allAvailableCalendars
  //       // toggle event visibilty based on calendar ID
  //       .filter((cal) => visibleCalendarIds.includes(cal.id))
  //       .flatMap((cal) =>
  //         cal.events.map((event) => ({
  //           ...event,
  //         })),
  //       )
  //   );
  // }, [allAvailableCalendars, visibleCalendarIds]);

  console.log(allEvents);

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
