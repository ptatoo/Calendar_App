import { useInvites } from '@/hooks/useInvites';
import { useProfiles } from '@/hooks/useProfile';

import { ProfileObj } from '@/utility/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../contexts/auth-context';
import { EventsContext } from '../contexts/calendar-events-context';
import { ProfileRow } from './profile-row';

export default function InviteManager() {
  const { jwtToken } = useContext(AuthContext);
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const { calendarObjs } = useContext(EventsContext);
  const { receivedInvites, sentInvites, isLoading, sendInvite, acceptInvite } = useInvites(jwtToken?.sessionToken ?? null);

  const [emailInput, setEmailInput] = useState('');
  const [sendError, setSendError] = useState(false);

  const handleSend = async () => {
    setSendError(false);
    const success = await sendInvite(emailInput);
    if (success) {
      setEmailInput('');
    } else {
      setSendError(true);
    }
  };

  // Helper to render a profile row (used for Sent and Received)
  const renderProfileRow = (item: ProfileObj, type: 'sent' | 'received') => (
    <View style={styles.card} key={item.id}>
      <View style={styles.profileInfo}>
        <Text style={styles.nameText}>{item.name || 'Pending User'}</Text>
        <Text style={styles.emailText}>{item.email}</Text>
      </View>
      {type === 'received' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.miniButton, styles.acceptButton]} onPress={() => acceptInvite(item.email)}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 1. SEND INVITE SECTION */}
      <Text style={styles.sectionTitle}>Invite a Family Member</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          value={emailInput}
          onChangeText={(val) => {
            setEmailInput(val);
            if (sendError) setSendError(false);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      {sendError && <Text style={styles.errorText}>Could not send invite. Check the email or user status.</Text>}

      {isLoading && <ActivityIndicator color="#2563EB" style={{ marginVertical: 10 }} />}

      {/* 2. RECEIVED INVITES */}
      {receivedInvites.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pending for You</Text>
          {receivedInvites.map((item) => (
            <ProfileRow
              key={item.id}
              item={item}
              type="received"
              onAccept={acceptInvite}
              onDecline={(email) => console.log('Decline', email)}
            />
          ))}
        </>
      )}

      {/* 3. SENT INVITES */}
      {sentInvites.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Invites Sent</Text>
          {sentInvites.map((item) => renderProfileRow(item, 'sent'))}
        </>
      )}

      {/* 4. CHILDREN (ACCEPTED CALENDARS) */}
      <Text style={styles.sectionTitle}>Connected Calendars</Text>
      {familyProfiles && familyProfiles.children.length > 0 ? (
        familyProfiles.children.map((cal) => (
          <View key={cal.name} style={styles.childCard}>
            <Text style={styles.childName}>{cal.email}</Text>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No connected family members yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 45 },
  sendButton: { backgroundColor: '#2563EB', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 20 },
  sendButtonText: { color: 'white', fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  profileInfo: { flex: 1 },
  nameText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  emailText: { fontSize: 12, color: '#6B7280' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  miniButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  acceptButton: { backgroundColor: '#10B981' },
  buttonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  childCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#ECFDF5', borderRadius: 10, marginBottom: 8 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  childName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#065F46' },
  emptyText: { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' },
});
