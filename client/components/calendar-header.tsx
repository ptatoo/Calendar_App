import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateContext } from './contexts/calendar-context';

import { HEADER_BACKGROUND_COLOR } from '@/utility/constants';

export default function CalendarHeader(props: any) {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { curDate, setCurDate } = useContext(DateContext);
  const handleSnapToToday = () => {
    const today = new Date();
    setCurDate(today); // update global context
  };

  return (
    <View style={styles.headerContainer}>
      {/* --- Waffle --- */}
      <View style={{ justifyContent: 'center' }}>
        <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.waffle}>
          <Ionicons name="menu" size={28} color="black" />
        </Pressable>
      </View>

      {/* --- Date --- */}
      <View style={{ justifyContent: 'center' }}>
        <Text style={{ fontWeight: 500, fontSize: 22 }}>{curDate.toLocaleString('default', { month: 'long' })}</Text>
      </View>

      {/* --- Extra Buttons on the Right --- */}
      <View style={styles.headerButtonContainer}>
        <Pressable style={styles.headerButton} onPress={handleSnapToToday}>
          <Text style={{ fontWeight: 500, fontSize: 16 }}>{currentDate.toLocaleString('default', { day: 'numeric' })}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 66,
    flexDirection: 'row',
    backgroundColor: HEADER_BACKGROUND_COLOR,
    padding: 16,
    paddingRight: 24,
    gap: 10,
    alignItems: 'stretch',
  },
  waffle: {
    alignSelf: 'flex-start',
  },
  headerButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    padding: 2,
    gap: 10,
  },
  headerButton: {
    backgroundColor: '#77a7f7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    fontWeight: '700',

    // --- iOS Shadows ---
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Moves shadow down 2px
    shadowOpacity: 0.1, // 10% transparency (the "cute" secret)
    shadowRadius: 4, // How blurry it is

    // --- Android Shadows ---
    elevation: 3, // Only controls "depth" on Android
  },
});
