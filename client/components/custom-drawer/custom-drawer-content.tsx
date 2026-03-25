import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfile';

import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { AuthContext } from '../contexts/auth-context';
import { EventsContext } from '../contexts/calendar-events-context';
import { UIContext } from '../contexts/ui-context';

import CalendarDrawerList from './calendar-drawer-list';

function toTitleCase(str: string): string {
  // Convert the whole string to lowercase first for consistent results
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Capitalize the first letter of each word and concatenate with the rest of the word
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export default function CustomDrawerContent(props: any) {
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { setCalendarObj, groupedData } = useContext(EventsContext);
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
      {/* --- USER INFO --- */}
      <View style={styles.profile}>
        <Pressable onPress={handleSettingspress} style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ width: 42, height: 42, backgroundColor: '#4986e7', borderRadius: 8 }}></View>
          <View>
            <Text style={styles.username}>
              {familyProfiles && familyProfiles.parent ? toTitleCase(familyProfiles.parent.name) : 'Username'}
            </Text>
            <Text style={styles.email}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.email : 'Email'}</Text>
          </View>
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1 }}>
        {/* --- CALENDAR TYPE TOGGLE --- */}
        <View style={styles.viewToggleContainer}>
          <Text style={styles.headerText}>View Mode</Text>
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
          <Text style={styles.headerText}>Calendars</Text>
          {groupedData.map((group) => (
            <View key={group.profile.id} style={styles.sectionContainer}>
              {/* Section Header */}
              <Text style={styles.sectionHeader} numberOfLines={1}>
                {group.profile.email}
              </Text>

              {/* List of Calendars for this person */}
              {group.calendars.length > 0 ? (
                group.calendars.map((cal) => <CalendarDrawerList key={cal.calendarId} calendarObj={cal} onToggle={toggleCalendar} />)
              ) : (
                <Text style={styles.emptyText}>No Calendars Found</Text>
              )}
            </View>
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
    padding: 20,
  },
  headerText: {
    fontSize: 14,
    color: 'Gray',
    fontWeight: '700',
  },
  profile: {
    height: 42,
    marginBottom: 20,
  },
  username: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  email: {
    fontSize: 12,
    color: 'gray',
  },
  viewToggleContainer: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  viewButton: {
    padding: 6,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  activeButton: {
    backgroundColor: '#f0f0f0',
  },
  viewButtonText: {
    fontSize: 12,
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
  sectionContainer: {
    marginBottom: 10,
  },
  sectionHeader: {
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginLeft: 10,
    marginVertical: 4,
  },
});
