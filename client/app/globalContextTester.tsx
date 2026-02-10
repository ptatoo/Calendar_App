import { Pressable, Text, View } from "react-native";

import { useAuth } from "../hooks/useAuth";


const getJwtToken = () => {
  
}

export default function ContextTester420() {
  const { jwtToken } = useAuth();

  return (
    <View>
      <Pressable 
        onPress={() => getJwtToken()} 
      >
      </Pressable>
      <Text>
        jwtting
      </Text>
    </View>
  )
}