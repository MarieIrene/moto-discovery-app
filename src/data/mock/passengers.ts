import { DISTRICTS } from '@/data/rwanda';
import { Passenger } from '@/types';
import { daysAgo, hoursAgo } from './time';

/**
 * Fictional passengers: the original Kigali set plus more around the city and one in every other
 * district. Each has a last known pickup point, which drivers they contact can see.
 */
export function createMockPassengers(now: Date = new Date()): Passenger[] {
  const at = (latitude: number, longitude: number, hours: number) => ({ location: { latitude, longitude }, locationUpdatedAt: hoursAgo(hours, now) });
  return [
    { id: 'psg-001', fullName: 'Grace Ingabire', phone: '+250700000201', district: 'Gasabo', ...at(-1.9500, 30.1240, 1), accountStatus: 'active', joinedAt: daysAgo(210, 10, now), lastActiveAt: hoursAgo(1, now) },
    { id: 'psg-002', fullName: 'Kevin Mutabazi', phone: '+250700000202', district: 'Nyarugenge', ...at(-1.9410, 30.0560, 3), accountStatus: 'active', joinedAt: daysAgo(95, 12, now), lastActiveAt: hoursAgo(3, now) },
    { id: 'psg-003', fullName: 'Sandrine Umutoni', phone: '+250700000203', district: 'Kicukiro', ...at(-1.9720, 30.1010, 30), accountStatus: 'active', joinedAt: daysAgo(40, 9, now), lastActiveAt: daysAgo(1, 19, now) },
    { id: 'psg-004', fullName: 'Benjamin Rukundo', phone: '+250700000204', district: 'Gasabo', accountStatus: 'suspended', statusReason: 'Abusive messages reported by two drivers.', joinedAt: daysAgo(150, 15, now), lastActiveAt: daysAgo(8, 20, now) },
    { id: 'psg-005', fullName: 'Chantal Nyiraneza', phone: '+250700000205', district: 'Nyarugenge', ...at(-1.9760, 30.0450, 6), accountStatus: 'active', joinedAt: daysAgo(12, 11, now), lastActiveAt: hoursAgo(6, now) },
    { id: 'psg-006', fullName: 'David Kamanzi', phone: '+250700000206', district: 'Kicukiro', ...at(-1.9750, 30.0760, 2), accountStatus: 'active', joinedAt: daysAgo(5, 17, now), lastActiveAt: hoursAgo(2, now) },
    { id: 'psg-007', fullName: 'Esther Uwamahoro', phone: '+250700000207', district: 'Gasabo', ...at(-1.9370, 30.0850, 72), accountStatus: 'active', joinedAt: daysAgo(330, 8, now), lastActiveAt: daysAgo(3, 8, now) },
    { id: 'psg-008', fullName: 'Hervé Gasana', phone: '+250700000208', district: 'Nyarugenge', ...at(-1.9390, 30.0510, 4), accountStatus: 'active', joinedAt: daysAgo(2, 13, now), lastActiveAt: hoursAgo(4, now) },
    { id: 'psg-009', fullName: 'Josiane Mukeshimana', phone: '+250700000209', district: 'Kicukiro', accountStatus: 'active', joinedAt: daysAgo(70, 18, now), lastActiveAt: daysAgo(14, 18, now) },
    { id: 'psg-010', fullName: 'Moses Habyarimana', phone: '+250700000210', district: 'Gasabo', ...at(-1.9590, 30.1120, 9), accountStatus: 'active', joinedAt: daysAgo(25, 7, now), lastActiveAt: hoursAgo(9, now) },
    ...createMorePassengers(now),
  ];
}

const FIRST = ['Aimee', 'Jean de Dieu', 'Florence', 'Patrick', 'Delphine', 'Samuel', 'Gloria', 'Innocent', 'Marie Claire', 'Elie', 'Odette', 'Fabrice', 'Joyeuse', 'Bosco', 'Diane'];
const LAST = ['Umuhoza', 'Nkurunziza', 'Mukamurenzi', 'Habimana', 'Uwera', 'Ntaganda', 'Mutoni', 'Rwigema', 'Kantengwa', 'Niyonsaba', 'Gakwaya'];

/** Eight more around Kigali and one near the main town of every other district. */
function createMorePassengers(now: Date): Passenger[] {
  const kigali: [string, number, number][] = [
    ['Gasabo', -1.9290, 30.1150], ['Gasabo', -1.9200, 30.0660], ['Gasabo', -1.9480, 30.1650], ['Kicukiro', -1.9830, 30.0970],
    ['Kicukiro', -1.9900, 30.1120], ['Nyarugenge', -1.9450, 30.0590], ['Nyarugenge', -1.9610, 30.0520], ['Kicukiro', -1.9700, 30.1440],
  ];
  const places = [
    ...kigali.map(([district, latitude, longitude], i) => ({ id: `psg-kgl-${i + 1}`, district, latitude, longitude })),
    ...DISTRICTS.filter((d) => d.province !== 'Kigali City').map((d) => ({
      id: `psg-${d.name.toLowerCase()}`, district: d.name, latitude: d.centre.latitude - 0.006, longitude: d.centre.longitude + 0.004,
    })),
  ];
  return places.map(({ id, district, latitude, longitude }, n): Passenger => ({
    id,
    fullName: `${FIRST[n % FIRST.length]} ${LAST[(n * 3) % LAST.length]}`,
    phone: `+250700000${String(501 + n)}`,
    district,
    location: { latitude, longitude },
    locationUpdatedAt: hoursAgo(0.3 + (n % 12), now),
    accountStatus: 'active',
    joinedAt: daysAgo(3 + ((n * 29) % 400), 7 + (n % 12), now),
    lastActiveAt: hoursAgo(0.3 + (n % 12), now),
  }));
}
