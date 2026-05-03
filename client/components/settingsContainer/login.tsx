import {} from '@/hooks/useAuth';
import { toTitleCase } from '@/utility/drawerUtil';
import { globalStyles } from '@/utility/globalStyles';
import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EventsContext } from '../contexts/calendar-events-context';
import { useAuth } from '../contexts/auth-context';

export default function LoginButton() {
  const authProps = useAuth();
  const { familyProfiles } = useContext(EventsContext);

  return (
    <>
      <View style={styles.homepg}>
        {/* --- profile --- */}
        <View style={globalStyles.rowHeader}>
          <Text style={globalStyles.headerText}>Profile</Text>
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.profileIconContainer}></View>
          <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
            <View>
              <Text style={styles.username}>
                {familyProfiles && familyProfiles.parent ? toTitleCase(familyProfiles.parent.name) : 'Username'}
              </Text>
              <Text style={styles.email}>{familyProfiles && familyProfiles.parent ? familyProfiles.parent.email : 'Email'}</Text>
            </View>
          </View>
        </View>
        {/* --- login / logout buttons --- */}
        <View style={styles.buttonContainer}>
          {authProps.jwtToken ? (
            <Pressable
              style={({ pressed }) => [styles.button, styles.logoutButton, pressed && styles.buttonPressed]}
              // Make sure your useAuth hook exports a logout/clear token method!
              onPress={() => authProps.logout && authProps.logout()}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, authProps.isLoading && styles.buttonDisabled]}
              onPress={() => authProps.promptAsync()}
              disabled={authProps.isLoading}
            >
              <Text style={styles.buttonText}>{authProps.isLoading ? 'Loading...' : 'Sign in with Google'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
    marginTop: 5,
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#ebf4ff', // light blue background
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  appDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },
  button: {
    paddingVertical: 16,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#A0C2F9',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // hidden styles
  tokenContainer: { flexDirection: 'row' },
  label: { padding: 12 },
  tokenText: { padding: 12 },
  logoutButton: {
    backgroundColor: '#EA4335', // Google Red for the logout action
  },
});
