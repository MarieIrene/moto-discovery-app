import { distanceKm } from '@/lib/geo';
import { GeoPoint } from '@/types';

export interface District {
  name: string;
  province: ProvinceName;
  /** Approximate centre of the district's main town. Used for demo locations and sample drivers. */
  centre: GeoPoint;
}

export const PROVINCES = ['Kigali City', 'Northern', 'Southern', 'Eastern', 'Western'] as const;
export type ProvinceName = (typeof PROVINCES)[number];

const d = (name: string, province: ProvinceName, latitude: number, longitude: number): District => ({
  name, province, centre: { latitude, longitude },
});

/** All 30 districts of Rwanda, grouped by province. */
export const DISTRICTS: readonly District[] = [
  d('Gasabo', 'Kigali City', -1.9355, 30.1040),
  d('Kicukiro', 'Kigali City', -1.9700, 30.1040),
  d('Nyarugenge', 'Kigali City', -1.9441, 30.0619),

  d('Burera', 'Northern', -1.4730, 29.8330),
  d('Gakenke', 'Northern', -1.6940, 29.7800),
  d('Gicumbi', 'Northern', -1.5760, 30.0670),
  d('Musanze', 'Northern', -1.4990, 29.6340),
  d('Rulindo', 'Northern', -1.7280, 29.9920),

  d('Gisagara', 'Southern', -2.6050, 29.8330),
  d('Huye', 'Southern', -2.5970, 29.7390),
  d('Kamonyi', 'Southern', -2.0040, 29.9020),
  d('Muhanga', 'Southern', -2.0740, 29.7570),
  d('Nyamagabe', 'Southern', -2.4830, 29.5720),
  d('Nyanza', 'Southern', -2.3520, 29.7510),
  d('Nyaruguru', 'Southern', -2.6380, 29.5530),
  d('Ruhango', 'Southern', -2.2240, 29.7780),

  d('Bugesera', 'Eastern', -2.1490, 30.0940),
  d('Gatsibo', 'Eastern', -1.6130, 30.3980),
  d('Kayonza', 'Eastern', -1.8850, 30.5050),
  d('Kirehe', 'Eastern', -2.2670, 30.7000),
  d('Ngoma', 'Eastern', -2.1600, 30.5430),
  d('Nyagatare', 'Eastern', -1.2940, 30.3280),
  d('Rwamagana', 'Eastern', -1.9490, 30.4350),

  d('Karongi', 'Western', -2.0600, 29.3480),
  d('Ngororero', 'Western', -1.8650, 29.6250),
  d('Nyabihu', 'Western', -1.6200, 29.5100),
  d('Nyamasheke', 'Western', -2.3600, 29.0900),
  d('Rubavu', 'Western', -1.7020, 29.2560),
  d('Rusizi', 'Western', -2.4850, 28.9080),
  d('Rutsiro', 'Western', -1.9400, 29.3300),
];

export function findDistrict(name: string | undefined): District | undefined {
  return name ? DISTRICTS.find((x) => x.name === name) : undefined;
}

export function districtsIn(province: ProvinceName): District[] {
  return DISTRICTS.filter((x) => x.province === province);
}

/** The district whose main town is closest to a point, e.g. to suggest a district from GPS. */
export function nearestDistrict(point: GeoPoint): District {
  return DISTRICTS.reduce((best, x) => (distanceKm(point, x.centre) < distanceKm(point, best.centre) ? x : best));
}
