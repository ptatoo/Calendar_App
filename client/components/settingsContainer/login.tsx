import { toTitleCase } from '@/utility/drawerUtil';
import { globalStyles } from '@/utility/globalStyles';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/auth-context';
import { useCalendarEvents } from '../contexts/calendar-events-context';
import SharedCalendars from './shared-calendars';

export default function Login() {
  const authProps = useAuth();
  const { familyProfiles } = useCalendarEvents();

  return (
    <ScrollView style={styles.homepg} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* --- profile --- */}
      <View style={styles.profileContainer}>
        <View style={styles.profileIconContainer}></View>
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Text style={styles.username}>
            {familyProfiles && familyProfiles.parent ? toTitleCase(familyProfiles.parent.name) : 'Username'}
          </Text>
          <Text style={styles.email}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.email : 'Email'}</Text>
        </View>
      </View>
      {/* --- logout button --- */}
      <View style={styles.buttonContainer}>
        {authProps.jwtToken && (
          <Pressable
            style={({ pressed }) => [styles.button, styles.logoutButton, pressed && globalStyles.pressedButton]}
            onPress={() => authProps.logout && authProps.logout()}
          >
            <Ionicons name={'log-out-outline'} style={styles.buttonText} size={20} />
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        )}
      </View>
      <SharedCalendars />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
  },
  profileContainer: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 15,
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
  },
  username: {
    fontSize: SIZES.l,
    marginBottom: 4,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  email: {
    fontSize: SIZES.s,
    color: COLORS.textLight,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 10,
    width: '80%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  buttonText: {
    color: COLORS.secondaryDark,
    fontSize: SIZES.l,
    fontWeight: FONT_WEIGHTS.medium,
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.secondaryLight,
  },
});
