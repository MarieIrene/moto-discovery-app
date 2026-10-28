import { Driver } from '@/types';
import { daysAgo, hoursAgo } from './time';

/**
 * Fictional drivers around Kigali. Names, plates and phone numbers are invented.
 * Phone numbers use the +250 700 000 xxx range, which is not a real subscriber range.
 */
export function createMockDrivers(now: Date = new Date()): Driver[] {
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
