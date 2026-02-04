import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="index" options={{ title: "INDEX" }} />
      <Drawer.Screen name="about" options={{ title: "ABOUT" }} />
    </Drawer>
  );
}
