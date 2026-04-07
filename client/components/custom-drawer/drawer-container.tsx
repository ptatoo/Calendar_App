import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfile';

import { calendarObj } from '@/utility/types';
import { useContext, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { AuthContext } from '../contexts/auth-context';
import { EventsContext } from '../contexts/calendar-events-context';
import { UIContext } from '../contexts/ui-context';

import CalendarDrawerList from './drawer-calendar-individual';

const calendarIndividualHeight = 36;
const calendarHeaderHeight = 18;

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
  activeGroupIndex,
  homeGroupId,
  homeGroupIndex,
  hoverIndex,
  thisIndex,
  movingIndex,
}: {
  cal: calendarObj;
  onDrop: (calendarId: string, absoluteY: number) => void;
  toggleCalendar: (id: string) => void;
  homeGroupId: string;
  homeGroupIndex: number;
  activeGroupIndex: SharedValue<number | null>;
  hoverIndex: SharedValue<number | null>;
  movingIndex: SharedValue<number | null>;
  thisIndex: number;
}) {
  const isDragging = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      isDragging.value = true;
      movingIndex.value = thisIndex;
      activeGroupIndex.value = homeGroupIndex;
    })
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY };
      hoverIndex.value = thisIndex + e.translationY / calendarIndividualHeight;
    })
    .onEnd((e) => {
      isDragging.value = false;
      hoverIndex.value = null;
      movingIndex.value = null;
      activeGroupIndex.value = null;
      // Tell the main thread to move the data
      // onDrop(cal.calendarId, e.absoluteY);
      offset.value = withSpring({ x: 0, y: 0 });
    });

  //for animated view
  const animatedStyle = useAnimatedStyle(() => {
    // If this item is the one being dragged:
    if (isDragging.value) {
      return {
        transform: [{ translateX: offset.value.x }, { translateY: offset.value.y }, { scale: 1.05 }],
        zIndex: 1000,
        opacity: 0.8,
      };
    }

    // Move Calendars around the dynamic calendar
    let translateY1 = 0;
    let translateY2 = 0;

    if (hoverIndex.value !== null) {
      const isAfterHover = thisIndex >= hoverIndex.value + homeGroupIndex * 2;

      if (isAfterHover) {
        translateY1 = calendarIndividualHeight;
      }
    }
    if (movingIndex.value !== null && activeGroupIndex.value !== null && homeGroupIndex === activeGroupIndex.value) {
      const isBeforeOriginal = thisIndex >= movingIndex.value;
      if (isBeforeOriginal) {
        translateY2 = -calendarIndividualHeight;
      }
    }

    return {
      transform: [{ translateY: withSpring(translateY1 + translateY2) }],
      zIndex: 1,
      opacity: 1,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { backgroundColor: 'white' }]}>
        <CalendarDrawerList calendarObj={cal} onToggle={toggleCalendar} />
      </Animated.View>
    </GestureDetector>
  );
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
  //const [folderLayouts, setFolderLayouts] = useState<Record<string, { y: number; height: number }>>({});
  const [hoverInfo, setHoverInfo] = useState<{ groupID: String; index: number } | null>(null);

  const handleDrop = (calendarId: string, absoluteY: number) => {
    // Find which folder contains the Y coordinate
    const destination = Object.entries(folderLayouts.current).find(([id, layout]) => {
      return absoluteY >= layout.y && absoluteY <= layout.y + layout.height;
    });

    if (destination) {
      const [groupId] = destination;
      moveCalendar(calendarId, groupId);
    }
  };

  const folderLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const folderRefs = useRef<Record<string, View | null>>({});
  const hoverIndex = useSharedValue<number | null>(null);
  const movingIndex = useSharedValue<number | null>(null);
  const activeGroupIndex = useSharedValue<number | null>(null);

  const updateLayout = (groupId: string) => {
    folderRefs.current[groupId]?.measureInWindow((x, y, width, height) => {
      folderLayouts.current[groupId] = { y, height };
    });
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
          {groupedCalendars.map((group, groupIndex) => (
            <View key={group.id} style={{}} onLayout={() => updateLayout(group.id)}>
              {/* --- FOLDER HEADER --- */}
              <Text style={styles.sectionHeaderText}>{group.id}</Text>

              {/* --- List of Calendars --- */}
              {group.calendars.length > 0 ? (
                group.calendars.map((cal, index) => (
                  <DraggableCalendar
                    key={cal.calendarId}
                    cal={cal}
                    thisIndex={index}
                    homeGroupId={group.id}
                    homeGroupIndex={groupIndex}
                    onDrop={handleDrop}
                    toggleCalendar={toggleCalendar}
                    hoverIndex={hoverIndex}
                    movingIndex={movingIndex}
                    activeGroupIndex={activeGroupIndex}
                  />
                ))
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
  sectionHeaderText: { marginTop: 10, fontSize: 13, fontWeight: '600', height: calendarHeaderHeight },
});
