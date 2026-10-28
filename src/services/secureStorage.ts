import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sensitive values (session token, profile with phone number) go to the device keychain/keystore.
 * SecureStore is unavailable on web, so the web preview falls back to AsyncStorage and says so in the README.
 */
export const SECURE_KEYS = {
  session: 'md_session_v1',
  profile: 'md_profile_v1',
} as const;

const useFallback = Platform.OS === 'web';

export async function readSecureJson<T>(key: string): Promise<T | null> {
  try {
    const raw = useFallback ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn(`[secureStorage] Could not read ${key}`, error);
    return null;
  }
}

export async function writeSecureJson<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  if (useFallback) await AsyncStorage.setItem(key, raw);
  else await SecureStore.setItemAsync(key, raw);
}

export async function deleteSecure(key: string): Promise<void> {
  try {
    if (useFallback) await AsyncStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[secureStorage] Could not delete ${key}`, error);
  }
}
