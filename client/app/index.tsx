import { useRoute } from "@react-navigation/native";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
  return <button onClick={() => login()}>Login with Google</button>;
}
//PLEASE DO NOT TOUCH ABOVE

//ask google for calendar data with token
async function fetchData(token: string) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return await response.json();
}

//index thing
export default function Index() {
  let [token, setToken] = useState("");
  let [data, setData] = useState([]);
  const route = useRoute();
  const dataa = (route.params as any)?.events || [];

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
    setData(eventSummaries);
  };

  return (
    <View style={styles.homepg}>
      <View style={styles.header}>
        <Text>Calendar</Text>
        <View>
          <button onClick={() => console.log(token)}>output token</button>
          <button onClick={() => handleFetch()}>fetch data</button>
          <button onClick={() => console.log(dataa)}>output data</button>
          <GoogleOAuthProvider clientId="198333533430-et6uu5nbtl7erbmc4rop3v55cprj4ts2.apps.googleusercontent.com">
            <LoginButton setToken={setToken} />
          </GoogleOAuthProvider>
        </View>
      </View>
      <View style={styles.calenderContainer}>
        <View style={styles.dayOfWeek}>
          <Text style={styles.dayOfWeekTimeZone}>PST</Text>
          <Text style={styles.dayOfWeekItem}>Mon</Text>
          <Text style={styles.dayOfWeekItem}>Tues</Text>
          <Text style={styles.dayOfWeekItem}>Wed</Text>
        </View>
        <ScrollView alwaysBounceVertical={true} style={styles.calendarGrid}>
          {data.map((item: any, index) => (
            <View key={index}>
              <Text>{item.evt.summary || "No Title"}</Text>
            </View>
          ))}
        </ScrollView>
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
  calenderContainer: {
    flex: 5,
    flexDirection: "column",
  },
  dayOfWeek: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderColor: "lightgrey",
    borderBottomWidth: 1,
    gap: 1,
  },
  dayOfWeekTimeZone: {
    flex: 1,
    textAlign: "center",
    borderColor: "lightgrey",
  },
  dayOfWeekItem: {
    flex: 3,
    textAlign: "center",
    borderLeftWidth: 1,
    borderColor: "lightgrey",
  },
  calendarGrid: {},
});
