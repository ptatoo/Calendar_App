import { useAccessToken } from "@/hooks/useAccessToken";
import { useCalendar } from "@/hooks/useCalendar";
import { useProfiles } from "@/hooks/useProfile";
import { storage } from "@/services/storage";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function ContextTester420() {
  const authProps = useAuth();
  const profileProps = useProfiles(authProps.jwtToken?.sessionToken || null);
  const accessTokenProps = useAccessToken(authProps.jwtToken?.sessionToken || null);
  const calendarProps = useCalendar(storage.get('access_tokens').parent.accessToken);

  return (
    <View>
      <Pressable onPress = {profileProps.refetch}>
        <Text>profile</Text>
      </Pressable>
      <Pressable onPress = {calendarProps.refetch}>
        <Text>calendar</Text>
      </Pressable>
      <Text>
        {JSON.stringify(authProps.jwtToken)}
      </Text>
      <Text>
        {JSON.stringify(profileProps.familyProfiles)}
      </Text>
      <Text>
        {JSON.stringify(storage.get('access_tokens').parent.accessToken)}
      </Text>
      <Text>
        {JSON.stringify(storage.get('calendar'))}
      </Text>
    </View>
  )
}