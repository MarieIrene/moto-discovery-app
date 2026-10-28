import { AppDataState } from '@/state/appData/reducer';
import { ContactRecord, Driver, Passenger, Report, ReportSeverity, ReportStatus, VerificationStatus, AccountStatus } from '@/types';

export type DateRange = '7d' | '30d' | 'all';

export const DATE_RANGE_LABEL: Record<DateRange, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', all: 'All time' };

export function rangeStart(range: DateRange, now: Date = new Date()): number {
  if (range === 'all') return Number.NEGATIVE_INFINITY;
  const days = range === '7d' ? 7 : 30;
  return now.getTime() - days * 86_400_000;
}

export function withinRange(iso: string, range: DateRange, now: Date = new Date()): boolean {
  return new Date(iso).getTime() >= rangeStart(range, now);
}

export interface DashboardStats {
  drivers: { total: number; approved: number; pending: number; rejected: number; suspended: number; available: number; unavailable: number };
  passengers: { total: number; active: number; suspended: number; newInRange: number };
  contactsInRange: number;
  reports: { open: number; underReview: number; highSeverityOpen: number; inRange: number };
}

/** Every dashboard number comes from here, so counters and lists can never disagree. */
export function selectDashboardStats(state: AppDataState, range: DateRange, now: Date = new Date()): DashboardStats {
  const { drivers, passengers, contacts, reports } = state;
  const activeApproved = drivers.filter((d) => d.verificationStatus === 'approved' && d.accountStatus === 'active');
  const available = activeApproved.filter((d) => d.isAvailable).length;
  const unresolved = (r: Report) => r.status === 'open' || r.status === 'under_review';
  return {
    drivers: {
      total: drivers.length,
      approved: drivers.filter((d) => d.verificationStatus === 'approved').length,
      pending: drivers.filter((d) => d.verificationStatus === 'pending').length,
      rejected: drivers.filter((d) => d.verificationStatus === 'rejected').length,
      suspended: drivers.filter((d) => d.accountStatus === 'suspended').length,
      available,
      unavailable: drivers.length - available,
    },
    passengers: {
      total: passengers.length,
      active: passengers.filter((p) => p.accountStatus === 'active').length,
      suspended: passengers.filter((p) => p.accountStatus === 'suspended').length,
      newInRange: passengers.filter((p) => withinRange(p.joinedAt, range, now)).length,
    },
    contactsInRange: contacts.filter((c) => withinRange(c.contactedAt, range, now)).length,
    reports: {
      open: reports.filter((r) => r.status === 'open').length,
      underReview: reports.filter((r) => r.status === 'under_review').length,
      highSeverityOpen: reports.filter((r) => unresolved(r) && r.severity === 'high').length,
      inRange: reports.filter((r) => withinRange(r.createdAt, range, now)).length,
    },
  };
}

export interface DayBucket {
  label: string;
  count: number;
}

/** Contacts per day for the last `days` days (oldest first), for the dashboard bar chart. */
export function selectContactsPerDay(contacts: ContactRecord[], days: number, now: Date = new Date()): DayBucket[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const start = startOfToday.getTime() - (days - 1 - i) * 86_400_000;
    const end = start + 86_400_000;
    const count = contacts.filter((c) => {
      const t = new Date(c.contactedAt).getTime();
      return t >= start && t < end;
    }).length;
    const d = new Date(start);
    const label = days <= 7 ? dayNames[d.getDay()] ?? '' : `${d.getDate()}`;
    return { label, count };
  });
}

export interface AttentionItem {
  id: string;
  kind: 'pending_driver' | 'high_report';
  title: string;
  subtitle: string;
  targetId: string;
}

export function selectAttentionItems(state: AppDataState): AttentionItem[] {
  const pending: AttentionItem[] = state.drivers
    .filter((d) => d.verificationStatus === 'pending')
    .map((d) => ({ id: `att-${d.id}`, kind: 'pending_driver', title: `${d.fullName} is waiting for verification`, subtitle: `${d.motorcycle.make} ${d.motorcycle.model}, ${d.motorcycle.plateNumber}`, targetId: d.id }));
  const reports: AttentionItem[] = state.reports
    .filter((r) => (r.status === 'open' || r.status === 'under_review') && r.severity !== 'low')
    .map((r) => ({ id: `att-${r.id}`, kind: 'high_report', title: `${r.severity === 'high' ? 'High' : 'Medium'} severity report`, subtitle: r.description, targetId: r.id }));
  return [...reports, ...pending];
}

export interface DriverListFilters {
  query: string;
  verification: VerificationStatus | 'all';
  availability: 'available' | 'unavailable' | 'all';
  account: AccountStatus | 'all';
}

export function filterAdminDrivers(drivers: Driver[], f: DriverListFilters): Driver[] {
  const q = f.query.trim().toLowerCase();
  return drivers
    .filter((d) => f.verification === 'all' || d.verificationStatus === f.verification)
    .filter((d) => f.account === 'all' || d.accountStatus === f.account)
    .filter((d) => f.availability === 'all' || (f.availability === 'available' ? d.isAvailable : !d.isAvailable))
    .filter((d) => !q || [d.fullName, d.phone, d.motorcycle.plateNumber, d.sector, d.district].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
}

export interface PassengerListFilters {
  query: string;
  account: AccountStatus | 'all';
}

export function filterAdminPassengers(passengers: Passenger[], f: PassengerListFilters): Passenger[] {
  const q = f.query.trim().toLowerCase();
  return passengers
    .filter((p) => f.account === 'all' || p.accountStatus === f.account)
    .filter((p) => !q || [p.fullName, p.phone, p.district].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
}

export interface ReportListFilters {
  status: ReportStatus | 'all';
  severity: ReportSeverity | 'all';
}

const SEVERITY_RANK: Record<ReportSeverity, number> = { high: 0, medium: 1, low: 2 };

export function filterReports(reports: Report[], f: ReportListFilters): Report[] {
  return reports
    .filter((r) => f.status === 'all' || r.status === f.status)
    .filter((r) => f.severity === 'all' || r.severity === f.severity)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.createdAt.localeCompare(a.createdAt));
}

export function nameForUser(state: AppDataState, id: string): string {
  return state.drivers.find((d) => d.id === id)?.fullName ?? state.passengers.find((p) => p.id === id)?.fullName ?? 'Unknown user';
}

export function contactsForDriver(state: AppDataState, driverId: string): ContactRecord[] {
  return state.contacts.filter((c) => c.driverId === driverId);
}

export function contactsForPassenger(state: AppDataState, passengerId: string): ContactRecord[] {
  return state.contacts.filter((c) => c.passengerId === passengerId);
}

export function reportsAboutUser(state: AppDataState, userId: string): Report[] {
  return state.reports.filter((r) => r.subjectId === userId || r.reporterId === userId);
}

export function activityForSubject(state: AppDataState, subjectId: string) {
  return state.activity.filter((a) => a.subjectId === subjectId);
}
