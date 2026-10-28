import { useMemo } from 'react';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';

/** The device user's own driver record plus the passenger calls made to them. */
export function useSelfDriver() {
  const { data } = useAppData();
  const { profile } = useSession();
  const driver = data.drivers.find((d) => d.id === profile?.id);
  const contacts = useMemo(
    () => data.contacts.filter((c) => c.driverId === profile?.id).sort((a, b) => b.contactedAt.localeCompare(a.contactedAt)),
    [data.contacts, profile?.id],
  );
  const passengerName = (id: string) => data.passengers.find((p) => p.id === id)?.fullName ?? 'Passenger';
  return { driver, contacts, passengerName, activity: data.activity.filter((a) => a.subjectId === profile?.id) };
}
