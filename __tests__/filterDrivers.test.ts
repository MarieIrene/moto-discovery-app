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

  it('respects the radius and lists the nearest driver first', () => {
    const result = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, { ...base, radiusKm: 5 });
    expect(result.length).toBeGreaterThan(5);
    expect(result.every((d) => d.distanceKm <= 5)).toBe(true);
    const distances = result.map((d) => d.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it('searches the whole country when the radius is lifted', () => {
    const result = filterNearbyDrivers(drivers, KIGALI_DEMO_LOCATION, { ...base, radiusKm: Infinity, query: 'musanze' });
    expect(result.length).toBe(3);
    expect(result.every((d) => d.district === 'Musanze')).toBe(true);
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
