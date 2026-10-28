export type AppRole = 'passenger' | 'driver' | 'admin';
export type RolePreference = 'passenger' | 'driver' | 'both';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type AccountStatus = 'active' | 'suspended';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Motorcycle {
  make: string;
  model: string;
  plateNumber: string;
  color: string;
  year: number;
}

/**
 * Photos a driver submits at registration. The selfie is taken live with the front camera so a
 * reviewer can compare the face with the photos on the ID and permit.
 */
export interface DriverDocuments {
  idCardUri: string;
  permitUri: string;
  selfieUri: string;
  submittedAt: string;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  /** Optional image URI. Mock data uses initials avatars so the app works offline. */
  photoUri?: string;
  district: string;
  sector: string;
  location: GeoPoint;
  isAvailable: boolean;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  /** Reason recorded when an admin rejects or suspends the driver. */
  statusReason?: string;
  motorcycle: Motorcycle;
  /** Absent for sample drivers, who were "verified" before this demo began. */
  documents?: DriverDocuments;
  rating: number;
  completedTrips: number;
  languages: string[];
  yearsRiding: number;
  registeredAt: string;
  lastActiveAt: string;
}

export interface Passenger {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  accountStatus: AccountStatus;
  statusReason?: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface ContactRecord {
  id: string;
  driverId: string;
  passengerId: string;
  contactedAt: string;
  method: 'call';
}

export type ReportStatus = 'open' | 'under_review' | 'resolved' | 'dismissed';
export type ReportSeverity = 'low' | 'medium' | 'high';
export type ReportCategory = 'unsafe_riding' | 'no_helmet' | 'overcharging' | 'harassment' | 'no_show' | 'other';

export interface ReportNote {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface StatusChange<S extends string = string> {
  id: string;
  from: S;
  to: S;
  by: string;
  reason?: string;
  at: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterRole: 'passenger' | 'driver';
  subjectId: string;
  subjectRole: 'passenger' | 'driver';
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  description: string;
  createdAt: string;
  notes: ReportNote[];
  history: StatusChange<ReportStatus>[];
}

export type ActivityType =
  | 'driver_registered'
  | 'driver_approved'
  | 'driver_rejected'
  | 'driver_suspended'
  | 'driver_reactivated'
  | 'driver_online'
  | 'driver_offline'
  | 'passenger_joined'
  | 'passenger_suspended'
  | 'passenger_reactivated'
  | 'contact_made'
  | 'report_submitted'
  | 'report_status_changed'
  | 'report_note_added';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  actor: string;
  subjectId: string;
  subjectType: 'driver' | 'passenger' | 'report';
  createdAt: string;
}

/** The person using this device. */
export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  rolePreference: RolePreference;
}

export interface Session {
  userId: string;
  phone: string;
  /** Simulated token; a real app would receive this from an auth server. */
  token: string;
  signedInAt: string;
  isAdmin: boolean;
}

export interface AppSettings {
  /** Upper bound for the passenger radius filter. Set by admin. */
  maxDiscoveryRadiusKm: number;
  useDemoLocation: boolean;
  preferFallbackMap: boolean;
  simulateLoadErrors: boolean;
}
