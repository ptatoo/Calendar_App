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
          <Text style={styles.username}>{familyProfile ? familyProfile.parent.name : "Username"}</Text>
          <Text style={styles.email}>{familyProfile ? familyProfile.parent.email : "Email"}</Text>
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
});
