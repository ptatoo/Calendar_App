import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { UIContext } from '../contexts/ui-context';

export default function CalendarSettingsModal({
  isVisible,
  setVisible,
  calendar,
  top,
  left,
}: {
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  calendar: calendarObj;
  top: number;
  left: number;
}) {
  const { setManualCalendarColor } = useContext(UIContext);

  return (
    <>
      {/* --- SETTINGS MODAL --- */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setVisible(false);
        }} // Handles Android hardware back button
      >
        {/* --- BACKDROP BUTTON --- */}
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />

        {/* --- SETTINGS MENU BOX --- */}
        <View
          style={[
            styles.menuBox,
            {
              top: top,
              left: left,
            },
          ]}
        >
          {/* --- COLORS BUTTON --- */}
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.pressedButton]}
            onPress={() => {
              setManualCalendarColor(calendar.calendarId, '#a0c4ff');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={'color-palette-outline'} size={13} />
              <Text>Color</Text>
            </View>
            <View>
              <Ionicons name={'chevron-forward-outline'} size={13} />
            </View>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              /* logic */
            }}
          >
            <Text>Sync Now</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuBox: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 6,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 }, // 0 offset = equal on all sides
    shadowOpacity: 0.3,
    shadowRadius: 10, // Higher = softer, wider spread

    // Android Settings (Elevation is limited; use a library for better control)
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
});
