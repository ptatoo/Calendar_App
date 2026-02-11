import { Stack, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name={"index"}
        options={{
          headerTitle: "Settings",
          headerTitleAlign: "center",
          headerRight: () => (
            <View>
              <Pressable onPress={() => router.replace("/")}>
                <Text>exit</Text>
              </Pressable>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
