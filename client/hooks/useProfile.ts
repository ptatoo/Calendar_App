import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState, useCallback } from "react";
import * as Keychain from "react-native-keychain";
import { fetchJwtToken } from "../services/api";

export function useProfiles(JWTToken: string | null) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!JWTToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Keychain Check
      const credentials = await Keychain.getGenericPassword({ service: "service_key" });
      if (!credentials) {
        console.log("No credentials stored");
      }

      // 2. Fetch from Backend
      const data = await fetchFamilyProfiles(JWTToken)
      
      // 3. Update State & Local Storage
      setProfiles(data);
      // storeObject("profile", data); // Assuming this is a global helper
      
    } catch (err: any) {
      console.error("Backend Profile Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [JWTToken]);

  // Automatically fetch when the token changes
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, isLoading, error, refetch: fetchProfiles };
}