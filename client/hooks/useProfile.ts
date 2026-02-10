import { AuthContext } from "@/app/context";
import { useCallback, useEffect, useState } from "react";
import { fetchFamilyProfiles } from "../services/api";
import { storage } from "../services/storage";

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
      // const credentials = await Keychain.getGenericPassword({ service: "service_key" });
      // if (!credentials) {
      //   console.log("No credentials stored");
      // }

      //Fetch from Backend
      const data = await fetchFamilyProfiles(JWTToken)
      
      //Update State & Local Storage
      setProfiles(data);
      storage.save("profiles", data);
      
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