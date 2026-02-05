/*
// import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useEffect } from 'react';
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Pressable } from 'react-native';

//DO NOT TOUCH

// create login button
WebBrowser.maybeCompleteAuthSession();

function LoginButton() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '198333533430-et6uu5nbtl7erbmc4rop3v55cprj4ts2.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });
    
    useEffect(() => {
      if (response?.type === 'success') {
        const { access_token } = response.authentication!;
        console.log('Access token:', access_token);
        // store token securely (later)
      }
    }, [response]);

  return (
    <Pressable
      onPress={() => promptAsync()}
      disabled={!request}
      style={{
        padding: 12,
        backgroundColor: '#4285F4',
        borderRadius: 6,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>
        Sign in with Google
      </Text>
    </Pressable>
  );
}



//ask google for calendar data with token
async function fetchEvents(token: string) {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return data.items;
}

type RootStackParamList = {
  googleOauth: undefined; // No params expected
  index: []; // Expects an object with id: number
};

//index thing
export default function GoogleOauth() {
  const [token, setToken] = useState("");

  return (
    <View>
      <Text>Calendar</Text>

      {//pass setToken DOWN to the child}
      <LoginButton onToken={setToken} />
    </View>
  );
}

const styles = StyleSheet.create({
  homepg: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "white",
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F68BA2",
    gap: 10,
  },
});
*/
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const CLIENT_ID =
  "198333533430-et6uu5nbtl7erbmc4rop3v55cprj4ts2.apps.googleusercontent.com";

// Required for Expo Auth Session
WebBrowser.maybeCompleteAuthSession();

/* =========================
   LOGIN BUTTON (CHILD)
   ========================= */
type LoginButtonProps = {
  onToken: (token: string) => void;
};

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

function LoginButton({ onToken }: LoginButtonProps) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      responseType: "code",
      extraParams: {
        access_type: "offline", // Ensures backend gets a Refresh Token
        prompt: "consent", // Forces refresh token to be sent every time
      },
      redirectUri: AuthSession.makeRedirectUri({
        useProxy: true,
      }),
    },
    {
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      revocationEndpoint: "https://oauth2.googleapis.com/revoke",
    },
  );

  const thing = async () => {
    if (response?.type === "success") {
      console.log(response.params.code);
      const backendResponse = await fetch(
        "http://localhost:3001/api/google-exchange",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: response.params.code }),
        },
      );

      const tokens = await backendResponse.json();

      console.log(tokens);
    }
  };
  thing();

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

/* =========================
   FETCH GOOGLE CALENDAR EVENTS
   ========================= */
async function fetchEvents(token: string) {
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
    // This is where "Network request failed" is caught
    console.error("Detailed Fetch Error:", err);
    return [];
  }
}

/* =========================
   MAIN SCREEN (PARENT)
   ========================= */
export default function GoogleOauth() {
  const [token, setToken] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);

  // Fetch events automatically once token is available
  useEffect(() => {
    if (token) {
      console.log("Token in parent:", token);

      fetchEvents(token)
        .then((items) => {
          console.log("Fetched events:", items);
          setEvents(items);
        })
        .catch((err) => console.log("Error fetching events:", err));
    }
  }, [token]);

  return (
    <View style={styles.homepg}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Calendar</Text>
      </View>

      <LoginButton onToken={setToken} />

      {/* Display events */}
      <ScrollView style={styles.eventsContainer}>
        {events.length === 0 ? (
          <Text style={styles.noEventsText}>
            No events loaded yet. Sign in to see your calendar.
          </Text>
        ) : (
          events.map((evt, idx) => (
            <View key={idx} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{evt.summary || "No Title"}</Text>
              <Text style={styles.eventTime}>
                {evt.start?.dateTime || evt.start?.date || "Unknown time"}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* =========================
   STYLES
   ========================= */
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
