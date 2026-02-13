import { storage } from "@/services/storage";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomDrawerContent(props: any) {
  const [familyProfile, setFamilyProfile] = useState(storage.get("profiles"));
  const router = useRouter();
  const [view, setView] = useState<"M" | "W" | "3" | "2" | "1">("3"); // month/week toggle
    
  useEffect(() => {
    console.log("View changed to:", view);
  }, [view]);

  const getButtonStyle = (option: "1" | "2" | "3" | "W" | "M", pressed: boolean) => [
      styles.viewButton,
      view === option && styles.activeButton,
      pressed && styles.pressedButton,
  ];

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View>
        {/* make the parent name title case, decrease spacing in between the two 
        make the Pressable component less transparent when pressed*/}
        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.username}>
            {familyProfile ? familyProfile.parent.name : "Username"}
          </Text>
          <Text style={styles.email}>
            {familyProfile ? familyProfile.parent.email : "Email"}
          </Text>
        </Pressable>
      </View>
      {/* here for convenience. only for testing */}
      <View style={styles.viewToggleContainer}>
        {["1", "2", "3", "W", "M"].map((option) => (
            <Pressable key={option} onPress={() => setView(option as "1" | "2" | "3" | "W" | "M" )}
                style={({ pressed }) => getButtonStyle(option as "1" | "2" | "3" | "W" | "M" , pressed)}>
                <Text style={[styles.viewButtonText, view === option && styles.activeButtonText]}>
                    {option === "W" ? "week" : option === "M" ? "month" : `${option} day${option !== "1" ? "s" : ""}`}
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
      fontWeight: "650",
    },
    pressedButton: {
      transform: [{ scale: 0.96 }],
    },
});
