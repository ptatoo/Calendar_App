import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CalendarDrawerList({
  calendarObj,
  onToggle,
}: {
  calendarObj: calendarObj;
  onToggle: (calendarId: string) => void;
}) {
  return (
    <View key={calendarObj.calendarId} style={styles.calendarItem}>
      {/* --- SQURAE AND NAME --- */}
      <View style={styles.calendarInfo}>
        <View style={[styles.colorSquare, { backgroundColor: calendarObj.calendarCustomColor || calendarObj.calendarDefaultColor }]} />
        <Text style={styles.calendarName} numberOfLines={1}>
          {calendarObj.calendarName}
        </Text>
      </View>

      {/* --- TOGGLE EYE ICON --- */}
      <Pressable
        onPress={() => {
          onToggle(calendarObj.calendarId);
        }}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
      >
        <Ionicons name={calendarObj.shown ? 'eye-outline' : 'eye-off-outline'} size={20} color={calendarObj.shown ? '#333' : '#ccc'} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  calendarListContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 1,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  iconButton: {
    padding: 4,
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
});
