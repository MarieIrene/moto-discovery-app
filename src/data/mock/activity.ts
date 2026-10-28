import { ActivityEvent } from '@/types';
import { daysAgo, hoursAgo } from './time';

export function createMockActivity(now: Date = new Date()): ActivityEvent[] {
  const e = (id: string, type: ActivityEvent['type'], message: string, subjectId: string, subjectType: ActivityEvent['subjectType'], createdAt: string, actor = 'System'): ActivityEvent =>
    ({ id, type, message, subjectId, subjectType, createdAt, actor });
  return [
    e('act-001', 'report_submitted', 'New overcharging report about Didier Hakizimana', 'rep-003', 'report', hoursAgo(10, now), 'Grace Ingabire'),
    e('act-002', 'driver_registered', 'Yves Ishimwe registered as a driver', 'drv-014', 'driver', daysAgo(1, 9, now)),
    e('act-003', 'report_submitted', 'New unsafe riding report about Patrick Mugisha', 'rep-004', 'report', daysAgo(1, 9, now), 'Moses Habyarimana'),
    e('act-004', 'driver_registered', 'Samuel Tuyishime registered as a driver', 'drv-010', 'driver', daysAgo(2, 16, now)),
    e('act-005', 'passenger_joined', 'Hervé Gasana created a passenger account', 'psg-008', 'passenger', daysAgo(2, 13, now)),
    e('act-006', 'driver_registered', 'Fabrice Iradukunda registered as a driver', 'drv-011', 'driver', daysAgo(4, 10, now)),
    e('act-007', 'driver_suspended', 'Innocent Ndayisaba was suspended', 'drv-009', 'driver', daysAgo(5, 10, now), 'Demo Admin'),
    e('act-008', 'passenger_joined', 'David Kamanzi created a passenger account', 'psg-006', 'passenger', daysAgo(5, 17, now)),
    e('act-009', 'passenger_suspended', 'Benjamin Rukundo was suspended', 'psg-004', 'passenger', daysAgo(8, 20, now), 'Demo Admin'),
    e('act-010', 'driver_rejected', 'Theogene Bizimana’s registration was rejected', 'drv-012', 'driver', daysAgo(10, 11, now), 'Demo Admin'),
  ];
}
