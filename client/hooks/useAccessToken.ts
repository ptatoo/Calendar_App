import { FamilyAccessTokenObjs } from "@/utility/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFamilyAccessTokens } from "../services/api";
import { storage } from "../services/storage";

export function useAccessToken(JWTToken: string | null) {
  const [familyAccessTokens, setFamilyAccessTokens] = useState<FamilyAccessTokenObjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackendAccessTokens = useCallback(async () => {
    if (!JWTToken) return;

    setIsLoading(true);
    setError(null);

    try {
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
    
    fetchBackendAccessTokens();
  }, [fetchBackendAccessTokens]);

  const value = useMemo(() => ({
    familyAccessTokens, isLoading, error, refetch: fetchBackendAccessTokens
  }), [familyAccessTokens, isLoading, error, fetchBackendAccessTokens])

  return value;
}