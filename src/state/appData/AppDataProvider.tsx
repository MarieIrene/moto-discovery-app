import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createSampleContactsForDriver, createSampleMessagesForDriver, createSeedData, migrateSeedData } from '@/data/mock';
import { createId } from '@/lib/id';
import { readJson, STORAGE_KEYS, writeJson } from '@/services/storage';
import { AccountStatus, ChatMessage, Driver, GeoPoint, Passenger, Report, ReportStatus, VerificationStatus } from '@/types';
import { ActionMeta, AppDataState, appDataReducer } from './reducer';

interface AppDataContextValue {
  data: AppDataState;
  ready: boolean;
  actions: AppDataActions;
}

export interface AppDataActions {
  setDriverVerification: (driverId: string, status: VerificationStatus, actor: string, reason?: string) => void;
  setDriverAccountStatus: (driverId: string, status: AccountStatus, actor: string, reason?: string) => void;
  setPassengerAccountStatus: (passengerId: string, status: AccountStatus, actor: string, reason?: string) => void;
  setDriverAvailability: (driverId: string, isAvailable: boolean, actor: string) => void;
  setDriverLocation: (driverId: string, location: GeoPoint) => void;
  setPassengerLocation: (passengerId: string, location: GeoPoint) => void;
  upsertSelfDriver: (driver: Driver, isNew: boolean) => void;
  upsertSelfPassenger: (passenger: Passenger, isNew: boolean) => void;
  recordContact: (driverId: string, passengerId: string, actor: string) => void;
  submitReport: (report: Omit<Report, 'id' | 'createdAt' | 'notes' | 'history' | 'status'>, actor: string) => string;
  setReportStatus: (reportId: string, status: ReportStatus, actor: string, reason?: string) => void;
  addReportNote: (reportId: string, body: string, actor: string) => void;
  sendMessage: (message: Omit<ChatMessage, 'id' | 'sentAt' | 'readAt'>) => void;
  markConversationRead: (driverId: string, passengerId: string, reader: ChatMessage['sender']) => void;
  resetDemoData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const meta = (actor: string): ActionMeta => ({ id: createId('evt'), at: new Date().toISOString(), actor });

export function AppDataProvider({ children, initialData }: { children: React.ReactNode; initialData?: AppDataState }) {
  const [data, dispatch] = useReducer(appDataReducer, initialData ?? createSeedData());
  const [ready, setReady] = useState(Boolean(initialData));
  const hydrated = useRef(Boolean(initialData));

  useEffect(() => {
    if (initialData) return;
    readJson<AppDataState>(STORAGE_KEYS.appData).then((stored) => {
      if (stored?.drivers && stored.passengers) dispatch({ type: 'hydrate', data: migrateSeedData(stored) });
      hydrated.current = true;
      setReady(true);
    });
  }, [initialData]);

  // Persist after hydration so the seed never overwrites a user's saved demo state.
  useEffect(() => {
    if (hydrated.current && !initialData) void writeJson(STORAGE_KEYS.appData, data);
  }, [data, initialData]);

  const submitReport = useCallback<AppDataActions['submitReport']>((input, actor) => {
    const id = createId('rep');
    const report: Report = { ...input, id, status: 'open', createdAt: new Date().toISOString(), notes: [], history: [] };
    dispatch({ type: 'report/submit', report, meta: meta(actor) });
    return id;
  }, []);

  const actions = useMemo<AppDataActions>(
    () => ({
      setDriverVerification: (driverId, status, actor, reason) => dispatch({ type: 'driver/setVerification', driverId, status, reason, meta: meta(actor) }),
      setDriverAccountStatus: (driverId, status, actor, reason) => dispatch({ type: 'driver/setAccountStatus', driverId, status, reason, meta: meta(actor) }),
      setPassengerAccountStatus: (passengerId, status, actor, reason) =>
        dispatch({ type: 'passenger/setAccountStatus', passengerId, status, reason, meta: meta(actor) }),
      setDriverAvailability: (driverId, isAvailable, actor) => dispatch({ type: 'driver/setAvailability', driverId, isAvailable, meta: meta(actor) }),
      setDriverLocation: (driverId, location) => dispatch({ type: 'driver/setLocation', driverId, location, at: new Date().toISOString() }),
      setPassengerLocation: (passengerId, location) => dispatch({ type: 'passenger/setLocation', passengerId, location, at: new Date().toISOString() }),
      upsertSelfDriver: (driver, isNew) => {
        dispatch({ type: 'driver/upsertSelf', driver, isNew, meta: meta(driver.fullName) });
        if (isNew) {
          for (const contact of createSampleContactsForDriver(driver.id, driver.district)) {
            dispatch({ type: 'contact/record', contact, meta: { ...meta('Sample data'), at: contact.contactedAt } });
          }
          for (const message of createSampleMessagesForDriver(driver.id, driver.district)) dispatch({ type: 'chat/send', message });
        }
      },
      upsertSelfPassenger: (passenger, isNew) => dispatch({ type: 'passenger/upsertSelf', passenger, isNew, meta: meta(passenger.fullName) }),
      recordContact: (driverId, passengerId, actor) =>
        dispatch({
          type: 'contact/record',
          contact: { id: createId('con'), driverId, passengerId, contactedAt: new Date().toISOString(), method: 'call' },
          meta: meta(actor),
        }),
      submitReport,
      setReportStatus: (reportId, status, actor, reason) => dispatch({ type: 'report/setStatus', reportId, status, reason, meta: meta(actor) }),
      addReportNote: (reportId, body, actor) =>
        dispatch({ type: 'report/addNote', reportId, note: { id: createId('note'), author: actor, body, createdAt: new Date().toISOString() }, meta: meta(actor) }),
      sendMessage: (message) => dispatch({ type: 'chat/send', message: { ...message, id: createId('msg'), sentAt: new Date().toISOString() } }),
      markConversationRead: (driverId, passengerId, reader) =>
        dispatch({ type: 'chat/markRead', driverId, passengerId, reader, at: new Date().toISOString() }),
      resetDemoData: () => dispatch({ type: 'reset', data: createSeedData() }),
    }),
    [submitReport],
  );

  const value = useMemo(() => ({ data, ready, actions }), [data, ready, actions]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
