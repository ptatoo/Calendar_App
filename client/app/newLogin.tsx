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
      <Text>{authProps.jwtToken ? authProps.jwtToken.sessionToken : "asdf"}</Text>
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
});
