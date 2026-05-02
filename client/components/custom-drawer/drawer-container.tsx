import { calendarObj } from '@/utility/types';
import { useContext, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

//Global Contexts
import { AuthContext } from '../contexts/auth-context';
import { EventsContext } from '../contexts/calendar-events-context';
import { UIContext } from '../contexts/ui-context';

import { toTitleCase } from '@/utility/drawerUtil';
import DraggableCalendar from './drawer-draggable-calendar';

export default function CustomDrawerContent(props: any) {
  // All hooks must be called at the top level before any other code
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const { familyProfiles, setCalendarObj, groupedCalendars, updateSingleGroup, updateMultipleGroups } = useContext(EventsContext);
  const { setLoginVisible } = useContext(UIContext);
  const hoverIndex = useSharedValue<number | null>(null);
  const activeIndex = useSharedValue<number | null>(null);

  //Both Folders and Calendars are mapped to Draggable Flatlist in flatData
  const flatData = useMemo(() => {
    return groupedCalendars.flatMap((group) => [
      { id: group.id, folder: true, calendar: null as calendarObj | null },
      ...group.calendars.map((cal) => {
        return { id: group.id, folder: false, calendar: cal as calendarObj | null };
      }),
    ]);
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
    setLoginVisible(true);
    props.navigation.closeDrawer();
  };

  const handleDrop = (thisIndex: number, newIndex: number): void => {
    const movingItem = flatData[thisIndex];
    if (!movingItem || movingItem.folder || !movingItem.calendar) return;

    // Identify Source and Destination Folders
    let currentGroupIdx = -1;
    let sourceGroupIdx = -1;
    let destGroupIdx = -1;

    flatData.forEach((item, idx) => {
      if (item.folder) currentGroupIdx++;
      if (idx === thisIndex) {
        sourceGroupIdx = currentGroupIdx;
      }
      if (idx === newIndex - 1 && thisIndex > newIndex) destGroupIdx = currentGroupIdx;
      if (idx === newIndex && thisIndex <= newIndex) destGroupIdx = currentGroupIdx;
    });

    const sourceGroup = groupedCalendars[sourceGroupIdx];
    const destGroup = groupedCalendars[destGroupIdx];

    // Remove from Source Group
    const updatedSourceCals = sourceGroup.calendars.filter((c) => c.calendarId !== movingItem.calendar?.calendarId);

    // Insert into Destination Group
    const updatedDestCals =
      sourceGroup.id === destGroup.id
        ? [...updatedSourceCals] // If same group, start with the filtered list
        : [...destGroup.calendars];

    // Calculate relative index within the destination folder
    let targetRelIndex = 0;
    let foundTargetFolder = false;
    for (let i = 0; i < newIndex; i++) {
      const item = flatData[i];
      if (item.folder && item.id === destGroup.id) {
        foundTargetFolder = true;
        targetRelIndex = 0;
        continue;
      }
      if (foundTargetFolder && !item.folder) {
        targetRelIndex += 1;
      }
    }
    updatedDestCals.splice(targetRelIndex, 0, movingItem.calendar);

    // Update the Context
    if (sourceGroup.id === destGroup.id) {
      updateSingleGroup(destGroup.id, updatedDestCals);
    } else {
      updateMultipleGroups([
        { groupId: sourceGroup.id, newCalendars: updatedSourceCals },
        { groupId: destGroup.id, newCalendars: updatedDestCals },
      ]);
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
});
