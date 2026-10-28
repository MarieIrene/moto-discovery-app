import { ContactRecord } from '@/types';
import { daysAgo, hoursAgo } from './time';

/** Historical passenger → driver calls. Spread over ~30 days so dashboard date filters show variation. */
export function createMockContacts(now: Date = new Date()): ContactRecord[] {
  const rows: [string, string, string][] = [
    ['drv-001', 'psg-001', hoursAgo(1.5, now)],
    ['drv-002', 'psg-002', hoursAgo(3, now)],
    ['drv-007', 'psg-005', hoursAgo(6, now)],
    ['drv-001', 'psg-006', hoursAgo(8, now)],
    ['drv-015', 'psg-008', hoursAgo(20, now)],
    ['drv-004', 'psg-010', daysAgo(1, 8, now)],
    ['drv-005', 'psg-003', daysAgo(1, 19, now)],
    ['drv-002', 'psg-001', daysAgo(2, 7, now)],
    ['drv-013', 'psg-006', daysAgo(2, 18, now)],
    ['drv-008', 'psg-007', daysAgo(3, 8, now)],
    ['drv-001', 'psg-002', daysAgo(3, 17, now)],
    ['drv-003', 'psg-010', daysAgo(4, 9, now)],
    ['drv-007', 'psg-005', daysAgo(5, 12, now)],
    ['drv-009', 'psg-004', daysAgo(6, 18, now)],
    ['drv-015', 'psg-002', daysAgo(8, 7, now)],
    ['drv-006', 'psg-009', daysAgo(10, 16, now)],
    ['drv-002', 'psg-007', daysAgo(12, 9, now)],
    ['drv-004', 'psg-001', daysAgo(14, 20, now)],
    ['drv-005', 'psg-003', daysAgo(17, 13, now)],
    ['drv-001', 'psg-009', daysAgo(20, 8, now)],
    ['drv-013', 'psg-010', daysAgo(24, 18, now)],
    ['drv-003', 'psg-002', daysAgo(27, 10, now)],
  ];
  return rows.map(([driverId, passengerId, contactedAt], i) => ({
    id: `con-${String(i + 1).padStart(3, '0')}`,
    driverId,
    passengerId,
    contactedAt,
    method: 'call',
  }));
}

/**
 * Sample passenger calls attached to a newly registered driver (the person using this device),
 * so the driver dashboard has realistic "recent passenger contacts" without a backend.
 */
export function createSampleContactsForDriver(driverId: string, now: Date = new Date()): ContactRecord[] {
  const samples: [string, number][] = [['psg-002', 2], ['psg-005', 7], ['psg-001', 26], ['psg-010', 50]];
  return samples.map(([passengerId, h], i) => ({
    id: `con-self-${driverId}-${i}`,
    driverId,
    passengerId,
    contactedAt: hoursAgo(h, now),
    method: 'call',
  }));
}
