import { GeoPoint } from '@/types';

export interface LiveMapProps {
  /** Where the driver is now. The map keeps this point in view. */
  driver: GeoPoint;
  /** The passenger looking at the map, if known. */
  viewer?: GeoPoint;
  /** Recent driver positions, oldest first. */
  trail?: GeoPoint[];
  accuracyM?: number | null;
  driverLabel: string;
  height: number;
  /** Who the followed point is. A passenger is drawn as a person, a driver as a motorcycle. */
  subject?: 'driver' | 'passenger';
}
