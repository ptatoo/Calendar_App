import { AccessTokenObj, FamilyAccessTokenObjs } from "@/utility/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFamilyAccessTokens } from "../services/api";
import { storage } from "../services/storage";


export function useAccessToken(jwtToken: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackendAccessTokens = useCallback(async () => {
    if (!jwtToken) return;

    setIsLoading(true);
    setError(null);

    try {
      //Fetch from Backend
      const data = await fetchFamilyAccessTokens(jwtToken)
      
      //Update Local Storage
      storage.save("access_tokens", data);
      return data;
    } catch (err: any) {
      console.error("Backend Profile Fetch Error:", err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);

  
  const getValidAccessToken = useCallback(async () => {
    if (!jwtToken) return;

    const storedData = storage.get("access_tokens") as FamilyAccessTokenObjs | null;

    if(!storedData) {
      return await fetchBackendAccessTokens();
    }

    const allTokens: AccessTokenObj[] = [
      storedData.parent,       // Add the parent object
      ...(storedData.children || [])
    ];

    // B. If data exists, check the Expiry Date
    const SAFETY_BUFFER = 10 * 60 * 1000; // 5 minutes buffer
    const now = Date.now();

    for(const tokenObj of allTokens){
      if(!tokenObj) continue;

      const expiryDate = tokenObj.expiryDate;
      const isExpired = !expiryDate || (now + SAFETY_BUFFER) > +expiryDate;
            
      if(isExpired){
        console.log(`${tokenObj.id} totken is expired`);
        return await fetchBackendAccessTokens();
      }
    }
    return storedData;
  }, [jwtToken, fetchBackendAccessTokens]);

  useEffect(() => {
    if(jwtToken)
      fetchBackendAccessTokens();
  }, [jwtToken, fetchBackendAccessTokens]);

  const value = useMemo(() => ({
    getValidAccessToken, isLoading, error, refetch: fetchBackendAccessTokens
  }), [getValidAccessToken, isLoading, error, fetchBackendAccessTokens])

  return value;
} 