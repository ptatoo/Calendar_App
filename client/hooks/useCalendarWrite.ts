import { EventObj } from "@/utility/types";
import { useState } from "react";
import { addEventToGoogleCalendar, deleteEventToGoogleCalendar, editEventToGoogleCalendar } from "../services/api"; // Adjust path
import { useAccessToken } from "./useAccessToken";

export function useCalendarWrite(jwtToken: string | null) {
  const { getValidAccessToken } = useAccessToken(jwtToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = async (eventDetails: EventObj) => {
    console.log("Creating event with details:", eventDetails);
    setLoading(true);
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
      setLoading(false);
    }
  };
  
  const editEvent = async (eventDetails: EventObj) => {
    console.log("Editing event with details:", eventDetails);
    setLoading(true);
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
      console.error("Failed to edit event:", err);
      setError(err.message || "Unknown error occurred");
      throw err; // Re-throw for component
    } finally {
      setLoading(false);
    }
  };
  
  const deleteEvent = async (eventDetails: EventObj) => {
    console.log("Deleting event with details:", eventDetails);
    setLoading(true);
    setError(null);

    try {
      //get a valid token obj
      const tokenObj = await getValidAccessToken();
      
      //get access token
      const googleToken = tokenObj?.parent?.accessToken;

      //call api to make event
      const result = await deleteEventToGoogleCalendar(googleToken, eventDetails);
      
      return result; // Returns HTML link to the editd event
      
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      setError(err.message || "Unknown error occurred");
      throw err; // Re-throw for component
    } finally {
      setLoading(false);
    }
  };

  return { createEvent, editEvent, deleteEvent, loading, error };
}