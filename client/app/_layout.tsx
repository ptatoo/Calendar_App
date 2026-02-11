import Ionicons from "@expo/vector-icons/Ionicons";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./context";
import CustomDrawerContent from "./custom-drawer-content";

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
          <Drawer.Screen
            name="index"
            options={{
              headerTitle: "Calender",
              drawerLabel: "Calendar",
              drawerIcon: ({ size, color }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="login"
            options={{
              headerShown: false,
              headerTitle: "Login",
              drawerLabel: "Login",
              drawerIcon: ({ size, color }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="backend_console"
            options={{
              headerTitle: "Backend Console",
              drawerLabel: "Backend Console",
              drawerIcon: ({ size, color }) => (
                <Ionicons size={size} color={color} />
              ),
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
