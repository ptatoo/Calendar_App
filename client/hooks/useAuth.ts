import { fetchJwtToken } from "../services/api";

export const useAuth = async (authCode : string, codeVerifier : string, redirectUri : string) => {
    return await fetchJwtToken(authCode, codeVerifier, redirectUri);
}