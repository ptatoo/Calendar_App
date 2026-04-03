import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Option = { label: string; value: string };

export default function DropdownMenu({
  options,
  selected,
  onSelect,
}: {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <Pressable style={styles.toggle} onPress={() => setVisible(true)}>
        <Text style={styles.toggleText}>{selected}</Text>
      </Pressable>

      {/* Overlay & Menu */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                style={styles.item}
                onPress={() => {
                  onSelect(opt.value);
                  setVisible(false);
                }}
              >
                <Text style={styles.itemText}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 9999 },
  toggle: { padding: 8, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 4, backgroundColor: 'white' },
  toggleText: { fontSize: 14, color: '#111827' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  menu: { backgroundColor: 'white', borderRadius: 8, padding: 4, width: 200, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemText: { fontSize: 14, color: '#111827' },
});