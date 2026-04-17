//Backend Fetching
import { MAX_RESULTS } from "@/utility/constants";
import { convertToGoogleEvent } from "@/utility/eventUtils";
import { EventObj, ProfileObj } from "@/utility/types";

export const fetchJwtToken = async (authCode: string, codeVerifier?: string, redirectUri?: string) => {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/google-exchange`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      code: authCode,
      // Only attach these if they exist (for web), otherwise omit them (for mobile)
      ...(codeVerifier && { codeVerifier }),
      ...(redirectUri && { redirectUri }),
    }),
  });
  return await res.json();
}

export const fetchFamilyProfiles = async (jwtToken : string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/get-family-profiles`, {
        method : 'POST',
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${jwtToken}`
        },
    });
    return await res.json();
}

export const fetchFamilyAccessTokens = async (jwtToken : string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/get-family-access-tokens`, {
        method : 'POST',
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
        },
    });
    return await res.json();
}

// ===========================================================
// GOOGLE API FUNCTIONS
// ===========================================================

// Google Api: Fetch Calendar Events
export const fetchGivenCalendar = async (accessToken: string, calendarId: string = "primary", isPrimary: boolean = false) => {
    const encodedId = encodeURIComponent(calendarId);
    let allEvents: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events`);
      url.searchParams.append("showDeleted", "false");
      url.searchParams.append("singleEvents", "true");
      url.searchParams.append("orderBy", "startTime");
      if (pageToken) {
            url.searchParams.append("pageToken", pageToken);
        }

      const res = await fetch(
        url.toString(),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();

      if (data.items) {
        allEvents = [...allEvents, ...data.items];
      }
      pageToken = data.nextPageToken;
    } while (pageToken);

    return allEvents;
}

// Google Api: Fetch Calendar Events
export const fetchGivenCalendarAndPage = async (accessToken: string, calendarId: string = "primary", pageToken: string | undefined ,isPrimary: boolean = false): Promise<{events: any[], pageToken: string | undefined}> => {
  const encodedId = encodeURIComponent(calendarId);
  let allEvents: any[] = [];
  if (pageToken) {
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events`);
    url.searchParams.append("showDeleted", "false");
    url.searchParams.append("singleEvents", "true");
    url.searchParams.append("orderBy", "startTime");
    url.searchParams.append("maxResults", MAX_RESULTS);
    url.searchParams.append("pageToken", pageToken);

    const res = await fetch(
      url.toString(),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await res.json();

    if (data.items) allEvents = [...allEvents, ...data.items];
    pageToken = data.nextPageToken;

  return {events: allEvents, pageToken: pageToken};
  }
  else return {events: [], pageToken: undefined};
}

// Google Api: Fetch Calendar List
export const fetchCalendarList = async (accessToken: string) => {
  const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return await res.json();
};


//calendar writing
export const addEventToGoogleCalendar = async (accessToken: string, eventObj : EventObj) => {
  const googleEvent = convertToGoogleEvent(eventObj);

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Event created successfully:', data.htmlLink);
      return data;
    } else {
      console.error('Error creating event:', data);
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Network or API Error:', error);
    throw error;
  }
};

//calendar writing
export const editEventToGoogleCalendar = async (accessToken: string, eventObj : EventObj) => {
  if (!eventObj.id) {
    throw new Error("Event ID is required to edit an event.");
  }

  const googleEvent = convertToGoogleEvent(eventObj);
  const calendarId = eventObj.calendarId;
  const eventId = eventObj.id;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Event updated successfully:', data.htmlLink);
      return data;
    } else {
      console.error('Error updating event:', data);
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Network or API Error:', error);
    throw error;
  }
};

//calendar writing
export const deleteEventToGoogleCalendar = async (accessToken: string, eventObj : EventObj) => {
  if (!eventObj.id) {
    throw new Error("Event ID is required to delete an event.");
  }

  const googleEvent = convertToGoogleEvent(eventObj);
  const calendarId = eventObj.calendarId;
  const eventId = eventObj.id;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE'  ,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log("ilovejson");
    const data = await response;
    console.log("ilovesjson");

    if (response.ok) {
      console.log('Event deleted successfully');
      return data;
    } else {
      console.error('Error deleting event:', data);
      throw new Error("errpr");
    }
  } catch (error) {
    console.error('Network or API Error:', error);
    throw error;
  }
};

//calendar sharing with ACL
export const shareCalendar = async (calendarId: string, shareWithEmail: string, jwtToken: string) => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader', // or 'writer'
        scope: {
          type: 'user',
          value: shareWithEmail
        }
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("shared calendar successfully");
      return data;
    }
  } catch (err) {
    console.error("Failed to Share Calendar: ", err);
    throw new Error;
  }
};

//viewing shared calendars with ACL
export const getCalendarSharingSettings = async (calendarId: string, accessToken: string) => {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to Share Calendar: ", err);
    throw new Error;
  }
};

// ===========================================================
// INVITATION FUNCTIONS 
// ===========================================================

export const postInviteAdd = async(jwtToken: string, email: string) => {
  try {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/invite/add`, {
        method : 'POST',
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          inviteeEmail: email
        })
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

export const postInviteAccept = async(jwtToken: string, email: string) => {
  try {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/invite/accept`, {
        method : 'POST',
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          hostEmail: email
        })
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

export const getInviteMyInvites = async(jwtToken: string) => {
  try {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/invite/my-invites`, {
        method : 'GET',
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${jwtToken}`
        }
    });
    const data = await res.json();
    return data as ProfileObj[];
  } catch (error) {
    console.error(error);
  }
}

export const getInviteSentInvites = async(jwtToken: string) => {
  try {
  const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/invite/sent-invites`, {
        method : 'GET',
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${jwtToken}`
        }
    });
    const data = await res.json();
    return data as ProfileObj[];
  } catch (error) {
    console.error(error);
  }
}

