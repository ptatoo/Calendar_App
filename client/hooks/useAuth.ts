import { AuthContext } from "@/app/context";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from 'expo-web-browser';
import { useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { fetchJwtToken } from "../services/api";
import { storage } from '../services/storage';

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {jwtToken, setJwtToken} = useContext(AuthContext);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        android: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
        default: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, 
      })!,
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
      redirectUri: AuthSession.makeRedirectUri(),
    },
    discovery,
  );


  useEffect(() => {
    const handleBackendLogin = async () => {
      if (!(response?.type === "success") || !request?.codeVerifier){ 
        if(response?.type === "error") setError("oopsie, error");
        return;
      }

      setIsLoading(true);
      setError(null);
      try{
        const { code } = response.params;
        const { codeVerifier, redirectUri } = request;
        const jwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);

        storage.saveSecure('jwt_token', jwtToken); // saves into persistent storage
        setJwtToken(jwtToken); // sets global context
        
      } catch (error : any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    handleBackendLogin();
  }, [response, request, setJwtToken]);

  return { jwtToken, isLoading, error, request, promptAsync };
};