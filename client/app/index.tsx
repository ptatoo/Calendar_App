import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import { useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from './context';

import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { EventObj } from '@/utility/types';

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { jwtToken } = useAuth();
  const calendarProps = useCalendar(jwtToken?.sessionToken ?? null);

  const calendars = calendarProps.calendars;

  const allEvents: EventObj[] = calendars
    ? [...(calendars.parent?.events || []), ...(calendars.children?.flatMap((child) => child.events) || [])]
    : [];

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
