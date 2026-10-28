import { Passenger } from '@/types';
import { daysAgo, hoursAgo } from './time';

export function createMockPassengers(now: Date = new Date()): Passenger[] {
  return [
    { id: 'psg-001', fullName: 'Grace Ingabire', phone: '+250700000201', district: 'Gasabo', accountStatus: 'active', joinedAt: daysAgo(210, 10, now), lastActiveAt: hoursAgo(1, now) },
    { id: 'psg-002', fullName: 'Kevin Mutabazi', phone: '+250700000202', district: 'Nyarugenge', accountStatus: 'active', joinedAt: daysAgo(95, 12, now), lastActiveAt: hoursAgo(3, now) },
    { id: 'psg-003', fullName: 'Sandrine Umutoni', phone: '+250700000203', district: 'Kicukiro', accountStatus: 'active', joinedAt: daysAgo(40, 9, now), lastActiveAt: daysAgo(1, 19, now) },
    { id: 'psg-004', fullName: 'Benjamin Rukundo', phone: '+250700000204', district: 'Gasabo', accountStatus: 'suspended', statusReason: 'Abusive messages reported by two drivers.', joinedAt: daysAgo(150, 15, now), lastActiveAt: daysAgo(8, 20, now) },
    { id: 'psg-005', fullName: 'Chantal Nyiraneza', phone: '+250700000205', district: 'Nyarugenge', accountStatus: 'active', joinedAt: daysAgo(12, 11, now), lastActiveAt: hoursAgo(6, now) },
    { id: 'psg-006', fullName: 'David Kamanzi', phone: '+250700000206', district: 'Kicukiro', accountStatus: 'active', joinedAt: daysAgo(5, 17, now), lastActiveAt: hoursAgo(2, now) },
    { id: 'psg-007', fullName: 'Esther Uwamahoro', phone: '+250700000207', district: 'Gasabo', accountStatus: 'active', joinedAt: daysAgo(330, 8, now), lastActiveAt: daysAgo(3, 8, now) },
    { id: 'psg-008', fullName: 'Hervé Gasana', phone: '+250700000208', district: 'Nyarugenge', accountStatus: 'active', joinedAt: daysAgo(2, 13, now), lastActiveAt: hoursAgo(4, now) },
    { id: 'psg-009', fullName: 'Josiane Mukeshimana', phone: '+250700000209', district: 'Kicukiro', accountStatus: 'active', joinedAt: daysAgo(70, 18, now), lastActiveAt: daysAgo(14, 18, now) },
    { id: 'psg-010', fullName: 'Moses Habyarimana', phone: '+250700000210', district: 'Gasabo', accountStatus: 'active', joinedAt: daysAgo(25, 7, now), lastActiveAt: hoursAgo(9, now) },
  ];
}
