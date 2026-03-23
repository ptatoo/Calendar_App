import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import { useContext } from 'react';
import { View } from 'react-native';

import { EventsContext } from '@/components/contexts/calendar-events-context';
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

  const output = postInviteAdd(jwtToken?.sessionToken || '', 'i.alexander.song@gmail.com');
  console.log(output);

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
