import { createSeedData } from '@/data/mock';
import { ActionMeta, appDataReducer, AppDataState } from '@/state/appData/reducer';

const NOW = new Date('2026-10-20T12:00:00Z');
let n = 0;
const meta = (actor = 'Demo Admin'): ActionMeta => ({ id: `evt-${++n}`, at: NOW.toISOString(), actor });

function seed(): AppDataState {
  return createSeedData(NOW);
}

describe('appDataReducer: driver verification', () => {
  it('approves a pending driver and logs activity', () => {
    const state = seed();
    const next = appDataReducer(state, { type: 'driver/setVerification', driverId: 'drv-010', status: 'approved', meta: meta() });
    expect(next.drivers.find((d) => d.id === 'drv-010')?.verificationStatus).toBe('approved');
    expect(next.activity[0]).toMatchObject({ type: 'driver_approved', subjectId: 'drv-010', actor: 'Demo Admin' });
    expect(next.activity).toHaveLength(state.activity.length + 1);
  });

  it('stores the reason and takes the driver offline when rejected', () => {
    const state = seed();
    const next = appDataReducer(state, { type: 'driver/setVerification', driverId: 'drv-001', status: 'rejected', reason: 'Documents expired', meta: meta() });
    const d = next.drivers.find((x) => x.id === 'drv-001');
    expect(d).toMatchObject({ verificationStatus: 'rejected', statusReason: 'Documents expired', isAvailable: false });
  });

  it('is a no-op when status does not change', () => {
    const state = seed();
    const next = appDataReducer(state, { type: 'driver/setVerification', driverId: 'drv-001', status: 'approved', meta: meta() });
    expect(next).toBe(state);
  });
});

describe('appDataReducer: account status and availability', () => {
  it('suspending a driver forces them offline; reactivating clears the reason', () => {
    let state = seed();
    state = appDataReducer(state, { type: 'driver/setAccountStatus', driverId: 'drv-002', status: 'suspended', reason: 'Safety review', meta: meta() });
    expect(state.drivers.find((d) => d.id === 'drv-002')).toMatchObject({ accountStatus: 'suspended', isAvailable: false, statusReason: 'Safety review' });
    state = appDataReducer(state, { type: 'driver/setAccountStatus', driverId: 'drv-002', status: 'active', meta: meta() });
    expect(state.drivers.find((d) => d.id === 'drv-002')).toMatchObject({ accountStatus: 'active', statusReason: undefined });
    expect(state.activity[0]?.type).toBe('driver_reactivated');
  });

  it('refuses to put an unverified or suspended driver online', () => {
    const state = seed();
    const pending = appDataReducer(state, { type: 'driver/setAvailability', driverId: 'drv-010', isAvailable: true, meta: meta() });
    expect(pending).toBe(state);
    const suspended = appDataReducer(state, { type: 'driver/setAvailability', driverId: 'drv-009', isAvailable: true, meta: meta() });
    expect(suspended).toBe(state);
  });

  it('lets a verified driver go online and offline', () => {
    let state = seed();
    state = appDataReducer(state, { type: 'driver/setAvailability', driverId: 'drv-003', isAvailable: true, meta: meta('Eric') });
    expect(state.drivers.find((d) => d.id === 'drv-003')?.isAvailable).toBe(true);
    expect(state.activity[0]).toMatchObject({ type: 'driver_online', actor: 'Eric' });
  });

  it('suspends and reactivates passengers', () => {
    let state = seed();
    state = appDataReducer(state, { type: 'passenger/setAccountStatus', passengerId: 'psg-001', status: 'suspended', reason: 'Repeated no-shows', meta: meta() });
    expect(state.passengers.find((p) => p.id === 'psg-001')?.accountStatus).toBe('suspended');
    expect(state.activity[0]?.type).toBe('passenger_suspended');
  });
});

describe('appDataReducer: reports', () => {
  it('moves a report through its lifecycle with history', () => {
    let state = seed();
    state = appDataReducer(state, { type: 'report/setStatus', reportId: 'rep-003', status: 'under_review', meta: meta() });
    state = appDataReducer(state, { type: 'report/setStatus', reportId: 'rep-003', status: 'resolved', reason: 'Refund agreed', meta: meta() });
    const report = state.reports.find((r) => r.id === 'rep-003');
    expect(report?.status).toBe('resolved');
    expect(report?.history.map((h) => `${h.from}->${h.to}`)).toEqual(['open->under_review', 'under_review->resolved']);
    expect(report?.history[1]?.reason).toBe('Refund agreed');
  });

  it('appends internal notes', () => {
    const state = appDataReducer(seed(), {
      type: 'report/addNote', reportId: 'rep-004',
      note: { id: 'n1', author: 'Demo Admin', body: 'Called reporter', createdAt: NOW.toISOString() }, meta: meta(),
    });
    expect(state.reports.find((r) => r.id === 'rep-004')?.notes).toHaveLength(1);
    expect(state.activity[0]?.type).toBe('report_note_added');
  });
});
