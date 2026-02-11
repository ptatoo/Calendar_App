import { storage } from "@/services/storage";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomDrawerContent(props: any) {
  const familyProfile = storage.get("profiles");

  return (
    <SafeAreaView style={styles.headerContainer}>
      <View>
        <Text>{familyProfile ? familyProfile.parent.name : "lol not logged in" || "Username"}</Text>
        <Text>{familyProfile ? familyProfile.parent.email : "lol not logged in"  || "Email"}</Text>
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
});
