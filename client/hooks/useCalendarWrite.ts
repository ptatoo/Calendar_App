import { EventObj } from "@/utility/types";
import { useState } from "react";
import { addEventToGoogleCalendar, editEventToGoogleCalendar } from "../services/api"; // Adjust path
import { useAccessToken } from "./useAccessToken";

export function useCalendarWrite(jwtToken: string | null) {
  const { getValidAccessToken } = useAccessToken(jwtToken);
  const [loading, isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventDetails: EventObj) => {
    console.log("Creating event with details:", eventDetails);
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
  
  const editEvent = async (eventDetails: EventObj) => {
    console.log("Editing event with details:", eventDetails);
    isLoading(true);
    setError(null);

    try {
      //get a valid token obj
      const tokenObj = await getValidAccessToken();
      
      //get access token
      const googleToken = tokenObj?.parent?.accessToken;

      //call api to make event
      const result = await editEventToGoogleCalendar(googleToken, eventDetails);
      
      return result; // Returns HTML link to the editd event
      
    } catch (err: any) {
      console.error("Failed to create event:", err);
      setError(err.message || "Unknown error occurred");
      throw err; // Re-throw for component
    } finally {
      isLoading(false);
    }
  };

  return { createEvent, editEvent, loading, error };
}