import { findDistrict } from '@/data/rwanda';
import { ChatMessage } from '@/types';
import { hoursAgo } from './time';

/**
 * Sample passenger messages for a newly registered driver (the person using this device), so the
 * Messages tab, call logs and "where is my passenger" map have something real to show. The first
 * passenger lives in the driver's own district, so they're close by.
 */
export function createSampleMessagesForDriver(driverId: string, district?: string, now: Date = new Date()): ChatMessage[] {
  const d = findDistrict(district);
  const local = !d || d.province === 'Kigali City' ? 'psg-kgl-6' : `psg-${d.name.toLowerCase()}`;
  const m = (n: number, passengerId: string, sender: ChatMessage['sender'], body: string, hours: number, read: boolean): ChatMessage => ({
    id: `msg-self-${driverId}-${n}`, driverId, passengerId, sender, body, sentAt: hoursAgo(hours, now), readAt: read ? hoursAgo(hours - 0.01, now) : undefined,
  });
  return [
    m(0, 'psg-002', 'passenger', 'Hello, can you take me to Nyabugogo tomorrow at 7?', 26, true),
    m(1, 'psg-002', 'driver', 'Yes, no problem. I will call you at 6:50.', 25.9, true),
    m(2, 'psg-002', 'passenger', 'Murakoze!', 25.8, true),
    m(3, local, 'passenger', 'Muraho! I am waiting near the bus park. Can you come and pick me up?', 0.3, false),
  ];
}
