import { Text, View } from "react-native";

import { useAuth } from "../hooks/useAuth";

export default function ContextTester420() {
  const { jwtToken } = useAuth();

  return (
    <View>
      <Text>
        {jwtToken?.sessionToken}
      </Text>
    </View>
  )
}