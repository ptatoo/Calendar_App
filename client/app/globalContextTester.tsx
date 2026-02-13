import { useAccessToken } from "@/hooks/useAccessToken";
import { useCalendar } from "@/hooks/useCalendar";
import { useProfiles } from "@/hooks/useProfile";
import { normalizeEvent } from "@/utility/eventUtils";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function ContextTester420() {
  const authProps = useAuth();
  const profileProps = useProfiles(authProps.jwtToken?.sessionToken || null);
  const accessTokenProps = useAccessToken(
    authProps.jwtToken?.sessionToken || null,
  );
  const calendarProps = useCalendar(
    accessTokenProps.familyAccessTokens?.parent.accessToken ?? null,
  );

  return (
    <ScrollView>
      <Pressable style={styles.button} onPress={profileProps.refetch}>
        <Text style={styles.buttonText}>profile</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={calendarProps.refetch}>
        <Text style={styles.buttonText}>calendar</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={accessTokenProps.refetch}>
        <Text style={styles.buttonText}>access</Text>
      </Pressable>
      <Text style={styles.display}>{JSON.stringify(authProps.jwtToken)}</Text>
      <Text style={styles.display}>
        {JSON.stringify(profileProps.familyProfiles)}
      </Text>
      <Text style={styles.display}>
        {JSON.stringify(accessTokenProps.familyAccessTokens)}
      </Text>
      <Text style={styles.display}>
        {calendarProps.events
          ? calendarProps.events.items
              .map((item: any) => JSON.stringify(normalizeEvent(item), null, 2))
              .join("\n\n")
          : "asdf"}
      </Text>
    </ScrollView>
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

  display: {
    padding: 12,
    backgroundColor: "#ff8989",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
  },
  displayText: {
    color: "white",
    fontWeight: "600",
  },
});
