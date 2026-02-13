import { AccessTokenObj, FamilyAccessTokenObjs } from "@/utility/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchFamilyAccessTokens } from "../services/api";
import { storage } from "../services/storage";

export function useAccessToken(jwtToken: string | null) {
  const [familyAccessTokens, setFamilyAccessTokens] = useState<FamilyAccessTokenObjs | null>(
    () => storage.get("access_tokens")
  ) ;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackendAccessTokens = useCallback(async () => {
    if (!jwtToken) return;

    setIsLoading(true);
    setError(null);

    try {
      //Fetch from Backend
      const data = await fetchFamilyAccessTokens(jwtToken)
      
      //Update State & Local Storage
      setFamilyAccessTokens(data);
      storage.save("access_tokens", data);

    } catch (err: any) {
      console.error("Backend Profile Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [jwtToken]);


  useEffect(() => {
    const checkValid = async () => {
      if (!jwtToken) return;

      const storedData = storage.get("access_tokens") as FamilyAccessTokenObjs | null;

      if(!storedData) {
        await await fetchBackendAccessTokens();
        return;
      }
      const allTokens: AccessTokenObj[] = [
        storedData.parent,       // Add the parent object
        ...(storedData.children || [])
      ];
      
      setFamilyAccessTokens(storedData);

      // B. If data exists, check the Expiry Date
      const SAFETY_BUFFER = 100 * 60 * 1000; // 5 minutes buffer
      const now = Date.now();

      for(const tokenObj of allTokens){
        if(!tokenObj) continue;

        const expiryDate = tokenObj.expiryDate;
        const isExpired = !expiryDate || (now + SAFETY_BUFFER) > +expiryDate;
             
        if(isExpired){
          console.log(`${tokenObj.id} totken is expired`);
          await fetchBackendAccessTokens()
          return;
        }
      }
    }
    checkValid();
  }, [jwtToken, fetchBackendAccessTokens]);

  const value = useMemo(() => ({
    familyAccessTokens, isLoading, error, refetch: fetchBackendAccessTokens
  }), [familyAccessTokens, isLoading, error, fetchBackendAccessTokens])

  return value;
}