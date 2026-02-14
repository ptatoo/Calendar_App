import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfile";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../app/context";

export default function CustomDrawerContent(props: any) {
  const { jwtToken } = useAuth();
  const { familyProfiles } = useProfiles(jwtToken?.sessionToken ?? null);
  const { calendarType, setCalendarType } = useContext(AuthContext);
  const router = useRouter();

  const getButtonStyle = (
    option: "1" | "2" | "3" | "W" | "M",
    pressed: boolean,
  ) => [
    styles.viewButton,
    calendarType === option && styles.activeButton,
    pressed && styles.pressedButton,
  ];

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View>
        {/* make the parent name title case, decrease spacing in between the two 
        make the Pressable component less transparent when pressed*/}
        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.username}>
            {familyProfiles && familyProfiles.parent
              ? familyProfiles.parent.name
              : "Username"}
          </Text>
          <Text style={styles.email}>
            {familyProfiles && familyProfiles.parent
              ? familyProfiles.parent.email
              : "Email"}
          </Text>
        </Pressable>
      </View>
      {/* here for convenience. only for testing */}
      <View style={styles.viewToggleContainer}>
        {["1", "2", "3", "W", "M"].map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              setCalendarType(option as "1" | "2" | "3" | "W" | "M");
              props.navigation.closeDrawer();
            }}
            style={({ pressed }) =>
              getButtonStyle(option as "1" | "2" | "3" | "W" | "M", pressed)
            }
          >
            <Text
              style={[
                styles.viewButtonText,
                calendarType === option && styles.activeButtonText,
              ]}
            >
              {option === "W"
                ? "week"
                : option === "M"
                  ? "month"
                  : `${option} day${option !== "1" ? "s" : ""}`}
            </Text>
          </Pressable>
        ))}
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 5,
  },
  username: {
    paddingLeft: 20,
    paddingTop: 20,
    fontSize: 16,
    marginBottom: 4,
  },
  email: {
    paddingLeft: 20,
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
  },
  viewToggleContainer: {
    justifyContent: "space-between",
    marginVertical: 15,
    paddingHorizontal: 10,
  },

  viewButton: {
    paddingVertical: 10,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#f0f0f0",
  },

  viewButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  activeButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  pressedButton: {
    transform: [{ scale: 0.96 }],
  },
});
