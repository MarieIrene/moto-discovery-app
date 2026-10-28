import { GeoPoint } from '@/types';

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Rough motorcycle travel time in city traffic (~22 km/h average). Display only. */
export function estimateMinutes(km: number): number {
  return Math.max(1, Math.round((km / 22) * 60));
}

/**
 * Projects points onto a square canvas centred on `origin`, used by the fallback map.
 * Returns fractions 0..1 (x to the right, y downward). Points outside the radius are clamped.
 */
export function projectToCanvas(origin: GeoPoint, point: GeoPoint, radiusKm: number): { x: number; y: number } {
  const kmPerDegLat = 110.574;
  const kmPerDegLon = 111.32 * Math.cos(toRad(origin.latitude));
  const dx = (point.longitude - origin.longitude) * kmPerDegLon;
  const dy = (point.latitude - origin.latitude) * kmPerDegLat;
  const clamp = (v: number) => Math.min(0.97, Math.max(0.03, v));
  return { x: clamp(0.5 + dx / (2 * radiusKm)), y: clamp(0.5 - dy / (2 * radiusKm)) };
}

/** Map region (lat/lon deltas) that fits a circle of `radiusKm` around `center`. */
export function regionForRadius(center: GeoPoint, radiusKm: number) {
  const latDelta = (radiusKm * 2.2) / 110.574;
  const lonDelta = (radiusKm * 2.2) / (111.32 * Math.cos(toRad(center.latitude)));
  return { ...center, latitudeDelta: latDelta, longitudeDelta: lonDelta };
}
