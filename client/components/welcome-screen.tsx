import { COLORS, FONT_WEIGHTS, SIZES } from '@/utility/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useAuth } from './contexts/auth-context';

export default function WelcomeScreen() {
  const authProps = useAuth();

  return (
    <>
      <View style={styles.homepg}>
        {/* calendar icon */}
        <View style={styles.logoContainer}>
          <Animated.View entering={FadeInUp.duration(600).delay(600)} style={styles.iconCircle}>
            <MaterialCommunityIcons name="calendar-month" size={60} color="#4285F4" />
          </Animated.View>
          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <Text style={styles.appName}>Calendar App</Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.duration(600).delay(400)}>
            <Text style={styles.appDescription}>insert description</Text>
          </Animated.View>
        </View>

        {/* --- login button --- */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => authProps.promptAsync()}
            disabled={false}
          >
            {authProps.isLoading ? (
              <Text style={styles.buttonText}>Loading...</Text>
            ) : authProps.jwtToken ? (
              <Text style={styles.buttonText}>Welcome Back</Text>
            ) : (
              <Text style={styles.buttonText}>Sign in with Google</Text>
            )}
          </Pressable>
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
    justifyContent: 'center',
    alignItems: 'center',
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
});
