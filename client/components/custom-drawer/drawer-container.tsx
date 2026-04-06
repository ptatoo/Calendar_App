import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfile';

import { calendarObj } from '@/utility/types';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { AuthContext } from '../contexts/auth-context';
import { EventsContext } from '../contexts/calendar-events-context';
import { UIContext } from '../contexts/ui-context';

import CalendarDrawerList from './drawer-calendar-individual';

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

//Each Individual Calendar
function DraggableCalendar({
  cal,
  onDrop,
  toggleCalendar,
}: {
  cal: calendarObj;
  onDrop: (calendarId: string, absoluteY: number) => void;
  toggleCalendar: (id: string) => void;
}) {
  const isDragging = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY };
    })
    .onEnd((e) => {
      isDragging.value = false;
      // Tell the main thread to move the data
      runOnJS(onDrop)(cal.calendarId, e.absoluteY);
      offset.value = withSpring({ x: 0, y: 0 });
    });

  //for animated view
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { scale: withSpring(isDragging.value ? 1.05 : 1) }],
    zIndex: isDragging.value ? 1000 : 1,
    opacity: isDragging.value ? 0.8 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { backgroundColor: 'white' }]}>
        <CalendarDrawerList calendarObj={cal} onToggle={toggleCalendar} />
      </Animated.View>
    </GestureDetector>
  );
  //return <CalendarDrawerList calendarObj={cal} onToggle={toggleCalendar} />;
}

export default function CustomDrawerContent(props: any) {
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { setCalendarObj, groupedCalendars, moveCalendar } = useContext(EventsContext);
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

  const [draggingCalendar, setDraggingCalendar] = useState<calendarObj | null>(null);
  const [folderLayouts, setFolderLayouts] = useState<Record<string, { y: number; height: number }>>({});
  const [hoverInfo, setHoverInfo] = useState<{ groupID: String; index: number } | null>(null);

  // 2. The drop function we pass to DraggableCalendar
  const handleDrop = (calendarId: string, absoluteY: number) => {
    // Check which folder the absoluteY (where your finger let go) is inside
    for (const [groupId, layout] of Object.entries(folderLayouts)) {
      // Basic hit-detection math
      if (absoluteY >= layout.y && absoluteY <= layout.y + layout.height) {
        moveCalendar(calendarId, groupId);
        return;
      }
    }
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
      <ScrollView>
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
          {groupedCalendars.map((group) => (
            <View key={group.id} style={styles.sectionContainer}>
              {/* --- FOLDER HEADER --- */}
              <View
                onLayout={(event) => {
                  const { target } = event;
                  const { height } = event.nativeEvent.layout;
                  // Use a ref and measure to get the true Screen Y position
                }}
                style={[
                  styles.sectionHeader,
                  // Optional: Highlight if we were able to detect a hover (requires more logic)
                ]}
              >
                <Text style={styles.sectionHeaderText}>{group.id}</Text>

                {/* List of Calendars */}
                <View style={{ flex: 1 }}>
                  {group.calendars.length > 0 ? (
                    group.calendars.map((cal) => (
                      <DraggableCalendar key={cal.calendarId} cal={cal} onDrop={handleDrop} toggleCalendar={toggleCalendar} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No Calendars Found</Text>
                  )}
                </View>
              </View>
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
  sectionHeaderText: {},
});
