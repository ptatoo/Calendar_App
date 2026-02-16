import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthContext } from './context';

import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { useProfiles } from '@/hooks/useProfile';
import { EventObj } from '@/utility/types';

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const calendarProps = useCalendar(jwtToken?.sessionToken ?? null);
  const [currentDay, setCurrentDay] = useState<Date>(new Date());

  const calendars = calendarProps.calendars;

  const allEvents: EventObj[] = calendars
    ? [...(calendars.parent?.events || []), ...(calendars.children?.flatMap((child) => child.events) || [])]
    : [];

  useEffect(() => {
    //auto updates calendar when it changes
    calendarProps.refetch();
  }, [jwtToken]);

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

// --- STYLES ---
const styles = StyleSheet.create({});
