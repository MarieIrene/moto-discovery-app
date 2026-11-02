import Constants, { ExecutionEnvironment } from 'expo-constants';

/** Free OpenStreetMap-based street style from OpenFreeMap. No API key or account needed. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** MapLibre ships native code that Expo Go doesn't include, so Expo Go uses the schematic maps instead. */
export const nativeMapsAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
