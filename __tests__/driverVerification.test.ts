import { createSeedData } from '@/data/mock';
import { appDataReducer } from '@/state/appData/reducer';
import { buildSelfDriver } from '@/state/SelfRecordSync';
import { needsDriverDocuments, resolveHomeRoute, StoredProfile } from '@/state/SessionProvider';
import { Driver, DriverDocuments, Session } from '@/types';

const NOW = new Date('2026-10-20T12:00:00Z');

const session: Session = { userId: 'usr-1', phone: '+250780000000', token: 't', signedInAt: NOW.toISOString(), isAdmin: false };
const docs = (submittedAt = NOW.toISOString()): DriverDocuments => ({ idCardUri: 'file:///id.jpg', permitUri: 'file:///permit.jpg', selfieUri: 'file:///selfie.jpg', submittedAt });
const moto = { make: 'TVS', model: 'HLX 125', plateNumber: 'RD 123 A', color: 'Red', year: 2022 };
const profile = (patch: Partial<StoredProfile> = {}): StoredProfile => ({
  id: 'usr-1', fullName: 'Aline Uwase', phone: session.phone, district: 'Gasabo', rolePreference: 'driver', motorcycle: moto, ...patch,
});
const flags = { onboardingComplete: true, locationPromptSeen: true };

describe('landing route', () => {
  it('sends signed-out users to the landing page, even after onboarding', () => {
    expect(resolveHomeRoute({ session: null, profile: null, activeRole: null, flags })).toBe('/welcome');
    expect(resolveHomeRoute({ session: null, profile: null, activeRole: null, flags: { ...flags, onboardingComplete: false } })).toBe('/welcome');
  });
});

describe('driver documents requirement', () => {
  it('requires ID, permit and selfie from anyone registered to drive', () => {
    expect(needsDriverDocuments(profile())).toBe(true);
    expect(needsDriverDocuments(profile({ rolePreference: 'both' }))).toBe(true);
    expect(needsDriverDocuments(profile({ documents: docs() }))).toBe(false);
  });

  it('never asks passengers for documents', () => {
    expect(needsDriverDocuments(profile({ rolePreference: 'passenger', motorcycle: undefined }))).toBe(false);
    expect(needsDriverDocuments(null)).toBe(false);
  });

  it('routes drivers to verification before the location step', () => {
    expect(resolveHomeRoute({ session, profile: profile(), activeRole: 'driver', flags: { ...flags, locationPromptSeen: false } })).toBe('/driver-verification');
    expect(resolveHomeRoute({ session, profile: profile({ documents: docs() }), activeRole: 'driver', flags })).toBe('/driver-dashboard');
  });
});

describe('buildSelfDriver with documents', () => {
  it('creates no driver record until documents are submitted', () => {
    expect(buildSelfDriver(profile())).toBeNull();
    expect(buildSelfDriver(profile({ documents: docs() }))).toMatchObject({ verificationStatus: 'pending', documents: docs() });
  });

  it('puts an approved driver back to pending and offline when they submit new documents', () => {
    const approved = { ...buildSelfDriver(profile({ documents: docs() }))!, verificationStatus: 'approved', isAvailable: true } as Driver;
    const resubmitted = buildSelfDriver(profile({ documents: docs('2026-10-21T09:00:00Z') }), approved);
    expect(resubmitted).toMatchObject({ verificationStatus: 'pending', isAvailable: false });
  });

  it('keeps status when the same documents are synced again', () => {
    const approved = { ...buildSelfDriver(profile({ documents: docs() }))!, verificationStatus: 'approved', isAvailable: true } as Driver;
    expect(buildSelfDriver(profile({ documents: docs() }), approved)).toMatchObject({ verificationStatus: 'approved', isAvailable: true });
  });
});

describe('appDataReducer: live location', () => {
  it('moves the driver without adding to the activity feed', () => {
    const state = createSeedData(NOW);
    const at = '2026-10-20T12:05:00Z';
    const next = appDataReducer(state, { type: 'driver/setLocation', driverId: 'drv-001', location: { latitude: -1.95, longitude: 30.06 }, at });
    expect(next.drivers.find((d) => d.id === 'drv-001')).toMatchObject({ location: { latitude: -1.95, longitude: 30.06 }, lastActiveAt: at });
    expect(next.activity).toBe(state.activity);
  });

  it('ignores unknown drivers', () => {
    const state = createSeedData(NOW);
    expect(appDataReducer(state, { type: 'driver/setLocation', driverId: 'nope', location: { latitude: 0, longitude: 0 }, at: NOW.toISOString() })).toBe(state);
  });
});
