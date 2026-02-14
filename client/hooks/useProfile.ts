import { AuthContext } from "@/app/context";
import { useCallback, useContext, useEffect, useState } from "react";
import { fetchFamilyProfiles } from "../services/api";
import { storage } from "../services/storage";

export function useProfiles(JWTToken: string | null) {
  const {familyProfiles, setFamilyProfiles} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!JWTToken) return;

    setIsLoading(true);
    setError(null);

    try {
      //Fetch from Backend
      const data = await fetchFamilyProfiles(JWTToken)

      //check if data is ok
      if(data.error) {
        console.error("Backend Profile Fetch Error:", data?.error);
        setError(data?.error || "big error in profiles");
        return;
      }

      //Update State & Local Storage
      setFamilyProfiles(data);
      storage.save("profiles", data);
      
    } catch (err: any) {
      console.error("Backend Profile Fetch Error:", err);
      setError(err.message || "big error in profiles");
    } finally {
      setIsLoading(false);
    }
  }, [JWTToken, setFamilyProfiles]);

  // Automatically fetch when the token changes
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { familyProfiles, isLoading, error, refetch : fetchProfiles };
}