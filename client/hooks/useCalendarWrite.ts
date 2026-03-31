import { useState } from "react";
import { addEventToGoogleCalendar } from "../services/api"; // Adjust path
import { useAccessToken } from "./useAccessToken";

export function useCalendarWrite(jwtToken: string | null) {
  const { getValidAccessToken } = useAccessToken(jwtToken);
  const [loading, isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventDetails: any) => {
    isLoading(true);
    setError(null);

    try {
      //get a valid token obj
      const tokenObj = await getValidAccessToken();
      
      //get access token
      const googleToken = tokenObj?.parent?.accessToken;

      //call api to make event
      const result = await addEventToGoogleCalendar(googleToken, eventDetails);
      
      return result; // Returns HTML link to the new event
      
    } catch (err: any) {
      console.error("Failed to create event:", err);
      setError(err.message || "Unknown error occurred");
      throw err; // Re-throw for component
    } finally {
      isLoading(false);
    }
  };

  return { createEvent, loading, error };
}