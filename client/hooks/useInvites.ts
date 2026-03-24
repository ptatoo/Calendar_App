import {
  getInviteMyInvites,
  getInviteSentInvites,
  postInviteAccept,
  postInviteAdd
} from '@/services/api';
import { ProfileObj } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useInvites = (jwtToken: string | null) => {
  const [receivedInvites, setReceivedInvites] = useState<ProfileObj[]>([]);
  const [sentInvites, setSentInvites] = useState<ProfileObj[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- fetch pending invites ---
  const refreshInvites = useCallback(async () => {
    if (!jwtToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const [received, sent] = await Promise.all([
        getInviteMyInvites(jwtToken),
        getInviteSentInvites(jwtToken)
      ]);
      setReceivedInvites(received || []);
      setSentInvites(sent || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);

  useEffect(() => {
    refreshInvites();
  }, [refreshInvites, jwtToken]);

  // --- SEND INVITE ---
  const sendInvite = async (email: string) => {
    if (!jwtToken) return;
    try {
      const result = await postInviteAdd(jwtToken, email);
      if (result.error === 'USER_NOT_FOUND') {
        Alert.alert("User Not Found", "This person hasn't joined the app yet!");
        return false;
      }
      Alert.alert("Success", `Invite sent to ${email}`);
      refreshInvites(); // Refresh pending invites
      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to send invitation");
      return false;
    }
  };

  // --- ACCEPT INVITE ---
  const acceptInvite = async (email: string) => {
    if (!jwtToken) return;
    try {
    console.log("trying to accept");
      const result = await postInviteAccept(jwtToken, email);
      Alert.alert("Accepted", `You now have access to ${email}'s calendar.`);
      refreshInvites(); // Refresh pending invites
      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to accept invitation");
      return false;
    }
  };

  return {
    receivedInvites,
    sentInvites,
    isLoading,
    error,
    refreshInvites,
    sendInvite,
    acceptInvite
  };
};