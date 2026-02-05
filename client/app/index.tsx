import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// --- CONFIG ---
const API_URL = "http://localhost:3001"; // Use 10.0.2.2 if using Android Emulator
const GOOGLE_CLIENT_ID = "198333533430-et6uu5nbtl7erbmc4rop3v55cprj4ts2.apps.googleusercontent.com"; // Your Client ID

// --- COMPONENTS ---

function LoginButton({
  setSessionToken,
}: {
  setSessionToken: (t: string) => void;
}) {
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      console.log("1. Google Code Received:", codeResponse.code);

      try {
        // Send code to backend
        const response = await fetch(`${API_URL}/api/google-exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(codeResponse), // Sends code, scope, etc.
        });

        const data = await response.json();
        console.log("2. Backend Response:", data);

        if (data.sessionToken) {
          setSessionToken(data.sessionToken);
          Alert.alert("Success", "Logged in & Session Token received!");
        } else {
          Alert.alert("Error", "No session token returned.");
        }
      } catch (error) {
        console.error("Login Failed:", error);
        Alert.alert("Error", "Failed to connect to backend");
      }
    },
    flow: "auth-code",
    scope:
      "https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
  });

  return (
    <Pressable style={styles.btnPrimary} onPress={() => login()}>
      <Text style={styles.btnText}>1. Login with Google</Text>
    </Pressable>
  );
}

export default function Index() {
  // --- STATE ---
  const [sessionToken, setSessionToken] = useState<string>("");
  const [childIdInput, setChildIdInput] = useState<string>("");
  
  // Storage for API outputs
  const [familyData, setFamilyData] = useState<any>(null);
  const [linkResult, setLinkResult] = useState<any>(null);

  // --- API HANDLERS ---

  // POST /api/get-family-data
  const handleGetFamily = async () => {
    if (!sessionToken) return Alert.alert("Error", "Log in first!");

    try {
      const response = await fetch(`${API_URL}/api/get-family-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      const json = await response.json();
      setFamilyData(json);
      console.log("Family Data:", json);
    } catch (e) {
      console.error(e);
      setFamilyData({ error: "Fetch failed" });
    }
  };

  // POST /api/link
  const handleLink = async () => {
    if (!sessionToken) return Alert.alert("Error", "Log in first!");
    if (!childIdInput) return Alert.alert("Error", "Enter a Child ID");

    try {
      // NOTE: Backend expects query params or body depending on your specific implementation
      // Assuming Query params based on your previous 'req.query.pId' logic, 
      // OR body if you updated to 'req.body'. Using Query here for safety based on history.
      const response = await fetch(
        `${API_URL}/api/link?cId=${childIdInput}`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      const json = await response.json();
      setLinkResult(json);
    } catch (e) {
      console.error(e);
      setLinkResult({ error: "Link failed" });
    }
  };

  // POST /delink
  const handleDelink = async () => {
    if (!sessionToken) return Alert.alert("Error", "Log in first!");
    if (!childIdInput) return Alert.alert("Error", "Enter a Child ID");

    try {
      const response = await fetch(
        `${API_URL}/api/delink?cId=${childIdInput}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );
      const json = await response.json();
      setLinkResult(json); // Reuse state for simplicity
    } catch (e) {
      console.error(e);
      setLinkResult({ error: "Delink failed" });
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Backend Tester</Text>

        {/* SECTION 1: AUTH */}
        <View style={styles.section}>
          <LoginButton setSessionToken={setSessionToken} />
          
          <Pressable
            style={styles.btnSecondary}
            onPress={() => console.log("Current JWT:", sessionToken)}
          >
            <Text style={styles.btnTextBlack}>Log JWT to Console</Text>
          </Pressable>

          <Text style={styles.label}>Current Session Token:</Text>
          <Text style={styles.codeSmall} numberOfLines={2}>
            {sessionToken || "Not logged in"}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* SECTION 2: FAMILY DATA */}
        <View style={styles.section}>
          <Pressable style={styles.btnAction} onPress={handleGetFamily}>
            <Text style={styles.btnText}>2. POST /get-family-data</Text>
          </Pressable>

          <Text style={styles.label}>Output:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>
              {familyData
                ? JSON.stringify(familyData, null, 2)
                : "No data fetched yet"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SECTION 3: LINKING */}
        <View style={styles.section}>
          <Text style={styles.label}>Child ID to Link/Delink:</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste a Google ID here..."
            value={childIdInput}
            onChangeText={setChildIdInput}
          />

          <View style={styles.row}>
            <Pressable style={[styles.btnAction, {flex: 1}]} onPress={handleLink}>
              <Text style={styles.btnText}>3. Link ID</Text>
            </Pressable>
            <View style={{width: 10}}/>
            <Pressable style={[styles.btnDestructive, {flex: 1}]} onPress={handleDelink}>
              <Text style={styles.btnText}>4. Delink ID</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Link Operation Output:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>
              {linkResult
                ? JSON.stringify(linkResult, null, 2)
                : "Waiting for action..."}
            </Text>
          </View>
        </View>

      </ScrollView>
    </GoogleOAuthProvider>
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