import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";

async function fetchProfiles(token: string) {
  //token doesnt exist
  if (!token) {
    console.error("No token provided to fetchProfiles");
    return [];
  }

  //try getting credentials from keyChain
  try {
    const credentials = await Keychain.getGenericPassword({
      service: "service_key",
    });
    if (credentials) {
      console.log(
        "Credentials successfully loaded for user " + credentials.username,
      );
    } else {
      console.log("No credentials stored");
    }
  } catch (error) {
    console.error("Failed to access Keychain", error);
  }

  //fetch from backend
  try {
    const res = await fetch("http://localhost:3001/api/get-family-data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.log(`Server responded with ${res.status}: ${errorText}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    //log data
    const data = await res.json();
    console.log(data);
    storeObjectData("key", data);
    return data;
  } catch (err) {
    console.error("Backend Profile Fetch Error:", err);
  }
}

const storeObjectData = async (key: string, value: object) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
};

const storeJWTToken = async (key: string, value: string) => {
  try {
    await Keychain.setGenericPassword(key, value, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    console.log("JWT Token stored using Keychain");
  } catch (error) {
    console.error("Failed to store token securely", error);
  }
};

//fetch calender events
async function fetchEvents(token: string) {
  //token doesnt exist
  if (!token) {
    console.error("No token provided to fetchEvents");
    return [];
  }

  try {
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.log(`Server responded with ${res.status}: ${errorText}`);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Detailed Fetch Error:", err);
    return [];
  }
}
