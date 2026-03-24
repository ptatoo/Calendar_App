import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfile';

import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { AuthContext } from '../../app/context';
import { EventsContext } from '../contexts/calendar-events-context';
import { UIContext } from '../contexts/ui-context';

import CalendarDrawerList from './calendar-drawer-list';

export default function CustomDrawerContent(props: any) {
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { calendarObjs, setCalendarObj } = useContext(EventsContext);
  const { setLoginVisible } = useContext(UIContext);

  const getButtonStyle = (option: '1' | '2' | '3' | 'W' | 'M', pressed: boolean) => [
    styles.viewButton,
    calendarType === option && styles.activeButton,
    pressed && styles.pressedButton,
  ];

  //toggle visibility of specific calendar
  const toggleCalendar = (id: string) => {
    setCalendarObj((prev) => {
      if (!prev) return null;

      const next = prev.map((cal) => (cal.calendarId === id ? { ...cal, shown: !cal.shown } : cal));
      return next;
    });
  };

  //open up settings/login page
  const handleSettingspress = () => {
    props.navigation.closeDrawer();
    setLoginVisible(true);
  };

  return (
    <SafeAreaView style={styles.headerContainer}>
      <ScrollView style={{ flex: 1 }}>
        <View>
          {/* --- USER INFO --- */}
          <Pressable onPress={handleSettingspress}>
            <Text style={styles.username}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.name : 'Username'}</Text>
            <Text style={styles.email}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.email : 'Email'}</Text>
          </Pressable>
        </View>
        {/* --- CALENDAR TYPE TOGGLE --- */}
        <View style={styles.viewToggleContainer}>
          {['1', '2', '3', 'W', 'M'].map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setCalendarType(option as '1' | '2' | '3' | 'W' | 'M');
                props.navigation.closeDrawer();
              }}
              style={({ pressed }) => getButtonStyle(option as '1' | '2' | '3' | 'W' | 'M', pressed)}
            >
              <Text style={[styles.viewButtonText, calendarType === option && styles.activeButtonText]}>
                {option === 'W' ? 'week' : option === 'M' ? 'month' : `${option} day${option !== '1' ? 's' : ''}`}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* --- CALENDAR VISIBILITY TOGGLE --- */}
        <View style={{ flex: 1 }}>
          {calendarObjs?.map((calendarObj) => (
            <CalendarDrawerList calendarObj={calendarObj} onToggle={toggleCalendar} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 5,
  },
  username: {
    paddingLeft: 20,
    paddingTop: 20,
    fontSize: 16,
    marginBottom: 4,
  },
  email: {
    paddingLeft: 20,
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  viewToggleContainer: {
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 10,
  },

  viewButton: {
    paddingVertical: 10,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  activeButton: {
    backgroundColor: '#f0f0f0',
  },

  viewButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  activeButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
});
