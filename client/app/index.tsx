//Components
import LoginModal from '@/components/loginContainer/loginModal';
import MonthContainer from '@/components/monthContainer/month-container';
import MultiDayContainer from '@/components/multiDayContainer/multi-day-container';

import { useContext } from 'react';
import { View } from 'react-native';

//Global Contexts
import { EventsContext } from '@/components/contexts/calendar-events-context';
import { UIContext } from '@/components/contexts/ui-context';
import { AuthContext } from './context';

// --- MAIN COMPONENT ---
export default function Index() {
  // --- STATE ---
  const { calendarType } = useContext(AuthContext);
  const { allEvents, isLoading } = useContext(EventsContext);
  const { isLoginVisible, setLoginVisible } = useContext(UIContext);

  // --- DISPLAY ---
  return (
    <View style={{ flex: 1 }}>
      {(calendarType === '3' || calendarType === '2' || calendarType === '1') && (
        <MultiDayContainer calendarType={calendarType} events={allEvents} />
      )}

      {calendarType === 'M' && <MonthContainer numWeeks={6} />}

      <LoginModal isVisible={isLoginVisible} onClose={() => setLoginVisible(false)} />
    </View>
  );
}
