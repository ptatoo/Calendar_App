import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ThemeButton = ({
  option,
  index,
  activeTheme,
  setActiveTheme,
}: {
  option: string;
  index: number;
  activeTheme: number;
  setActiveTheme: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const isActive = activeTheme === index;

  return (
    <Pressable
      key={option}
      onPress={() => setActiveTheme(index)}
      style={({ pressed }) => [
        styles.segment,
        isActive && styles.activeSegment,
        pressed && styles.pressedSegment, // Subtle visual cue when finger is down
      ]}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{option}</Text>
    </Pressable>
  );
};

export default function AppearanceContainer() {
  const themeOptions = ['Light', 'Dark', 'Auto'];
  const [activeTheme, setActiveTheme] = useState(0);

  return (
    <View style={styles.container}>
      {/* --- THEME --- */}
      <Text style={styles.headerText}>Theme</Text>
      <View style={styles.themeContainer}>
        {themeOptions.map((option, index) => (
          <ThemeButton option={option} index={index} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        ))}
      </View>

      <Text style={styles.headerText}>Colors</Text>
      <Text style={styles.headerText}>EventBlock</Text>
      <Text style={styles.headerText}>SideBar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  headerText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
    paddingBottom: 10,
  },
  themeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    height: 35,
    marginBottom: 10,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegment: {
    backgroundColor: '#FFFFFF',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Shadow
    elevation: 3,
  },
  pressedSegment: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  activeText: {
    color: '#111827',
    fontWeight: '700',
  },
});
