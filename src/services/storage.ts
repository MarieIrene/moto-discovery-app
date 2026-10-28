import AsyncStorage from '@react-native-async-storage/async-storage';

/** Non-sensitive local persistence: preferences, onboarding flag, demo records. */
export const STORAGE_KEYS = {
  onboardingComplete: 'md.onboardingComplete.v1',
  settings: 'md.settings.v1',
  appData: 'md.appData.v1',
  activeRole: 'md.activeRole.v1',
  recentContacts: 'md.recentContacts.v1',
} as const;

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn(`[storage] Could not read ${key}`, error);
    return null;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Could not write ${key}`, error);
  }
}

export async function removeKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.warn('[storage] Could not remove keys', error);
  }
}
