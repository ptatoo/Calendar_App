import { AuthContext } from "@/components/contexts/auth-context";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from 'expo-web-browser';
import { useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {jwtToken, loginWithCode} = useContext(AuthContext);
  const redirectUri = AuthSession.makeRedirectUri();
  console.log(redirectUri); // Check this matches Google Console exactly

  //recieve code from google oauth
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        default: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, 
      })!,
      scopes: [
        "openid",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      responseType: "code",
      usePKCE: true,
      extraParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectUri: AuthSession.makeRedirectUri(),
    },
    
    discovery,
  );

  //send that code to backend for JWTToken
  useEffect(() => {    
    const processLogin = async () => {
      if (response?.type === "success" && request?.codeVerifier) {
        setIsLoading(true);
        try {
          const { code } = response.params;
          // Call the function defined in the Provider
          await loginWithCode(code, request.codeVerifier, request.redirectUri);
        } catch (err) {
          setError("Login failed");
        } finally {
          setIsLoading(false);
        }
      }
    };
    processLogin();
  }, [response]); // depends on the response from Google

  return { jwtToken, isLoading, error, request, promptAsync };
};