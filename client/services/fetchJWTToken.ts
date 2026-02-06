
export const getJWTToken = async (authCode : string) => {
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_LINK!, {
        method : 'POST',
        
    });
}