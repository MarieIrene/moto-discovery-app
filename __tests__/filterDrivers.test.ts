import { createMockDrivers } from '@/data/mock/drivers';
import { KIGALI_DEMO_LOCATION } from '@/data/mock';
import { filterNearbyDrivers, radiusOptionsWithin } from '@/features/discovery/filterDrivers';

describe('passenger discovery', () => {
  const drivers = createMockDrivers(new Date('2026-10-20T12:00:00Z'));
  const base = { radiusKm: 25, availability: 'all' as const, query: '' };

  it('never shows pending, rejected or suspended drivers', () => {
    const result = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, base);
    expect(result.every((d) => d.verificationStatus === 'approved' && d.accountStatus === 'active')).toBe(true);
    expect(result.find((d) => d.id === 'drv-009')).toBeUndefined();
    expect(result.find((d) => d.id === 'drv-010')).toBeUndefined();
  });

  it('respects the radius and sorts available drivers first, then by distance', () => {
    const result = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, { ...base, radiusKm: 5 });
    expect(result.every((d) => d.distanceKm <= 5)).toBe(true);
    const firstOffline = result.findIndex((d) => !d.isAvailable);
    if (firstOffline > 0) expect(result.slice(firstOffline).every((d) => !d.isAvailable)).toBe(true);
    const available = result.filter((d) => d.isAvailable).map((d) => d.distanceKm);
    expect(available).toEqual([...available].sort((a, b) => a - b));
  });

  it('can limit to available drivers and search by area', () => {
    const avail = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, { ...base, availability: 'available' });
    expect(avail.every((d) => d.isAvailable)).toBe(true);
    const remera = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, { ...base, query: 'remera' });
    expect(remera.map((d) => d.id)).toEqual(['drv-004']);
  });

  it('excludes the device user’s own driver record', () => {
    const result = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, base, 'drv-001');
    expect(result.find((d) => d.id === 'drv-001')).toBeUndefined();
  });

  it('caps radius choices at the admin maximum', () => {
    expect(radiusOptionsWithin(5)).toEqual([1, 2, 5]);
    expect(radiusOptionsWithin(0.5)).toEqual([0.5]);
  });
});
