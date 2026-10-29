import { useEffect } from 'react';
import { demoLocationFor } from '@/data/mock';
import { Driver, Passenger } from '@/types';
import { useAppData } from './appData/AppDataProvider';
import { canUseRole, StoredProfile, useSession } from './SessionProvider';

export function buildSelfDriver(profile: StoredProfile, existing?: Driver): Driver | null {
  // The driver record (and the "registered" event admins see) only exists once documents are in.
  if (!profile.motorcycle || !profile.documents) return null;
  const resubmitted = !!existing?.documents && existing.documents.submittedAt !== profile.documents.submittedAt;
  const now = new Date().toISOString();
  return {
    id: profile.id,
    fullName: profile.fullName,
    phone: profile.phone,
    district: profile.district,
    sector: existing?.sector ?? profile.district,
    location: existing?.location ?? demoLocationFor(profile.district),
    isAvailable: resubmitted ? false : existing?.isAvailable ?? false,
    // New documents always go back to review, even if the driver was approved before.
    verificationStatus: resubmitted ? 'pending' : existing?.verificationStatus ?? 'pending',
    accountStatus: existing?.accountStatus ?? 'active',
    statusReason: existing?.statusReason,
    motorcycle: profile.motorcycle,
    documents: profile.documents,
    rating: existing?.rating ?? 0,
    completedTrips: existing?.completedTrips ?? 0,
    languages: existing?.languages ?? ['Kinyarwanda'],
    yearsRiding: existing?.yearsRiding ?? 1,
    registeredAt: existing?.registeredAt ?? now,
    lastActiveAt: now,
  };
}

export function buildSelfPassenger(profile: StoredProfile, existing?: Passenger): Passenger {
  const now = new Date().toISOString();
  return {
    id: profile.id,
    fullName: profile.fullName,
    phone: profile.phone,
    district: profile.district,
    location: existing?.location,
    locationUpdatedAt: existing?.locationUpdatedAt,
    accountStatus: existing?.accountStatus ?? 'active',
    statusReason: existing?.statusReason,
    joinedAt: existing?.joinedAt ?? now,
    lastActiveAt: now,
  };
}

/**
 * Keeps the device user's own driver/passenger records in the shared demo data in step with their
 * profile: creates them after setup, updates them after edits, and restores them after a demo reset.
 * In production these records would be created by the backend at registration.
 */
export function SelfRecordSync() {
  const { profile } = useSession();
  const { data, ready, actions } = useAppData();

  useEffect(() => {
    if (!ready || !profile) return;
    const driver = data.drivers.find((d) => d.id === profile.id);
    const passenger = data.passengers.find((p) => p.id === profile.id);

    if (canUseRole(profile.rolePreference, 'driver')) {
      const next = buildSelfDriver(profile, driver);
      const changed = next && (!driver || driver.fullName !== next.fullName || driver.district !== next.district ||
        JSON.stringify(driver.motorcycle) !== JSON.stringify(next.motorcycle) || driver.documents?.submittedAt !== next.documents?.submittedAt);
      if (next && changed) actions.upsertSelfDriver(next, !driver);
    }
    if (canUseRole(profile.rolePreference, 'passenger')) {
      const changed = !passenger || passenger.fullName !== profile.fullName || passenger.district !== profile.district;
      if (changed) actions.upsertSelfPassenger(buildSelfPassenger(profile, passenger), !passenger);
    }
  }, [profile, ready, data.drivers, data.passengers, actions]);

  return null;
}
