import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAccessToken } from "../hooks/useAccessToken";
import { useAuth } from "../hooks/useAuth";
import { useProfiles } from "../hooks/useProfile";

export default function LoginButton() {
  const authProps = useAuth();
  useProfiles(authProps.jwtToken?.sessionToken || null);
  useAccessToken(authProps.jwtToken?.sessionToken || null);

  return (
    <View style={styles.homepg}>
      <Pressable
        style={styles.button}
        onPress={() => authProps.promptAsync()}
        disabled={!authProps.request}
      >
        {authProps.isLoading ? (
          <Text style={styles.buttonText}> loading </Text>
        ) : authProps.jwtToken ? (
          <Text style={styles.buttonText}> logged in as f </Text>
        ) : (
          <Text style={styles.buttonText}> login pls. </Text>
        )}
      </Pressable>

      <View style={styles.tokenContainer}>
        <Text style={styles.label}>JWT Token:</Text>
        <Text style={styles.tokenText}>
          {authProps.jwtToken ? authProps.jwtToken.sessionToken : "No token yet"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  button: {
    padding: 12,
    backgroundColor: "#4285F4",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  tokenText: {
    color: "#000000",
    fontWeight: "600",
    alignItems: "center",
    padding: 12,
  },
  tokenContainer: {
    flexDirection: "row", // Places items side-by-side
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden", // Ensures inner colored boxes don't spill outs
    backgroundColor: "white",
  },
  label: {
    backgroundColor: "#f0f0f0", // Light grey for the label background
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    justifyContent: "center",
  },
});
