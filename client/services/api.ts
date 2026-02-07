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
