import { useMemo } from 'react';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';
import { Passenger } from '@/types';

export interface DriverPassenger {
  passenger: Passenger;
  /** Most recent call or message between them. */
  lastContactAt: string;
  via: 'call' | 'message';
}

/**
 * Passengers who called or messaged the driver using this device, most recent first. Only these
 * passengers' pickup locations are visible to the driver.
 */
export function useDriverPassengers(): DriverPassenger[] {
  const { data } = useAppData();
  const { profile } = useSession();
  const driverId = profile?.id;
  return useMemo(() => {
    if (!driverId) return [];
    const latest = new Map<string, { at: string; via: DriverPassenger['via'] }>();
    const note = (passengerId: string, at: string, via: DriverPassenger['via']) => {
      const prev = latest.get(passengerId);
      if (!prev || at > prev.at) latest.set(passengerId, { at, via });
    };
    for (const c of data.contacts) if (c.driverId === driverId) note(c.passengerId, c.contactedAt, 'call');
    for (const m of data.messages) if (m.driverId === driverId) note(m.passengerId, m.sentAt, 'message');
    return [...latest.entries()]
      .map(([id, { at, via }]) => ({ passenger: data.passengers.find((p) => p.id === id), lastContactAt: at, via }))
      .filter((r): r is DriverPassenger => !!r.passenger)
      .sort((a, b) => b.lastContactAt.localeCompare(a.lastContactAt));
  }, [data.contacts, data.messages, data.passengers, driverId]);
}

export function useCanSeePassenger(passengerId: string): DriverPassenger | undefined {
  return useDriverPassengers().find((r) => r.passenger.id === passengerId);
}
