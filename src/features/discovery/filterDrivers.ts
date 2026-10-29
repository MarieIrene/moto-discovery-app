import { distanceKm } from '@/lib/geo';
import { Driver, GeoPoint } from '@/types';

export type AvailabilityFilter = 'available' | 'all';

export interface DiscoveryFilters {
  radiusKm: number;
  availability: AvailabilityFilter;
  query: string;
}

export interface DriverWithDistance extends Driver {
  distanceKm: number;
}

/** Only verified, active drivers are ever shown to passengers, whatever the filter. */
export function isDiscoverable(driver: Driver): boolean {
  return driver.verificationStatus === 'approved' && driver.accountStatus === 'active';
}

export function filterNearbyDrivers(
  drivers: Driver[],
  origin: GeoPoint,
  filters: DiscoveryFilters,
  excludeDriverId?: string,
): DriverWithDistance[] {
  const q = filters.query.trim().toLowerCase();
  return drivers
    .filter((d) => d.id !== excludeDriverId && isDiscoverable(d))
    .filter((d) => filters.availability === 'all' || d.isAvailable)
    .filter((d) => {
      if (!q) return true;
      return [d.fullName, d.sector, d.district, d.motorcycle.make, d.motorcycle.model, d.motorcycle.plateNumber]
        .some((field) => field.toLowerCase().includes(q));
    })
    .map((d) => ({ ...d, distanceKm: distanceKm(origin, d.location) }))
    .filter((d) => d.distanceKm <= filters.radiusKm)
    // Nearest first, so the driver who can reach the passenger soonest is at the top.
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export const RADIUS_OPTIONS_KM = [1, 2, 5, 10, 25] as const;

export function radiusOptionsWithin(maxKm: number): number[] {
  const options = RADIUS_OPTIONS_KM.filter((r) => r <= maxKm);
  return options.length > 0 ? options : [maxKm];
}
