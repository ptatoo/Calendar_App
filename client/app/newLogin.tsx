import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAccessToken } from "../hooks/useAccessToken";
import { useAuth } from "../hooks/useAuth";
import { useProfiles } from "../hooks/useProfile";

export default function LoginButton() {
  const { jwtToken, isLoading, error, request, promptAsync } = useAuth();
  const profileProps = useProfiles(jwtToken?.sessionToken || null);
  const accessTokenProps = useAccessToken(jwtToken?.sessionToken || null);

  return (
    <View style={styles.homepg}>
      <Pressable
        style={styles.button}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        {isLoading ? (
          <Text style={styles.buttonText}> loading </Text>
        ) : jwtToken ? (
          <Text style={styles.buttonText}> logged in as f </Text>
        ) : (
          <Text style={styles.buttonText}> login pls. </Text>
        )}
      </Pressable>
      <Text>{jwtToken ? jwtToken.sessionToken : "asdf"}</Text>
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
