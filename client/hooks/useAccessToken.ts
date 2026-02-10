import { FamilyAccessTokenObjs } from "@/app/context";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFamilyAccessTokens } from "../services/api";
import { storage } from "../services/storage";

export function useAccessToken(JWTToken: string | null) {
  const [familyAccessTokens, setFamilyAccessTokens] = useState<FamilyAccessTokenObjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessTokens = useCallback(async () => {
    if (!JWTToken) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Keychain Check
      // const credentials = await Keychain.getGenericPassword({ service: "service_key" });
      // if (!credentials) {
      //   console.log("No credentials stored");
      // }

      //Fetch from Backend
      const data = await fetchFamilyAccessTokens(JWTToken)
      
      //Update State & Local Storage
      setFamilyAccessTokens(data);
      storage.save("access_tokens", data);
      
    } catch (err: any) {
      console.error("Backend Profile Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [JWTToken]);

  // Automatically fetch when the token changes
  useEffect(() => {
    fetchAccessTokens();
  }, [fetchAccessTokens]);

  const value = useMemo(() => ({
    accessTokens: familyAccessTokens, isLoading, error, refetch: fetchAccessTokens
  }), [familyAccessTokens, isLoading, error, fetchAccessTokens])

  return value;
}