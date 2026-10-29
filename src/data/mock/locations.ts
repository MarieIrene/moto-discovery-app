import { findDistrict } from '@/data/rwanda';
import { GeoPoint } from '@/types';

/** Central Kigali (Nyarugenge). Used when location is unavailable and no district is known. */
export const KIGALI_DEMO_LOCATION: GeoPoint = { latitude: -1.9441, longitude: 30.0619 };

/** The demo location for someone in a district: its main town, so sample drivers are nearby. */
export function demoLocationFor(district: string | undefined): GeoPoint {
  return findDistrict(district)?.centre ?? KIGALI_DEMO_LOCATION;
}

export function demoPlaceName(district: string | undefined): string {
  return findDistrict(district)?.name ?? 'Kigali';
}
