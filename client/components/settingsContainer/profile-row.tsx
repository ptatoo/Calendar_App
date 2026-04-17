import { ProfileObj } from '@/utility/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ProfileRowProps {
  item: ProfileObj;
  type: 'sent' | 'received';
  onAccept?: (email: string) => void;
  onDecline?: (email: string) => void;
  onCancel?: (email: string) => void;
}

export const ProfileRow = ({ item, type, onAccept, onDecline, onCancel }: ProfileRowProps) => {
  return (
    <View style={styles.card}>
      {/* --- INVITATION INFO --- */}
      <View style={styles.profileInfo}>
        <Text style={styles.nameText}>{item.name || 'Pending User'}</Text>
        <Text style={styles.emailText}>{item.email}</Text>
      </View>

      {/* --- ACCEPT AND DECLINE --- */}
      <View style={styles.actionButtons}>
        {type === 'received' ? (
          <>
            <Pressable
              style={({ pressed }) => [styles.miniButton, styles.declineButton, pressed && styles.pressed]}
              onPress={() => onDecline?.(item.email)}
            >
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.miniButton, styles.acceptButton, pressed && styles.pressed]}
              onPress={() => onAccept?.(item.email)}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.miniButton, styles.cancelButton, pressed && styles.pressed]}
            onPress={() => onCancel?.(item.email)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  profileInfo: { flex: 1 },
  nameText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  emailText: { fontSize: 12, color: '#6B7280' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  miniButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  acceptButton: { backgroundColor: '#10B981' },
  declineButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB' },
  cancelButton: { backgroundColor: '#FEE2E2' },
  buttonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  declineText: { color: '#374151', fontSize: 12, fontWeight: '500' },
  cancelText: { color: '#EF4444', fontSize: 12, fontWeight: '500' },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }], // Adds a tiny "push" effect
  },
});
