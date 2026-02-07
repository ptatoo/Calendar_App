import { fetchJWTToken } from "../services/api";

export const useAuth = async (authCode : string) => {
    return await fetchJWTToken(authCode);
}