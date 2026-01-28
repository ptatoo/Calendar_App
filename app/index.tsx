import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function LoginButton( {setToken} : {setToken : (t: string) => void} ) {
  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      //debug code vvv
      console.log("Access Token:", tokenResponse.access_token);

      setToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
  });

  return <button onClick={() => login()}>Login with Google</button>;
}

async function fetchData(token : string){
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return await response.json();
}

export default function Index() {
  let [token, setToken] = useState("");
  let [data, setData] = useState([]);

  const handleFetch = async () => {
    setData(await fetchData(token));
  }


  return (
    <View style={styles.container}>
      <Text style={styles.content}>
        Edit app/index.tsx to edit this screen.
      </Text>
      <Text>sdgfasdfashi</Text>
      
      <button onClick = { () => console.log(token) }>
        output token
      </button>

      <button onClick = { () => handleFetch() }>
        fetch data
      </button>

      <button onClick = { () => console.log(data) }>
        output data
      </button>
      
      <GoogleOAuthProvider clientId="198333533430-et6uu5nbtl7erbmc4rop3v55cprj4ts2.apps.googleusercontent.com">
        <LoginButton setToken = {setToken} />
      </GoogleOAuthProvider>

      <Link href={"/about"}>Visit about screen</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    fontSize: 20,
  },
});
