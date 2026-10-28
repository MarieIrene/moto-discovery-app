import { createSeedData } from '@/data/mock';
import {
  filterAdminDrivers, filterReports, selectAttentionItems, selectContactsPerDay, selectDashboardStats,
} from '@/features/admin/selectors';
import { appDataReducer } from '@/state/appData/reducer';

const NOW = new Date('2026-10-20T12:00:00Z');
const meta = { id: 'e1', at: NOW.toISOString(), actor: 'Demo Admin' };

describe('dashboard statistics', () => {
  it('derives counts that add up', () => {
    const data = createSeedData(NOW);
    const s = selectDashboardStats(data, 'all', NOW);
    expect(s.drivers.total).toBe(data.drivers.length);
    expect(s.drivers.approved + s.drivers.pending + s.drivers.rejected).toBe(s.drivers.total);
    expect(s.drivers.available + s.drivers.unavailable).toBe(s.drivers.total);
    expect(s.passengers.active + s.passengers.suspended).toBe(s.passengers.total);
    expect(s.contactsInRange).toBe(data.contacts.length);
  });

  it('narrows contacts by date range', () => {
    const data = createSeedData(NOW);
    const week = selectDashboardStats(data, '7d', NOW).contactsInRange;
    const month = selectDashboardStats(data, '30d', NOW).contactsInRange;
    expect(week).toBeLessThan(month);
    expect(week).toBeGreaterThan(0);
  });

  it('updates counters after an admin action', () => {
    const data = createSeedData(NOW);
    const before = selectDashboardStats(data, 'all', NOW);
    const after = selectDashboardStats(
      appDataReducer(data, { type: 'driver/setVerification', driverId: 'drv-010', status: 'approved', meta }),
      'all',
      NOW,
    );
    expect(after.drivers.pending).toBe(before.drivers.pending - 1);
    expect(after.drivers.approved).toBe(before.drivers.approved + 1);
  });

  it('suspending an available driver reduces the available count', () => {
    const data = createSeedData(NOW);
    const before = selectDashboardStats(data, 'all', NOW).drivers.available;
    const next = appDataReducer(data, { type: 'driver/setAccountStatus', driverId: 'drv-001', status: 'suspended', reason: 'Safety review', meta });
    expect(selectDashboardStats(next, 'all', NOW).drivers.available).toBe(before - 1);
  });

  it('buckets contacts per day with matching totals', () => {
    const data = createSeedData(NOW);
    const days = selectContactsPerDay(data.contacts, 7, NOW);
    expect(days).toHaveLength(7);
    const total = days.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBeLessThanOrEqual(data.contacts.length);
    expect(total).toBeGreaterThan(0);
  });
});

describe('admin lists', () => {
  it('filters drivers by status and search', () => {
    const { drivers } = createSeedData(NOW);
    const pending = filterAdminDrivers(drivers, { query: '', verification: 'pending', availability: 'all', account: 'all' });
    expect(pending.every((d) => d.verificationStatus === 'pending')).toBe(true);
    const byPlate = filterAdminDrivers(drivers, { query: 'rd 214', verification: 'all', availability: 'all', account: 'all' });
    expect(byPlate.map((d) => d.id)).toEqual(['drv-001']);
  });

  it('sorts reports by severity first', () => {
    const { reports } = createSeedData(NOW);
    const sorted = filterReports(reports, { status: 'all', severity: 'all' });
    expect(sorted[0]?.severity).toBe('high');
    expect(sorted[sorted.length - 1]?.severity).toBe('low');
  });

  it('lists pending drivers and serious open reports as needing attention', () => {
    const items = selectAttentionItems(createSeedData(NOW));
    expect(items.some((i) => i.kind === 'pending_driver')).toBe(true);
    expect(items.some((i) => i.kind === 'high_report')).toBe(true);
  });
});
