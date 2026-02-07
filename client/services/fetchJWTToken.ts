export const fetchJWTToken = async (authCode : string) => {
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_LINK!, {
        method : 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode }),
    });
    return await res.json();
}