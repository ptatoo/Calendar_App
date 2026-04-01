import { calendarObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { UIContext } from '../contexts/ui-context';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const menuHeight = 100;
const menuWidth = 150;

export default function CalendarDrawerList({
  calendarObj,
  onToggle,
}: {
  calendarObj: calendarObj;
  onToggle: (calendarId: string) => void;
}) {
  const [isVisible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);

  const openMenu = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const padding = 10;

      // --- VERTICAL LOGIC (Y) ---
      const showAbove = y + height + menuHeight > screenHeight - padding;
      let top = showAbove ? y - menuHeight : y + height;

      // SAFETY: Don't let it go above the top of the screen (Status Bar)
      // or below the bottom of the screen
      top = Math.max(padding + 40, top); // 40px extra for the notch/status bar
      top = Math.min(top, screenHeight - menuHeight - padding);

      // --- HORIZONTAL LOGIC (X) ---
      // If the button's pageX is negative (drawer issue), we treat it as 0
      const safeX = Math.max(0, x);

      let left = safeX + width - menuWidth;

      // SAFETY: Don't let it go off the left or right edges
      left = Math.max(padding, left);
      left = Math.min(left, screenWidth - menuWidth - padding);

      setMenuPos({
        top: top,
        left: Math.max(10, left), // Ensure it doesn't go off-screen left
      });
      setVisible(true);
    });
  };

  const {
    isLoginVisible,
    setLoginVisible,
    colors,
    allCaches,
    activeCacheId,
    updateColors,
    changePalette,
    syncCacheToPalette,
    setManualCalendarColor,
    getCalendarColor,
  } = useContext(UIContext);

  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(getCalendarColor(calendarObj.calendarId));
  }, [allCaches, activeCacheId]);

  return (
    <View key={calendarObj.calendarId} style={styles.calendarItem}>
      {/* --- SQURAE AND NAME --- */}
      <View style={styles.calendarInfo}>
        <View
          style={[
            styles.colorSquare,
            {
              backgroundColor: color || calendarObj.calendarDefaultColor,
              opacity: calendarObj.shown ? 1 : 0.5,
            },
          ]}
        />
        <Text style={[styles.calendarName, { opacity: calendarObj.shown ? 1 : 0.5 }]} numberOfLines={1}>
          {calendarObj.calendarName}
        </Text>
      </View>

      {/* --- BUTTONS --- */}
      <View style={{ flexDirection: 'row' }}>
        {/* --- SETTINGS BUTTON --- */}
        <View ref={buttonRef} collapsable={false}>
          <Pressable onPress={openMenu} style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}>
            <Ionicons name={'ellipsis-horizontal-outline'} size={14} color={calendarObj.shown ? '#333' : '#ccc'} />
          </Pressable>
        </View>
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
                top: menuPos.top,
                left: menuPos.left,
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

        {/* --- VISIBILITY TOGGLE --- */}
        <Pressable
          onPress={() => {
            onToggle(calendarObj.calendarId);
          }}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
        >
          <Ionicons name={calendarObj.shown ? 'eye-outline' : 'eye-off-outline'} size={14} color={calendarObj.shown ? '#333' : '#ccc'} />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  iconButton: {
    padding: 4,
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
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
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 4 },
});
