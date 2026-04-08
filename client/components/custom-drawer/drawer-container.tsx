import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useMemo, useRef } from 'react';
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
const calendarHeaderHeight = 36;

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
  thisIndex,
  hoverIndex,
  activeIndex,
}: {
  cal: {
    id: string;
    folder: boolean;
    calendar: calendarObj | null;
  };
  onDrop: (thisIndex: number, hoverIndex: number) => void;
  toggleCalendar: (id: string) => void;
  thisIndex: number;
  hoverIndex: SharedValue<number | null>;
  activeIndex: SharedValue<number | null>;
}) {
  const isDragging = useSharedValue(false);
  const offset = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      isDragging.value = true;
      activeIndex.value = thisIndex;
      hoverIndex.value = thisIndex;
    })
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY };
      hoverIndex.value = thisIndex + e.translationY / calendarIndividualHeight;
    })
    .onEnd((e) => {
      onDrop(thisIndex, hoverIndex.value ? Math.round(hoverIndex.value - 1) : 0);
      isDragging.value = false;
      hoverIndex.value = null;
      activeIndex.value = null;
      // Tell the main thread to move the data
      offset.value = withSpring({ x: 0, y: 0 });
    });

  //for animated view
  const animatedStyle = useAnimatedStyle(() => {
    // If this item is the one being dragged:
    if (isDragging.value) {
      return {
        transform: [{ translateX: 0 }, { translateY: offset.value.y }, { scale: 1.0 }],
        zIndex: 1000,
        opacity: 1,
      };
    }

    // Move Calendars around the dynamic calendar
    let translateY1 = 0;
    let translateY2 = 0;

    if (hoverIndex.value === null) {
      return {
        transform: [{ translateY: 0 }],
        width: '100%',
        zIndex: 1,
        opacity: 1,
      };
    }

    //If the calendar is above us, move down
    if (hoverIndex.value !== null) {
      const isAfterHover = thisIndex >= hoverIndex.value;
      if (isAfterHover) translateY1 = calendarIndividualHeight;
    }
    //If the calendar is within the OG one and below us, move up
    if (activeIndex.value !== null) {
      const isBeforeOriginal = thisIndex >= activeIndex.value;
      if (isBeforeOriginal) translateY2 = -calendarIndividualHeight;
    }

    return {
      transform: [{ translateY: withSpring(translateY1 + translateY2) }],
      width: '100%',
      zIndex: 1,
      opacity: 1,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { backgroundColor: 'white' }]}>
        {cal.calendar !== null ? (
          <CalendarDrawerList calendarObj={cal.calendar} onToggle={toggleCalendar} />
        ) : (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Ionicons name={'folder-outline'} size={14} />
            <Text style={styles.sectionHeaderText}>{toTitleCase(cal.id)}</Text>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function CustomDrawerContent(props: any) {
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { familyProfiles, setCalendarObj, groupedCalendars, updateSingleGroup } = useContext(EventsContext);
  const { setLoginVisible } = useContext(UIContext);

  const groupSizes: number[] = useMemo(() => {
    return groupedCalendars.map((cal) => {
      return cal.calendars.length;
    });
  }, [groupedCalendars]);

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

  const handleDropOld = (thisIndex: number, newIndex: number): void => {
    let originalGroupIndex = 0;
    let newGroupIndex = 0;
    flatData.map((data, index) => {
      if (index < thisIndex && data.folder === true) originalGroupIndex += 1;
      if (index < newIndex && data.folder === true) newGroupIndex += 1;
    });

    //shifted around in same group
    if (originalGroupIndex === newGroupIndex) {
      let inCorrectGroup = false;
      const group = groupedCalendars[originalGroupIndex];
      const newGroup: { id: string; calendars: calendarObj[] } = { id: group.id, calendars: [] };

      flatData.map((data, index) => {
        if (data.folder === true && data.id === group.id) inCorrectGroup = true;
        else inCorrectGroup = false;
        //moves the event to new position
        if (inCorrectGroup && index === newIndex && flatData[thisIndex].calendar) newGroup.calendars.push(flatData[thisIndex].calendar);
        if (inCorrectGroup && data.calendar) newGroup.calendars.push(data.calendar);
      });
      const temp = { ...flatData[thisIndex] };
      flatData[thisIndex] = flatData[newIndex];
      flatData[newIndex] = temp;
    }

    console.log(flatData);
  };

  const handleDrop = (thisIndex: number, newIndex: number): void => {
    const movingItem = flatData[thisIndex];
    if (!movingItem || movingItem.folder || !movingItem.calendar) return;

    // 1. Identify Source and Destination Folders
    let currentGroupIdx = -1;
    let sourceGroupIdx = -1;
    let destGroupIdx = -1;

    flatData.forEach((item, idx) => {
      if (item.folder) currentGroupIdx++;
      if (idx === thisIndex) sourceGroupIdx = currentGroupIdx;
      if (idx === newIndex) destGroupIdx = currentGroupIdx;
    });

    const sourceGroup = groupedCalendars[sourceGroupIdx];
    const destGroup = groupedCalendars[destGroupIdx];

    // 2. Remove from Source Group
    const updatedSourceCals = sourceGroup.calendars.filter((c) => c.calendarId !== movingItem.calendar?.calendarId);

    // 3. Insert into Destination Group
    const updatedDestCals =
      sourceGroup.id === destGroup.id
        ? [...updatedSourceCals] // If same group, start with the filtered list
        : [...destGroup.calendars];

    // Calculate relative index within the destination folder
    let targetRelIndex = 0;
    let foundTargetFolder = false;
    for (let i = 0; i <= newIndex; i++) {
      const item = flatData[i];
      if (item.folder && item.id === destGroup.id) {
        foundTargetFolder = true;
        targetRelIndex = 0;
      } else if (foundTargetFolder && !item.folder) {
        targetRelIndex++;
      }
    }

    updatedDestCals.splice(targetRelIndex, 0, movingItem.calendar);

    // 4. Update the Context
    if (sourceGroup.id === destGroup.id) {
      // Case A: Moved within the same folder
      updateSingleGroup(destGroup.id, updatedDestCals);
    } else {
      // Case B: Moved to a different folder
      // We update both in one go to prevent two separate render cycles
    }
  };

  const folderLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const hoverIndex = useSharedValue<number | null>(null);
  const activeIndex = useSharedValue<number | null>(null);

  const flatData = useMemo(() => {
    return groupedCalendars.flatMap((group) => [
      { id: group.id, folder: true, calendar: null as calendarObj | null },
      ...group.calendars.map((cal) => {
        return { id: group.id, folder: false, calendar: cal as calendarObj | null };
      }),
    ]);
  }, [groupedCalendars]);
  console.log(flatData);

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
          {flatData.map((data, index) => (
            <DraggableCalendar
              key={data.folder ? `folder-${data.id}` : `cal-${data.calendar?.calendarId}`}
              cal={data}
              onDrop={handleDrop}
              toggleCalendar={toggleCalendar}
              thisIndex={index}
              hoverIndex={hoverIndex}
              activeIndex={activeIndex}
            />
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
  sectionHeaderText: { fontSize: 13, fontWeight: '600', height: calendarHeaderHeight, borderWidth: 1 },
});
