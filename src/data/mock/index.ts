import { ActivityEvent, ContactRecord, Driver, Passenger, Report } from '@/types';
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
}

export function createSeedData(now: Date = new Date()): SeedData {
  return {
    drivers: createMockDrivers(now),
    passengers: createMockPassengers(now),
    contacts: createMockContacts(now),
    reports: createMockReports(now),
    activity: createMockActivity(now),
  };
}

export { createSampleContactsForDriver } from './contacts';
export * from './demoAccounts';
export * from './locations';
export * from './onboarding';
