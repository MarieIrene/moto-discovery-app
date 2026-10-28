import * as Location from 'expo-location';
import { GeoPoint } from '@/types';

export type PermissionState = 'undetermined' | 'granted' | 'denied';

export type LocationResult =
  | { status: 'ok'; point: GeoPoint }
  | { status: 'denied' }
  | { status: 'unavailable'; message: string };

export async function getPermissionState(): Promise<PermissionState> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
  } catch {
    return 'undetermined';
  }
}

export async function requestPermission(): Promise<PermissionState> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/** One-off position read. Tries a quick last-known fix first, then a balanced-accuracy fix. */
export async function getCurrentLocation(): Promise<LocationResult> {
  const permission = await getPermissionState();
  if (permission !== 'granted') return { status: 'denied' };
  try {
    const servicesOn = await Location.hasServicesEnabledAsync();
    if (!servicesOn) return { status: 'unavailable', message: 'Location services are turned off on this device.' };
    const last = await Location.getLastKnownPositionAsync({ maxAge: 60_000 });
    const fix = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { status: 'ok', point: { latitude: fix.coords.latitude, longitude: fix.coords.longitude } };
  } catch (error) {
    return { status: 'unavailable', message: error instanceof Error ? error.message : 'Could not get your location.' };
  }
}

/**
 * Continuous foreground position updates (every few seconds or ~10 m of movement) for the live map.
 * Returns a function that stops watching. Resolves to null when permission isn't granted.
 */
export async function watchLocation(onPoint: (point: GeoPoint, accuracyM: number | null) => void): Promise<(() => void) | null> {
  if ((await getPermissionState()) !== 'granted') return null;
  try {
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 4000, distanceInterval: 10 },
      (fix) => onPoint({ latitude: fix.coords.latitude, longitude: fix.coords.longitude }, fix.coords.accuracy ?? null),
    );
    return () => sub.remove();
  } catch {
    return null;
  }
}
