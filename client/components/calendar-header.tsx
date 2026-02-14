import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function CalendarHeader(props: any) {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"M" | "W" | "3" | "2" | "1">("3"); // month/week toggle

  return (
    <View style={styles.headerContainer}>
      {/* Waffle */}
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        style={styles.waffle}
      >
        <Ionicons name="menu" size={28} color="black" />
      </Pressable>

      {/* Date */}
      <View style={{ justifyContent: "center" }}>
        <Text style={{ fontWeight: 500, fontSize: 22 }}>
          {currentDate.toLocaleString("default", { month: "long" })}
        </Text>
      </View>

      {/* Extra Buttons on the Right */}
      <View style={styles.headerButtonContainer}>
        <Pressable style={styles.headerButton}>
          <Text style={{ fontWeight: 500, fontSize: 16 }}>
            {currentDate.toLocaleString("default", { day: "numeric" })}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    padding: 10,
    paddingTop: 60,
    gap: 10,
    alignItems: "stretch",
  },
  waffle: {
    alignSelf: "flex-start",
  },
  headerButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "stretch",
    padding: 2,
    gap: 10,
  },
  headerButton: {
    backgroundColor: "#77a7f7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    aspectRatio: 1,
    fontWeight: "700",

    // --- iOS Shadows ---
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Moves shadow down 2px
    shadowOpacity: 0.1, // 10% transparency (the "cute" secret)
    shadowRadius: 4, // How blurry it is

    // --- Android Shadows ---
    elevation: 3, // Only controls "depth" on Android
  },
});
