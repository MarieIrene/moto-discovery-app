import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sensitive values (session token, profile with phone number) go to the device keychain/keystore.
 * SecureStore is unavailable on web, so the web preview falls back to AsyncStorage and says so in the README.
 */
export const SECURE_KEYS = {
  session: 'md_session_v1',
  /** Legacy single-profile key, read once to move older installs to per-account profiles. */
  profile: 'md_profile_v1',
  accounts: 'md_accounts_v1',
} as const;

/** Each account on the device keeps its own profile, so several people can sign in on one phone. */
export const profileKey = (userId: string) => `md_profile_v2_${userId}`;

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
