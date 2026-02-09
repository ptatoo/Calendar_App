import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  saveSecure: async (key: string, value: string) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.log("Failed storage.web.ts:saveSecure\n", e);
    }
  },

  getSecure: async (key: string) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Failed storage.web.ts:get [Storage] Load failed for "${key}":`, error);
      return null; // Return null so the app treats it as "empty" rather than crashing
    }
  },

  removeSecure: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },

  // Standard Async Storage (Works on Web too)
  save: async (key: string, value: any) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.log("Failed storage.web.ts:save\n", e);
    }
  },

  get: async (key: string) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Failed storage.web.ts:get [Storage] Load failed for "${key}":`, error);
      return null; // Return null so the app treats it as "empty" rather than crashing
    }
  }
};