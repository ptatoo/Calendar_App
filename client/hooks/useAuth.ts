
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from "react";
import { fetchJwtToken } from "../services/api";
import { storage } from '../services/storage';

WebBrowser.maybeCompleteAuthSession();
export const useGoogleAuth = () => {

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

  useEffect( () => {
    //login through google in backen
    const handleBackendLogin = async () => {
    if (!(response?.type === "success") || !request?.codeVerifier) return;

    const { code } = response.params;
    const { codeVerifier, redirectUri } = request;

    const JwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);
    storage.saveSecure('jwt_token', JwtToken);
  };
    handleBackendLogin();
  }, [response, request]);

  return { promptAsync, request };
};