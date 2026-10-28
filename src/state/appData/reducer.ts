import { SeedData } from '@/data/mock';
import {
  AccountStatus,
  ActivityEvent,
  ActivityType,
  ContactRecord,
  Driver,
  GeoPoint,
  Passenger,
  Report,
  ReportNote,
  ReportStatus,
  VerificationStatus,
} from '@/types';

/**
 * All shared demo records live here. Passenger discovery, the driver dashboard and every admin
 * screen read from this one state, so an admin action (e.g. suspending a driver) is immediately
 * reflected everywhere. The reducer is pure: ids and timestamps arrive in the action (`meta`),
 * which keeps it deterministic and easy to test.
 */
export type AppDataState = SeedData;

export interface ActionMeta {
  /** Id for the activity/history entry this action creates. */
  id: string;
  at: string;
  actor: string;
}

export type AppDataAction =
  | { type: 'hydrate'; data: AppDataState }
  | { type: 'reset'; data: AppDataState }
  | { type: 'driver/upsertSelf'; driver: Driver; meta: ActionMeta; isNew: boolean }
  | { type: 'driver/setAvailability'; driverId: string; isAvailable: boolean; meta: ActionMeta }
  | { type: 'driver/setLocation'; driverId: string; location: GeoPoint; at: string }
  | { type: 'driver/setVerification'; driverId: string; status: VerificationStatus; reason?: string; meta: ActionMeta }
  | { type: 'driver/setAccountStatus'; driverId: string; status: AccountStatus; reason?: string; meta: ActionMeta }
  | { type: 'passenger/upsertSelf'; passenger: Passenger; meta: ActionMeta; isNew: boolean }
  | { type: 'passenger/setAccountStatus'; passengerId: string; status: AccountStatus; reason?: string; meta: ActionMeta }
  | { type: 'contact/record'; contact: ContactRecord; meta: ActionMeta }
  | { type: 'report/submit'; report: Report; meta: ActionMeta }
  | { type: 'report/setStatus'; reportId: string; status: ReportStatus; reason?: string; meta: ActionMeta }
  | { type: 'report/addNote'; reportId: string; note: ReportNote; meta: ActionMeta };

/** Activity feed is capped so local storage stays small. */
export const ACTIVITY_LIMIT = 200;

function logActivity(
  state: AppDataState,
  meta: ActionMeta,
  type: ActivityType,
  message: string,
  subjectId: string,
  subjectType: ActivityEvent['subjectType'],
): ActivityEvent[] {
  const event: ActivityEvent = { id: meta.id, type, message, actor: meta.actor, subjectId, subjectType, createdAt: meta.at };
  return [event, ...state.activity].slice(0, ACTIVITY_LIMIT);
}

function updateById<T extends { id: string }>(items: T[], id: string, patch: (item: T) => T): T[] {
  return items.map((item) => (item.id === id ? patch(item) : item));
}

const VERIFICATION_ACTIVITY: Record<VerificationStatus, ActivityType> = {
  approved: 'driver_approved',
  rejected: 'driver_rejected',
  pending: 'driver_registered',
};

export function appDataReducer(state: AppDataState, action: AppDataAction): AppDataState {
  switch (action.type) {
    case 'hydrate':
    case 'reset':
      return action.data;

    case 'driver/upsertSelf': {
      const exists = state.drivers.some((d) => d.id === action.driver.id);
      const drivers = exists
        ? updateById(state.drivers, action.driver.id, () => action.driver)
        : [action.driver, ...state.drivers];
      if (!action.isNew) return { ...state, drivers };
      return {
        ...state,
        drivers,
        activity: logActivity(state, action.meta, 'driver_registered', `${action.driver.fullName} registered as a driver`, action.driver.id, 'driver'),
      };
    }

    case 'driver/setAvailability': {
      const driver = state.drivers.find((d) => d.id === action.driverId);
      if (!driver || driver.isAvailable === action.isAvailable) return state;
      // Suspended or unverified drivers can't go online; the UI prevents this too.
      if (action.isAvailable && (driver.accountStatus !== 'active' || driver.verificationStatus !== 'approved')) return state;
      return {
        ...state,
        drivers: updateById(state.drivers, action.driverId, (d) => ({ ...d, isAvailable: action.isAvailable, lastActiveAt: action.meta.at })),
        activity: logActivity(
          state,
          action.meta,
          action.isAvailable ? 'driver_online' : 'driver_offline',
          `${driver.fullName} went ${action.isAvailable ? 'online' : 'offline'}`,
          driver.id,
          'driver',
        ),
      };
    }

    case 'driver/setLocation':
      // Position pings are frequent, so they update the record without adding to the activity feed.
      if (!state.drivers.some((d) => d.id === action.driverId)) return state;
      return { ...state, drivers: updateById(state.drivers, action.driverId, (d) => ({ ...d, location: action.location, lastActiveAt: action.at })) };

    case 'driver/setVerification': {
      const driver = state.drivers.find((d) => d.id === action.driverId);
      if (!driver || driver.verificationStatus === action.status) return state;
      const verb = action.status === 'approved' ? 'was approved' : action.status === 'rejected' ? 'was rejected' : 'was returned to pending review';
      return {
        ...state,
        drivers: updateById(state.drivers, action.driverId, (d) => ({
          ...d,
          verificationStatus: action.status,
          statusReason: action.status === 'approved' ? undefined : action.reason,
          // A driver who is no longer verified can't remain visible to passengers.
          isAvailable: action.status === 'approved' ? d.isAvailable : false,
        })),
        activity: logActivity(state, action.meta, VERIFICATION_ACTIVITY[action.status], `${driver.fullName} ${verb}`, driver.id, 'driver'),
      };
    }

    case 'driver/setAccountStatus': {
      const driver = state.drivers.find((d) => d.id === action.driverId);
      if (!driver || driver.accountStatus === action.status) return state;
      const suspended = action.status === 'suspended';
      return {
        ...state,
        drivers: updateById(state.drivers, action.driverId, (d) => ({
          ...d,
          accountStatus: action.status,
          statusReason: suspended ? action.reason : undefined,
          isAvailable: suspended ? false : d.isAvailable,
        })),
        activity: logActivity(
          state,
          action.meta,
          suspended ? 'driver_suspended' : 'driver_reactivated',
          `${driver.fullName} was ${suspended ? 'suspended' : 'reactivated'}`,
          driver.id,
          'driver',
        ),
      };
    }

    case 'passenger/upsertSelf': {
      const exists = state.passengers.some((p) => p.id === action.passenger.id);
      const passengers = exists
        ? updateById(state.passengers, action.passenger.id, () => action.passenger)
        : [action.passenger, ...state.passengers];
      if (!action.isNew) return { ...state, passengers };
      return {
        ...state,
        passengers,
        activity: logActivity(state, action.meta, 'passenger_joined', `${action.passenger.fullName} created a passenger account`, action.passenger.id, 'passenger'),
      };
    }

    case 'passenger/setAccountStatus': {
      const passenger = state.passengers.find((p) => p.id === action.passengerId);
      if (!passenger || passenger.accountStatus === action.status) return state;
      const suspended = action.status === 'suspended';
      return {
        ...state,
        passengers: updateById(state.passengers, action.passengerId, (p) => ({
          ...p,
          accountStatus: action.status,
          statusReason: suspended ? action.reason : undefined,
        })),
        activity: logActivity(
          state,
          action.meta,
          suspended ? 'passenger_suspended' : 'passenger_reactivated',
          `${passenger.fullName} was ${suspended ? 'suspended' : 'reactivated'}`,
          passenger.id,
          'passenger',
        ),
      };
    }

    case 'contact/record': {
      const driver = state.drivers.find((d) => d.id === action.contact.driverId);
      return {
        ...state,
        contacts: [action.contact, ...state.contacts],
        activity: logActivity(state, action.meta, 'contact_made', `A passenger called ${driver?.fullName ?? 'a driver'}`, action.contact.driverId, 'driver'),
      };
    }

    case 'report/submit':
      return {
        ...state,
        reports: [action.report, ...state.reports],
        activity: logActivity(state, action.meta, 'report_submitted', 'New report submitted', action.report.id, 'report'),
      };

    case 'report/setStatus': {
      const report = state.reports.find((r) => r.id === action.reportId);
      if (!report || report.status === action.status) return state;
      const change = { id: action.meta.id, from: report.status, to: action.status, by: action.meta.actor, reason: action.reason, at: action.meta.at };
      return {
        ...state,
        reports: updateById(state.reports, action.reportId, (r) => ({ ...r, status: action.status, history: [...r.history, change] })),
        activity: logActivity(state, action.meta, 'report_status_changed', `Report ${report.id} moved to ${action.status.replace('_', ' ')}`, report.id, 'report'),
      };
    }

    case 'report/addNote': {
      const report = state.reports.find((r) => r.id === action.reportId);
      if (!report) return state;
      return {
        ...state,
        reports: updateById(state.reports, action.reportId, (r) => ({ ...r, notes: [...r.notes, action.note] })),
        activity: logActivity(state, action.meta, 'report_note_added', `Note added to report ${report.id}`, report.id, 'report'),
      };
    }

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
