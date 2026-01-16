import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "INDEX" }} />
      <Stack.Screen name="about" options={{ title: "ABOUT" }} />
    </Stack>
  );
}
