import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [data, setData] = useState<string>("");

  // --- STATE ---
  const displayProfile = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("profile");
      console.log(jsonValue != null ? jsonValue : "null");
      setData(jsonValue != null ? jsonValue : "null");
    } catch (err) {
      console.error(err);
    }
  };

  const displayAccessToken = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("access_token");
      console.log(jsonValue != null ? jsonValue : "null");
      setData(jsonValue != null ? jsonValue : "null");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View>
      <Text>{data}</Text>

      <Pressable onPress={() => displayProfile()} style={styles.btnPrimary}>
        <Text style={styles.btnText}>Display Profile From Storage</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    paddingBottom: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Buttons
  btnPrimary: {
    backgroundColor: "#4285F4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 5,
  },
  btnSecondary: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 5,
    marginTop: 5,
  },
  btnAction: {
    backgroundColor: "#34A853",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnDestructive: {
    backgroundColor: "#EA4335",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
  btnTextBlack: {
    color: "black",
    fontWeight: "600",
  },

  // Code Display
  codeBlock: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 5,
    minHeight: 50,
  },
  code: {
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: 10,
  },
  codeSmall: {
    color: "#555",
    fontFamily: "monospace",
    fontSize: 10,
    backgroundColor: "#eee",
    padding: 5,
  },
});
