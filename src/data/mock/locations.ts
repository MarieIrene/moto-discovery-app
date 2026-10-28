import { GeoPoint } from '@/types';

/** Central Kigali (Nyarugenge). Used when location is unavailable or the demo location is selected. */
export const KIGALI_DEMO_LOCATION: GeoPoint = { latitude: -1.9441, longitude: 30.0619 };

export const KIGALI_DISTRICTS = ['Nyarugenge', 'Gasabo', 'Kicukiro'] as const;
