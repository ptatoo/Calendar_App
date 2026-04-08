//Backend Fetching
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

export const fetchCalendar = async (accessToken: string) => {
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.append("showDeleted", "false");

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
    return await res.json();
}
// Google Api: Fetch Calendar Events
export const fetchGivenCalendar = async (accessToken: string, calendarId: string = "primary", isPrimary: boolean = false) => {
    const encodedId = (!isPrimary) ? encodeURIComponent(calendarId) : encodeURIComponent("primary");
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
  const calendarId = eventObj.calendarId || 'primary';
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

// const shareCalendar = async (calendarId: string, shareWithEmail: string) => {
//   const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/acl`;
  
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${userAccessToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       role: 'reader', // or 'writer'
//       scope: {
//         type: 'user',
//         value: shareWithEmail
//       }
//     }),
//   });

//   const data = await response.json();
//   return data;
// };

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

