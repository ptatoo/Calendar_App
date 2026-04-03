import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CalendarSettingsModal(isVisible: boolean, setVisible: React.Dispatch<React.SetStateAction<boolean>>) {
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
              top: 0,
              left: 0,
            },
          ]}
        >
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setManualCalendarColor(calendarObj.calendarId, '#a0c4ff');
            }}
          >
            <Text>Set color BLUE</Text>
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
    backgroundColor: '#eeeeee',
    borderRadius: 8,
    padding: 5,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    minWidth: 150,
  },
  menuItem: { padding: 12 },
});
