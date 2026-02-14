import { createMMKV, MMKV } from 'react-native-mmkv';

export const storageDevice: MMKV = createMMKV();

export const storage = {
  saveSecure: (key: string, value: string) => {
    try {
        const jsonValue = JSON.stringify(value);
        storageDevice.set(key, jsonValue);
    } catch (e) {
        console.log("Failed storage.web.ts:saveSecure\n", e);
    }
  },

  getSecure: (key: string) => {
    try {
      const val = storageDevice.getString(key);
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Failed storage.web.ts:get [Storage] Load failed for "${key}":`, error);
      return null; // Return null so the app treats it as "empty" rather than crashing
    }
  },

  removeSecure: (key: string) => {
    storageDevice.remove(key);
  },

  // Standard Async Storage (Works on Web too)
  save: (key: string, value: any) => {
    try {
        const jsonValue = JSON.stringify(value);
        storageDevice.set(key, jsonValue);
    } catch (e) {
        console.log("Failed storage.web.ts:save\n", e);
    }
  },

  get: (key: string) => {
    try {
      const val = storageDevice.getString(key);
      if ((val ? JSON.parse(val) : null).error) throw console.error();
      return val ? JSON.parse(val) : null;
    } catch (error) {
      console.error(`Failed storage.web.ts:get [Storage] Load failed for "${key}":`, error);
      return null; // Return null so the app treats it as "empty" rather than crashing
    }
  }
};