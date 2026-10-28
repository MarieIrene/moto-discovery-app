import { router } from 'expo-router';
import { ActivityEvent } from '@/types';

export const openAdminDriver = (id: string) => router.push({ pathname: '/admin/driver/[id]', params: { id } });
export const openAdminPassenger = (id: string) => router.push({ pathname: '/admin/passenger/[id]', params: { id } });
export const openAdminReport = (id: string) => router.push({ pathname: '/admin/report/[id]', params: { id } });

export function openActivitySubject(event: ActivityEvent) {
  if (event.subjectType === 'driver') openAdminDriver(event.subjectId);
  else if (event.subjectType === 'passenger') openAdminPassenger(event.subjectId);
  else openAdminReport(event.subjectId);
}
