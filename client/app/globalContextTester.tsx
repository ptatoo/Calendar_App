import { useAccessToken } from "@/hooks/useAccessToken";
import { useProfiles } from "@/hooks/useProfile";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function ContextTester420() {
  const authProps = useAuth();
  const profileProps = useProfiles(authProps.jwtToken?.sessionToken || null);
  const accessTokenProps = useAccessToken(authProps.jwtToken?.sessionToken || null);

  return (
    <View>
      <Pressable onPress = {profileProps.refetch}>
        <Text>profile</Text>
      </Pressable>
      <Text>
        {JSON.stringify(profileProps.familyProfiles)}
      </Text>
      <Text>
        {JSON.stringify(accessTokenProps.familyAccessTokens)}
      </Text>
    </View>
  )
}