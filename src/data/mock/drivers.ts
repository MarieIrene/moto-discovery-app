import { DISTRICTS } from '@/data/rwanda';
import { Driver } from '@/types';
import { daysAgo, hoursAgo } from './time';

/**
 * Fictional drivers: a detailed set around Kigali plus a few in every other district, so the app
 * works wherever in Rwanda it is opened. Names, plates and phone numbers are invented.
 * Phone numbers use the +250 700 000 xxx range, which is not a real subscriber range.
 */
export function createMockDrivers(now: Date = new Date()): Driver[] {
  return [...createKigaliDrivers(now), ...createMoreKigaliDrivers(now), ...createDistrictDrivers(now)];
}

function createKigaliDrivers(now: Date): Driver[] {
  return [
    {
      id: 'drv-001', fullName: 'Jean Claude Habimana', phone: '+250700000101',
      district: 'Nyarugenge', sector: 'Nyarugenge', location: { latitude: -1.9468, longitude: 30.0589 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'TVS', model: 'HLX 125', plateNumber: 'RD 214 F', color: 'Red', year: 2021 },
      rating: 4.8, completedTrips: 1240, languages: ['Kinyarwanda', 'English'], yearsRiding: 6,
      registeredAt: daysAgo(410, 10, now), lastActiveAt: hoursAgo(0.2, now),
    },
    {
      id: 'drv-002', fullName: 'Aline Mukamana', phone: '+250700000102',
      district: 'Gasabo', sector: 'Kimihurura', location: { latitude: -1.9531, longitude: 30.0918 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'Bajaj', model: 'Boxer 150', plateNumber: 'RD 588 C', color: 'Black', year: 2022 },
      rating: 4.9, completedTrips: 860, languages: ['Kinyarwanda', 'French', 'English'], yearsRiding: 4,
      registeredAt: daysAgo(300, 11, now), lastActiveAt: hoursAgo(0.1, now),
    },
    {
      id: 'drv-003', fullName: 'Eric Niyonzima', phone: '+250700000103',
      district: 'Gasabo', sector: 'Kacyiru', location: { latitude: -1.9362, longitude: 30.0831 },
      isAvailable: false, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'Honda', model: 'CG 125', plateNumber: 'RD 102 B', color: 'Blue', year: 2019 },
      rating: 4.6, completedTrips: 2105, languages: ['Kinyarwanda', 'Swahili'], yearsRiding: 9,
      registeredAt: daysAgo(620, 9, now), lastActiveAt: hoursAgo(5, now),
    },
    {
      id: 'drv-004', fullName: 'Patrick Mugisha', phone: '+250700000104',
      district: 'Gasabo', sector: 'Remera', location: { latitude: -1.9587, longitude: 30.1127 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'TVS', model: 'Apache RTR 160', plateNumber: 'RD 733 D', color: 'White', year: 2023 },
      rating: 4.7, completedTrips: 512, languages: ['Kinyarwanda', 'English'], yearsRiding: 3,
      registeredAt: daysAgo(190, 14, now), lastActiveAt: hoursAgo(0.5, now),
    },
    {
      id: 'drv-005', fullName: 'Emmanuel Nshimiyimana', phone: '+250700000105',
      district: 'Nyarugenge', sector: 'Nyamirambo', location: { latitude: -1.9772, longitude: 30.0447 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'Bajaj', model: 'Boxer BM100', plateNumber: 'RD 391 A', color: 'Red', year: 2020 },
      rating: 4.5, completedTrips: 1630, languages: ['Kinyarwanda', 'Swahili', 'French'], yearsRiding: 7,
      registeredAt: daysAgo(520, 8, now), lastActiveAt: hoursAgo(0.3, now),
    },
    {
      id: 'drv-006', fullName: 'Olivier Uwimana', phone: '+250700000106',
      district: 'Kicukiro', sector: 'Kicukiro', location: { latitude: -1.9703, longitude: 30.1036 },
      isAvailable: false, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'Yamaha', model: 'Crux', plateNumber: 'RD 845 E', color: 'Silver', year: 2018 },
      rating: 4.4, completedTrips: 1980, languages: ['Kinyarwanda'], yearsRiding: 10,
      registeredAt: daysAgo(700, 9, now), lastActiveAt: hoursAgo(26, now),
    },
    {
      id: 'drv-007', fullName: 'Diane Uwase', phone: '+250700000107',
      district: 'Gasabo', sector: 'Gisozi', location: { latitude: -1.9204, longitude: 30.0607 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'TVS', model: 'HLX 150', plateNumber: 'RD 660 B', color: 'Green', year: 2022 },
      rating: 4.9, completedTrips: 430, languages: ['Kinyarwanda', 'English'], yearsRiding: 3,
      registeredAt: daysAgo(150, 13, now), lastActiveAt: hoursAgo(0.05, now),
    },
    {
      id: 'drv-008', fullName: 'Didier Hakizimana', phone: '+250700000108',
      district: 'Gasabo', sector: 'Kimironko', location: { latitude: -1.9497, longitude: 30.1262 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'Haojue', model: 'HJ125', plateNumber: 'RD 277 G', color: 'Black', year: 2021 },
      rating: 4.3, completedTrips: 980, languages: ['Kinyarwanda', 'French'], yearsRiding: 5,
      registeredAt: daysAgo(340, 15, now), lastActiveAt: hoursAgo(1, now),
    },
    {
      id: 'drv-009', fullName: 'Innocent Ndayisaba', phone: '+250700000109',
      district: 'Kicukiro', sector: 'Gikondo', location: { latitude: -1.9748, longitude: 30.0752 },
      isAvailable: false, verificationStatus: 'approved', accountStatus: 'suspended',
      statusReason: 'Repeated reports of riding without a passenger helmet. Under review.',
      motorcycle: { make: 'Bajaj', model: 'Boxer 150', plateNumber: 'RD 519 C', color: 'Blue', year: 2019 },
      rating: 3.6, completedTrips: 1410, languages: ['Kinyarwanda'], yearsRiding: 8,
      registeredAt: daysAgo(560, 10, now), lastActiveAt: daysAgo(6, 18, now),
    },
    {
      id: 'drv-010', fullName: 'Samuel Tuyishime', phone: '+250700000110',
      district: 'Nyarugenge', sector: 'Kimisagara', location: { latitude: -1.9374, longitude: 30.0458 },
      isAvailable: false, verificationStatus: 'pending', accountStatus: 'active',
      motorcycle: { make: 'TVS', model: 'HLX 125', plateNumber: 'RD 902 H', color: 'Red', year: 2024 },
      rating: 0, completedTrips: 0, languages: ['Kinyarwanda', 'English'], yearsRiding: 2,
      registeredAt: daysAgo(2, 16, now), lastActiveAt: daysAgo(2, 16, now),
    },
    {
      id: 'drv-011', fullName: 'Fabrice Iradukunda', phone: '+250700000111',
      district: 'Gasabo', sector: 'Kinyinya', location: { latitude: -1.9152, longitude: 30.1098 },
      isAvailable: false, verificationStatus: 'pending', accountStatus: 'active',
      motorcycle: { make: 'Honda', model: 'Ace 125', plateNumber: 'RD 118 J', color: 'Black', year: 2023 },
      rating: 0, completedTrips: 0, languages: ['Kinyarwanda', 'French'], yearsRiding: 4,
      registeredAt: daysAgo(4, 10, now), lastActiveAt: daysAgo(4, 10, now),
    },
    {
      id: 'drv-012', fullName: 'Theogene Bizimana', phone: '+250700000112',
      district: 'Kicukiro', sector: 'Kanombe', location: { latitude: -1.9679, longitude: 30.1398 },
      isAvailable: false, verificationStatus: 'rejected', accountStatus: 'active',
      statusReason: 'Plate number did not match the submitted registration details.',
      motorcycle: { make: 'Bajaj', model: 'Boxer BM100', plateNumber: 'RD 450 K', color: 'Grey', year: 2017 },
      rating: 0, completedTrips: 0, languages: ['Kinyarwanda'], yearsRiding: 3,
      registeredAt: daysAgo(12, 12, now), lastActiveAt: daysAgo(9, 12, now),
    },
    {
      id: 'drv-013', fullName: 'Claude Manzi', phone: '+250700000113',
      district: 'Kicukiro', sector: 'Rebero', location: { latitude: -1.9896, longitude: 30.0698 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'TVS', model: 'Apache RTR 160', plateNumber: 'RD 381 L', color: 'Black', year: 2022 },
      rating: 4.6, completedTrips: 720, languages: ['Kinyarwanda', 'English', 'Swahili'], yearsRiding: 5,
      registeredAt: daysAgo(260, 9, now), lastActiveAt: hoursAgo(0.4, now),
    },
    {
      id: 'drv-014', fullName: 'Yves Ishimwe', phone: '+250700000114',
      district: 'Gasabo', sector: 'Kagugu', location: { latitude: -1.9098, longitude: 30.0951 },
      isAvailable: false, verificationStatus: 'pending', accountStatus: 'active',
      motorcycle: { make: 'Haojue', model: 'DK150', plateNumber: 'RD 674 M', color: 'White', year: 2024 },
      rating: 0, completedTrips: 0, languages: ['Kinyarwanda', 'English'], yearsRiding: 1,
      registeredAt: daysAgo(1, 9, now), lastActiveAt: daysAgo(1, 9, now),
    },
    {
      id: 'drv-015', fullName: 'Jean Paul Nkurunziza', phone: '+250700000115',
      district: 'Nyarugenge', sector: 'Nyabugogo', location: { latitude: -1.9396, longitude: 30.0512 },
      isAvailable: true, verificationStatus: 'approved', accountStatus: 'active',
      motorcycle: { make: 'Bajaj', model: 'Boxer 150', plateNumber: 'RD 233 N', color: 'Red', year: 2021 },
      rating: 4.7, completedTrips: 1555, languages: ['Kinyarwanda', 'Swahili'], yearsRiding: 7,
      registeredAt: daysAgo(480, 8, now), lastActiveAt: hoursAgo(0.15, now),
    },
  ];
}

const FIRST = ['Jean Bosco', 'Alice', 'Emmanuel', 'Claudine', 'Faustin', 'Josiane', 'Celestin', 'Vestine', 'Damascene', 'Solange', 'Gilbert', 'Immaculee'];
const LAST = ['Niyitegeka', 'Mukandayisenga', 'Habyarimana', 'Uwamariya', 'Ntawukuriryayo', 'Nyirahabimana', 'Mugabo', 'Uwizeye', 'Twagirimana', 'Ingabire', 'Bizimungu', 'Nsengiyumva'];
const SPOTS = ['Town centre', 'Bus park', 'Market'];
const BIKES = [
  { make: 'TVS', model: 'HLX 125', color: 'Red' },
  { make: 'Bajaj', model: 'Boxer 150', color: 'Black' },
  { make: 'Honda', model: 'CG 125', color: 'Blue' },
  { make: 'Haojue', model: 'HJ125', color: 'White' },
];
// Small offsets (about 1-2 km) so the three drivers in a town don't sit on the same point.
const OFFSETS: [number, number][] = [[0.004, -0.006], [-0.009, 0.005], [0.012, 0.011]];

/** Three verified drivers near the main town of each district outside Kigali; two are online. */
function createDistrictDrivers(now: Date): Driver[] {
  return DISTRICTS.filter((d) => d.province !== 'Kigali City').flatMap((district, di) =>
    OFFSETS.map(([dLat, dLng], k): Driver => {
      const n = di * OFFSETS.length + k;
      const bike = BIKES[n % BIKES.length]!;
      return {
        id: `drv-${district.name.toLowerCase()}-${k + 1}`,
        fullName: `${FIRST[n % FIRST.length]} ${LAST[(n * 5 + di) % LAST.length]}`,
        phone: `+250700000${String(301 + n)}`,
        district: district.name,
        sector: SPOTS[k]!,
        location: { latitude: district.centre.latitude + dLat, longitude: district.centre.longitude + dLng },
        isAvailable: k !== 2,
        verificationStatus: 'approved',
        accountStatus: 'active',
        motorcycle: { ...bike, plateNumber: `RF ${String(100 + n)} ${'ABCDEFGHJK'[n % 10]}`, year: 2018 + (n % 7) },
        rating: Math.round((4.2 + ((n * 7) % 8) / 10) * 10) / 10,
        completedTrips: 150 + ((n * 137) % 1800),
        languages: n % 3 === 0 ? ['Kinyarwanda', 'English'] : n % 3 === 1 ? ['Kinyarwanda', 'French'] : ['Kinyarwanda', 'Swahili'],
        yearsRiding: 1 + (n % 9),
        registeredAt: daysAgo(60 + ((n * 23) % 500), 9 + (n % 8), now),
        lastActiveAt: k === 2 ? hoursAgo(3 + (n % 20), now) : hoursAgo(0.1 + (n % 5) / 10, now),
      };
    }),
  );
}

/** Busy Kigali areas used for the extra sample drivers. Coordinates are approximate. */
const KIGALI_SPOTS: [sector: string, district: string, latitude: number, longitude: number][] = [
  ['Muhima', 'Nyarugenge', -1.9440, 30.0570],
  ['Nyakabanda', 'Nyarugenge', -1.9630, 30.0500],
  ['Gitega', 'Nyarugenge', -1.9560, 30.0560],
  ['Kigali', 'Nyarugenge', -1.9520, 30.0330],
  ['Kibagabaga', 'Gasabo', -1.9310, 30.1180],
  ['Ndera', 'Gasabo', -1.9330, 30.1640],
  ['Rusororo', 'Gasabo', -1.9450, 30.1700],
  ['Bumbogo', 'Gasabo', -1.8950, 30.1300],
  ['Jabana', 'Gasabo', -1.8850, 30.0550],
  ['Gisozi', 'Gasabo', -1.9180, 30.0640],
  ['Niboye', 'Kicukiro', -1.9810, 30.0980],
  ['Gatenga', 'Kicukiro', -1.9850, 30.0800],
  ['Kagarama', 'Kicukiro', -1.9920, 30.1100],
  ['Masaka', 'Kicukiro', -1.9980, 30.1800],
  ['Kanombe', 'Kicukiro', -1.9700, 30.1450],
  ['Nyarugunga', 'Kicukiro', -1.9750, 30.1250],
  ['Kicukiro', 'Kicukiro', -1.9690, 30.1020],
];

const KGL_FIRST = ['Eric', 'Divine', 'Thierry', 'Clarisse', 'Janvier', 'Ange', 'Olivier', 'Nadine', 'Pacifique', 'Sylvie', 'Gad', 'Liliane', 'Aimable', 'Belise', 'Rene', 'Yvonne', 'Fiston'];
const KGL_LAST = ['Mugenzi', 'Uwineza', 'Ndikumana', 'Mukeshimana', 'Hategekimana', 'Iradukunda', 'Kayitare', 'Nyiransabimana', 'Munyaneza'];

/** More verified drivers spread over Kigali so every part of the city has someone nearby. */
function createMoreKigaliDrivers(now: Date): Driver[] {
  return KIGALI_SPOTS.map(([sector, district, latitude, longitude], n): Driver => {
    const bike = BIKES[(n + 1) % BIKES.length]!;
    return {
      id: `drv-kgl-${String(n + 1).padStart(2, '0')}`,
      fullName: `${KGL_FIRST[n % KGL_FIRST.length]} ${KGL_LAST[(n * 4) % KGL_LAST.length]}`,
      phone: `+250700000${String(401 + n)}`,
      district,
      sector,
      location: { latitude, longitude },
      isAvailable: n % 4 !== 3,
      verificationStatus: 'approved',
      accountStatus: 'active',
      motorcycle: { ...bike, plateNumber: `RG ${String(200 + n * 7)} ${'ABCDEFGHJK'[n % 10]}`, year: 2017 + (n % 8) },
      rating: Math.round((4.1 + ((n * 3) % 9) / 10) * 10) / 10,
      completedTrips: 90 + ((n * 211) % 2400),
      languages: n % 2 ? ['Kinyarwanda', 'English'] : ['Kinyarwanda', 'French', 'Swahili'],
      yearsRiding: 1 + (n % 11),
      registeredAt: daysAgo(30 + ((n * 41) % 700), 8 + (n % 9), now),
      lastActiveAt: n % 4 === 3 ? hoursAgo(2 + n, now) : hoursAgo(0.05 + (n % 6) / 10, now),
    };
  });
}
