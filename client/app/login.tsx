import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// Required for Expo Auth Session
WebBrowser.maybeCompleteAuthSession();

type LoginButtonProps = {
  onToken: (token: string) => void;
};

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

//LOGIN BUTTON (CHILD)
function LoginButton({ onToken }: LoginButtonProps) {
  //fetch google's oauth (configure session)
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_CLIENT_ID!,
      scopes: [
        "openid",
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      responseType: "code",
      usePKCE: true,
      extraParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectUri: process.env.EXPO_PUBLIC_FRONTEND_LINK!,
    },
    discovery,
  );

  //login through google in backen
  const backendLogin = async () => {
    if (response?.type === "success") {
      const backendResponse = await fetch(
        "http://localhost:3001/api/google-exchange",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: response.params.code,
            codeVerifier: request?.codeVerifier,
            redirectUri: AuthSession.makeRedirectUri(),
          }),
        },
      );

      const tokens = await backendResponse.json();
      onToken(tokens.sessionToken);
    }
  };
  backendLogin();

  //JSX component
  return (
    <Pressable
      onPress={() => promptAsync()}
      disabled={!request}
      style={styles.loginButton}
    >
      <Text style={styles.loginText}>Sign in with Google</Text>
    </Pressable>
  );
}

//fetch users profile from
async function fetchProfiles(token: string) {
  //token doesnt exist
  if (!token) {
    console.error("No token provided to fetchProfiles");
    return [];
  }

  try {
    //fetch from backend
    const res = await fetch("http://localhost:3001/api/get-family-data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.log(`Server responded with ${res.status}: ${errorText}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    //log data
    const data = await res.json();
    storeStringData(data.parent.id, data.parent.accessToken);
    console.log(data);
    return data;
  } catch (err) {
    console.error("Backend Profile Fetch Error:", err);
  }
}

const storeObjectData = async (key: string, value: object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
};

const storeStringData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log(e);
  }
};

//fetch calender events
async function fetchEvents(token: string) {
  //token doesnt exist
  if (!token) {
    console.error("No token provided to fetchEvents");
    return [];
  }

  try {
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.log(`Server responded with ${res.status}: ${errorText}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Detailed Fetch Error:", err);
    return [];
  }
}

//MAIN SCREEN (PARENT)
export default function GoogleOauth() {
  const [token, setToken] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);

  const fetchBackendProfiles = async () => {
    const profile = await fetchProfiles(token);
  };

  useEffect(() => {
    if (token) {
      fetchUserBackend();
    }
  }, [token]);

  return (
    <View style={styles.homepg}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Calendar</Text>
      </View>

      {/* User Buttons */}
      <LoginButton onToken={setToken} />

      <Pressable onPress={() => fetchBackendProfiles()} style={styles.loginButton}>
        <Text style={styles.loginText}>Fetch Profile From Backend</Text>
      </Pressable>

      {/* Display events */}
      <ScrollView style={styles.eventsContainer}></ScrollView>
    </View>
  );
}

//styles
const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: "#F68BA2",
    borderRadius: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  loginButton: {
    padding: 12,
    backgroundColor: "#4285F4",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "white",
    fontWeight: "600",
  },
  eventsContainer: {
    flex: 1,
  },
  noEventsText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  eventItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
  },
});
