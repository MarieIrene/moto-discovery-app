import { distanceKm, formatDistance, projectToCanvas } from '@/lib/geo';

describe('geo utilities', () => {
  const nyarugenge = { latitude: -1.9441, longitude: 30.0619 };
  const remera = { latitude: -1.959, longitude: 30.112 };

  it('computes realistic distances across Kigali', () => {
    const km = distanceKm(nyarugenge, remera);
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(6.5);
  });

  it('returns zero for the same point', () => {
    expect(distanceKm(nyarugenge, nyarugenge)).toBe(0);
  });

  it('formats short distances in metres and longer in km', () => {
    expect(formatDistance(0.32)).toBe('300 m');
    expect(formatDistance(0.01)).toBe('50 m');
    expect(formatDistance(3.456)).toBe('3.5 km');
    expect(formatDistance(14.6)).toBe('15 km');
  });

  it('projects the origin to the centre of the fallback map and east to the right', () => {
    expect(projectToCanvas(nyarugenge, nyarugenge, 5)).toEqual({ x: 0.5, y: 0.5 });
    const east = projectToCanvas(nyarugenge, { ...nyarugenge, longitude: nyarugenge.longitude + 0.01 }, 5);
    expect(east.x).toBeGreaterThan(0.5);
    const north = projectToCanvas(nyarugenge, { ...nyarugenge, latitude: nyarugenge.latitude + 0.01 }, 5);
    expect(north.y).toBeLessThan(0.5);
  });
});
