import { createSeedData, demoLocationFor, migrateSeedData, SEED_VERSION } from '@/data/mock';
import { DISTRICTS, districtsIn, nearestDistrict, PROVINCES } from '@/data/rwanda';
import { conversationsFor, threadMessages, unreadCount } from '@/features/chat/conversations';
import { simulatedReply } from '@/features/chat/simulatedReplies';
import { filterNearbyDrivers } from '@/features/discovery/filterDrivers';
import { profileSchema, registerSchema, resetPasswordSchema, signInSchema } from '@/lib/validation';
import { sha256Hex } from '@/lib/sha256';
import { checkPassword, removeCredentials, saveCredentials } from '@/services/credentials';
import { appDataReducer } from '@/state/appData/reducer';
import { ChatMessage } from '@/types';

const mockStore = new Map<string, string>();
jest.mock('@/services/secureStorage', () => ({
  SECURE_KEYS: { session: 's', profile: 'p', accounts: 'a' },
  profileKey: (id: string) => `p_${id}`,
  readSecureJson: async (k: string) => (mockStore.has(k) ? JSON.parse(mockStore.get(k)!) : null),
  writeSecureJson: async (k: string, v: unknown) => void mockStore.set(k, JSON.stringify(v)),
  deleteSecure: async (k: string) => void mockStore.delete(k),
}));

const NOW = new Date('2026-10-29T12:00:00Z');

describe('districts of Rwanda', () => {
  it('lists all 30 districts in the 5 provinces', () => {
    expect(DISTRICTS).toHaveLength(30);
    expect(new Set(DISTRICTS.map((d) => d.name)).size).toBe(30);
    expect(PROVINCES.map((p) => districtsIn(p).length)).toEqual([3, 5, 8, 7, 7]);
  });

  it('accepts only real districts on the profile', () => {
    expect(profileSchema.safeParse({ fullName: 'Aline Uwase', district: 'Musanze', email: '' }).success).toBe(true);
    expect(profileSchema.safeParse({ fullName: 'Aline Uwase', district: 'Atlantis', email: '' }).success).toBe(false);
  });

  it('centres the demo location on the district of the user', () => {
    expect(demoLocationFor('Huye')).toEqual(DISTRICTS.find((d) => d.name === 'Huye')!.centre);
    expect(nearestDistrict({ latitude: -1.70, longitude: 29.26 }).name).toBe('Rubavu');
  });

  it('has verified drivers online near every district town', () => {
    const { drivers } = createSeedData(NOW);
    for (const district of DISTRICTS) {
      const near = filterNearbyDrivers(drivers, district.centre, { radiusKm: 5, availability: 'available', query: '' });
      expect(near.length).toBeGreaterThan(0);
    }
  });

  it('gives every sample driver a unique id, phone and plate', () => {
    const { drivers } = createSeedData(NOW);
    for (const key of ['id', 'phone'] as const) expect(new Set(drivers.map((d) => d[key])).size).toBe(drivers.length);
    expect(new Set(drivers.map((d) => d.motorcycle.plateNumber)).size).toBe(drivers.length);
  });

  it('tops up demo data saved by an older version without losing changes', () => {
    const seed = createSeedData(NOW);
    const old: Partial<typeof seed> = { ...seed, drivers: seed.drivers.slice(0, 15).map((d) => (d.id === 'drv-001' ? { ...d, isAvailable: false } : d)) };
    delete old.messages;
    delete old.version;
    const migrated = migrateSeedData(old as typeof seed, NOW);
    expect(migrated.drivers).toHaveLength(seed.drivers.length);
    expect(migrated.drivers.find((d) => d.id === 'drv-001')?.isAvailable).toBe(false);
    expect(migrated).toMatchObject({ messages: [], version: SEED_VERSION });
  });
});

describe('chat', () => {
  const msg = (id: string, sender: ChatMessage['sender'], sentAt: string, patch: Partial<ChatMessage> = {}): ChatMessage =>
    ({ id, driverId: 'drv-001', passengerId: 'usr-1', sender, body: id, sentAt, ...patch });

  it('marks only the other side of the conversation as read', () => {
    let state = createSeedData(NOW);
    state = appDataReducer(state, { type: 'chat/send', message: msg('a', 'passenger', '2026-10-29T10:00:00Z') });
    state = appDataReducer(state, { type: 'chat/send', message: msg('b', 'driver', '2026-10-29T10:01:00Z') });
    expect(unreadCount(state.messages, 'passenger', 'usr-1')).toBe(1);
    expect(unreadCount(state.messages, 'driver', 'drv-001')).toBe(1);

    const read = appDataReducer(state, { type: 'chat/markRead', driverId: 'drv-001', passengerId: 'usr-1', reader: 'passenger', at: NOW.toISOString() });
    expect(unreadCount(read.messages, 'passenger', 'usr-1')).toBe(0);
    expect(unreadCount(read.messages, 'driver', 'drv-001')).toBe(1);
    expect(appDataReducer(read, { type: 'chat/markRead', driverId: 'drv-001', passengerId: 'usr-1', reader: 'passenger', at: NOW.toISOString() })).toBe(read);
  });

  it('keeps chats out of the admin activity feed', () => {
    const state = createSeedData(NOW);
    const next = appDataReducer(state, { type: 'chat/send', message: msg('a', 'passenger', NOW.toISOString()) });
    expect(next.activity).toBe(state.activity);
  });

  it('groups conversations by person, newest first', () => {
    const messages = [
      msg('1', 'passenger', '2026-10-29T09:00:00Z'),
      msg('2', 'driver', '2026-10-29T09:05:00Z'),
      msg('3', 'passenger', '2026-10-29T11:00:00Z', { driverId: 'drv-002' }),
      msg('4', 'passenger', '2026-10-29T12:00:00Z', { passengerId: 'usr-other' }),
    ];
    const rows = conversationsFor(messages, 'passenger', 'usr-1');
    expect(rows.map((r) => [r.peerId, r.last.id, r.unread])).toEqual([['drv-002', '3', 0], ['drv-001', '2', 1]]);
    expect(threadMessages(messages, 'drv-001', 'usr-1').map((m) => m.id)).toEqual(['1', '2']);
  });

  it('gives sample drivers a sensible reply', () => {
    expect(simulatedReply('How much to town?', 'driver')).toMatch(/price/);
    expect(simulatedReply('Muraho! Are you available?', 'driver')).toMatch(/available/);
    expect(simulatedReply('this is fine', 'driver')).not.toMatch(/available/);
  });
});

describe('phone and password accounts', () => {
  beforeEach(() => mockStore.clear());

  it('hashes with standard SHA-256', () => {
    const { createHash } = jest.requireActual('crypto');
    for (const text of ['', 'abc', 'salt:moto2026', 'Muraho Rwanda — ndaje', 'x'.repeat(200)]) {
      expect(sha256Hex(text)).toBe(createHash('sha256').update(text).digest('hex'));
    }
  });

  it('requires a password with letters and a number, typed twice', () => {
    const base = { fullName: 'Grace Ingabire', phone: '0781234567', password: 'moto2026', confirmPassword: 'moto2026', acceptTerms: true };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, password: 'abc1', confirmPassword: 'abc1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: 'motomoto', confirmPassword: 'motomoto' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, confirmPassword: 'moto2027' }).error?.issues[0]?.path).toEqual(['confirmPassword']);
    expect(signInSchema.safeParse({ phone: '0781234567', password: '' }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ phone: '0781234567', password: 'new2026', confirmPassword: 'new2026' }).success).toBe(true);
  });

  it('stores only a salted hash and checks the password', async () => {
    await saveCredentials('+250781234567', 'usr-1', 'moto2026');
    expect(mockStore.get('a')).not.toContain('moto2026');
    await expect(checkPassword('+250781234567', 'moto2026')).resolves.toEqual({ ok: true, userId: 'usr-1' });
    await expect(checkPassword('+250781234567', 'wrong123')).resolves.toMatchObject({ ok: false, reason: 'wrong_password' });
    await expect(checkPassword('+250789999999', 'moto2026')).resolves.toMatchObject({ ok: false, reason: 'no_account' });
  });

  it('locks a number for 30 seconds after 5 wrong passwords', async () => {
    await saveCredentials('+250781234568', 'usr-2', 'moto2026');
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) await checkPassword('+250781234568', 'nope1234', t);
    await expect(checkPassword('+250781234568', 'moto2026', t + 1000)).resolves.toMatchObject({ ok: false, reason: 'locked', retryInSeconds: 29 });
    await expect(checkPassword('+250781234568', 'moto2026', t + 31_000)).resolves.toEqual({ ok: true, userId: 'usr-2' });
  });

  it('replaces the old password on reset', async () => {
    await saveCredentials('+250781234569', 'usr-3', 'old2026');
    await saveCredentials('+250781234569', 'usr-3', 'new2026');
    await expect(checkPassword('+250781234569', 'old2026')).resolves.toMatchObject({ ok: false });
    await expect(checkPassword('+250781234569', 'new2026')).resolves.toMatchObject({ ok: true });
    await removeCredentials('+250781234569');
    await expect(checkPassword('+250781234569', 'new2026')).resolves.toMatchObject({ reason: 'no_account' });
  });
});

describe('passenger pickup location and demo data', () => {
  it('stores the passenger position, ignoring tiny GPS jitter', () => {
    const state = createSeedData(NOW);
    const at = NOW.toISOString();
    const moved = appDataReducer(state, { type: 'passenger/setLocation', passengerId: 'psg-001', location: { latitude: -1.9600, longitude: 30.1000 }, at });
    expect(moved.passengers.find((p) => p.id === 'psg-001')).toMatchObject({ location: { latitude: -1.96, longitude: 30.1 }, locationUpdatedAt: at });
    const jitter = appDataReducer(moved, { type: 'passenger/setLocation', passengerId: 'psg-001', location: { latitude: -1.96005, longitude: 30.10005 }, at });
    expect(jitter).toBe(moved);
  });

  it('has passengers with pickup points in every district', () => {
    const { passengers } = createSeedData(NOW);
    for (const d of DISTRICTS) expect(passengers.some((p) => p.district === d.name && p.location)).toBe(true);
  });

  it('adds new sample passengers and their pickup points to older saved data', () => {
    const seed = createSeedData(NOW);
    const old = {
      ...seed,
      version: 2,
      passengers: seed.passengers.slice(0, 10).map(({ location: _l, locationUpdatedAt: _u, ...p }) => p),
      contacts: seed.contacts.slice(0, 22),
    };
    const migrated = migrateSeedData(old, NOW);
    expect(migrated.passengers).toHaveLength(seed.passengers.length);
    expect(migrated.passengers.find((p) => p.id === 'psg-001')?.location).toBeDefined();
    expect(migrated.contacts).toHaveLength(seed.contacts.length);
  });
});
