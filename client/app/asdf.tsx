import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCalendar } from "@/hooks/useCalendar";
import { storage } from "@/services/storage";

export default function Idk() {
  const calendarProps = useCalendar(storage.get('access_tokens').parent.accessToken);

  return (
    <View style={styles.homepg}>
        <Pressable
        style={styles.button}
        onPress={() => calendarProps.refetch()}
        >
        {calendarProps.isLoading ? (
            <Text style={styles.buttonText}> loading </Text>
        ) : calendarProps.events ? (
            <Text style={styles.buttonText}> calendar gotten</Text>
        ) : (
            <Text style={styles.buttonText}> get calendar </Text>
        )}
        </Pressable>
        <Text>
            {JSON.stringify(calendarProps.events)}
        </Text>
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
