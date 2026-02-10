import { Pressable, Text, View } from "react-native";

import { useAuth } from "../hooks/useAuth";

export default function LoginButton() {

  const { jwtToken, isLoading, error, request, promptAsync } = useAuth();

  return (
    <View>
      <Pressable 
        onPress={() => promptAsync()} 
        disabled={!request}
      > 
      {
        isLoading ? (<Text> loading </Text>) : (<Text> real text </Text>)
      }
      </Pressable>
      <Text>
        {jwtToken ? jwtToken.sessionToken : "asdf"}
      </Text>
    </View>
  )
}