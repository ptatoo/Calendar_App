import { EventObj } from '@/utility/types';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  event: EventObj | null;
  onClose: () => void;
}

export default function EventDetails({ isVisible, event, onClose }: Props) {
  if (!event) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Handles Android back button
    >
      <View style={styles.modalOverlay}>
        {/* --- TOUCHABLE AREA ABOVE SHEET --- */}
        <Pressable style={styles.dismissArea} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Visual Grab Handle */}
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{event.title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeX}>✕</Text>
            </Pressable>
          </View>

          <View>
            <Text style={styles.organizer}>Organized by {event.organizer}</Text>
            <Text style={styles.description}>{event.description}</Text>
            {/* Add more details like time, location, etc. here */}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1, // Takes up the top 2/3 of the screen
  },
  sheetContainer: {
    backgroundColor: 'white',
    height: SCREEN_HEIGHT / 3,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  closeX: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 10,
  },
  organizer: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});
