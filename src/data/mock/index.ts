import { ActivityEvent, ChatMessage, ContactRecord, Driver, Passenger, Report } from '@/types';
import { createMockActivity } from './activity';
import { createMockContacts } from './contacts';
import { createMockDrivers } from './drivers';
import { createMockPassengers } from './passengers';
import { createMockReports } from './reports';

export interface SeedData {
  drivers: Driver[];
  passengers: Passenger[];
  contacts: ContactRecord[];
  reports: Report[];
  activity: ActivityEvent[];
  messages: ChatMessage[];
  /** Bumped when the seed gains records, so saved demo data can be topped up on next launch. */
  version: number;
}

export const SEED_VERSION = 3;

export function createSeedData(now: Date = new Date()): SeedData {
  return {
    drivers: createMockDrivers(now),
    passengers: createMockPassengers(now),
    contacts: createMockContacts(now),
    reports: createMockReports(now),
    activity: createMockActivity(now),
    messages: [],
    version: SEED_VERSION,
  };
}

/** Records from `seed` whose id isn't in `stored` yet, appended after the stored ones. */
function topUp<T extends { id: string }>(stored: T[] | undefined, seed: T[]): T[] {
  const known = new Set((stored ?? []).map((x) => x.id));
  return [...(stored ?? []), ...seed.filter((x) => !known.has(x.id))];
}

/**
 * Brings demo data saved by an older version up to date without losing what the user did:
 * adds sample records that didn't exist yet (districts outside Kigali, more passengers, calls and
 * reports), the chat list, and pickup points for sample passengers saved without one.
 */
export function migrateSeedData(stored: Partial<SeedData> & Pick<SeedData, 'drivers' | 'passengers'>, now: Date = new Date()): SeedData {
  if (stored.version === SEED_VERSION && stored.messages) return stored as SeedData;
  const seed = createSeedData(now);
  const seedPassenger = new Map(seed.passengers.map((p) => [p.id, p]));
  const passengers = topUp(stored.passengers, seed.passengers).map((p) => {
    const fromSeed = seedPassenger.get(p.id);
    return p.location || !fromSeed?.location ? p : { ...p, location: fromSeed.location, locationUpdatedAt: fromSeed.locationUpdatedAt };
  });
  return {
    drivers: topUp(stored.drivers, seed.drivers),
    passengers,
    contacts: topUp(stored.contacts, seed.contacts),
    reports: topUp(stored.reports, seed.reports),
    activity: topUp(stored.activity, seed.activity).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    messages: stored.messages ?? [],
    version: SEED_VERSION,
  };
}

export { createSampleContactsForDriver } from './contacts';
export { createSampleMessagesForDriver } from './messages';
export * from './demoAccounts';
export * from './locations';
export * from './onboarding';
