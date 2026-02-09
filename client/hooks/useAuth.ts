import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from "react";
import { fetchJwtToken } from "../services/api";
import { storage } from '../services/storage';

WebBrowser.maybeCompleteAuthSession();
export const useGoogleAuth = () => {

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    //ids and stuff
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    responseType: 'code', //ts is for code
    scopes: [
        "https://www.googleapis.com/auth/calendar.readonly",
    ],
    // apparently email openid and profile are default scoped
    // PKCE is default when using google provider
    extraParams: {
        access_type: "offline", // this is so backend gets refresh token
        prompt: "consent",
    },
    redirectUri: AuthSession.makeRedirectUri()
  });

  const handleBackendLogin = useCallback( async () => {
    
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
      storage.saveSecure('jwt_token', jwtToken);
      setToken(jwtToken);
    } catch (error : any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [response, request]);

  useEffect(() => {
    handleBackendLogin();
  }, [handleBackendLogin]);

  return { token, isLoading, error, promptAsync, request };
};