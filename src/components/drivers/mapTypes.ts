import { DriverWithDistance } from '@/features/discovery/filterDrivers';
import { GeoPoint } from '@/types';

export interface DriverMapProps {
  origin: GeoPoint;
  radiusKm: number;
  drivers: DriverWithDistance[];
  selectedId?: string;
  onSelect: (driverId: string) => void;
  height: number;
}
