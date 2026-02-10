import { Pressable, Text, View } from "react-native";

import { useAuth } from "../hooks/useAuth";

export default function LoginButton() {

  const { JwtToken, isLoading, error, request, promptAsync } = useAuth();

  return (
    <View>
      <Pressable 
        onPress={() => promptAsync()} 
        disabled={!request}
      > 
      {
        isLoading ? (<Text> loading </Text>) : JwtToken ? (<Text> logged in as f </Text>) : (<Text> login pls. </Text>)
      }
      </Pressable>
      <Text>
        {JwtToken ? JwtToken.sessionToken : "asdf"}
      </Text>
    </View>
  )
}