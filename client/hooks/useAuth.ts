import * as Google from "expo-auth-session/providers/google";
import { useState, useEffect } from "react";
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

//LOGIN BUTTON (CHILD)
export const useGoogleAuth = () => {
  const [user, setUser] = useState(null);
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