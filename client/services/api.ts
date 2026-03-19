//Backend Fetching
export const fetchJwtToken = async (authCode : string, codeVerifier : string, redirectUri : string) => {
    const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api/google-exchange`, {
        method : 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            code: authCode,
            codeVerifier: codeVerifier,
            redirectUri: redirectUri,
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

// Google Api Fetching
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
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events`);
    url.searchParams.append("showDeleted", "false");
    url.searchParams.append("singleEvents", "true");
    url.searchParams.append("orderBy", "startTime");

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