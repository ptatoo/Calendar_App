import { NavigationProp, useNavigation } from "@react-navigation/native";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

//DO NOT TOUCH
function LoginButton({ setToken }: { setToken: (t: string) => void }) {
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      // Send code to backend, create refresh token and recieve access token
      const response = await fetch(
        "http://localhost:3001/api/google-exchange",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code }),
        },
      );

      //store access token
      const tokens = await response.json();
      setToken(tokens.access_token);
      console.log("Received tokens from backend:", tokens);
    },
    scope: "https://www.googleapis.com/auth/calendar.events.readonly",
    flow: "auth-code",
  });

  //google login button
  return (
    <Pressable onPress={() => login()}>
      <Text>Login</Text>
    </Pressable>
  );
  //return <button onClick={() => login()}>Login with Google</button>;
}
//PLEASE DO NOT TOUCH ABOVE

//ask google for calendar data with token
async function fetchData(token: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

type RootStackParamList = {
  googleOauth: undefined; // No params expected
  index: []; // Expects an object with id: number
};

//index thing
export default function googleOauth() {
  let [token, setToken] = useState("");
  let [data, setData] = useState([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  //uses fetchData, processes raw Data into an array of objects
  const handleFetch = async () => {
    const currentDateAndTime: Date = new Date();
    const day = currentDateAndTime.getDay();
    console.log(day);
    const rawData = await fetchData(token);

    //array of objects in form {evt, startAt}
    const eventSummaries = rawData.items.map((event: any) => ({
      evt: event,
      startAt: event.start.dateTime || event.start.date,
    }));

    navigation.navigate("index", eventSummaries);
    setData(eventSummaries);
  };

  return (
    <View style={styles.homepg}>
      <View style={styles.header}>
        <Text>Calendar</Text>
        <View>
          <GoogleOAuthProvider clientId="198333533430-et6uu5nbtl7erbmc4rop3v55cprj4ts2.apps.googleusercontent.com">
            <LoginButton setToken={setToken} />
          </GoogleOAuthProvider>
        </View>
      </View>
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
