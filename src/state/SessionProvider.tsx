import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_ADMIN } from '@/data/mock';
import { createId } from '@/lib/id';
import { findAccount, removeCredentials, saveCredentials } from '@/services/credentials';
import { deleteSecure, profileKey, readSecureJson, SECURE_KEYS, writeSecureJson } from '@/services/secureStorage';
import * as auth from '@/services/simulatedAuth';
import { readJson, removeKeys, STORAGE_KEYS, writeJson } from '@/services/storage';
import { AppRole, DriverDocuments, Motorcycle, RolePreference, Session, UserProfile } from '@/types';

/** Driver details captured during setup; kept with the profile so the driver record can be rebuilt locally. */
export interface StoredProfile extends UserProfile {
  motorcycle?: Motorcycle;
  documents?: DriverDocuments;
}

/** A registration or password reset waiting for its SMS code. Held in memory only, never saved. */
interface PendingAuth {
  mode: 'register' | 'reset';
  phone: string;
  fullName?: string;
  /** The new password, kept until the code is confirmed and then hashed. */
  password?: string;
  expiresAt: string;
}

interface DeviceFlags {
  onboardingComplete: boolean;
  locationPromptSeen: boolean;
}

type ConfirmResult = { ok: true } | { ok: false; message: string };

interface SessionContextValue {
  ready: boolean;
  session: Session | null;
  profile: StoredProfile | null;
  activeRole: AppRole | null;
  flags: DeviceFlags;
  pendingAuth: PendingAuth | null;
  draftRole: RolePreference | null;
  completeOnboarding: () => void;
  markLocationPromptSeen: () => void;
  beginAuth: (input: { mode: PendingAuth['mode']; phone: string; password: string; fullName?: string }) => Promise<ConfirmResult>;
  signIn: (phone: string, password: string) => Promise<ConfirmResult>;
  resendOtp: () => Promise<void>;
  confirmOtp: (code: string) => Promise<ConfirmResult>;
  chooseRole: (role: RolePreference) => void;
  completeProfile: (profile: Omit<StoredProfile, 'id' | 'phone'>) => Promise<void>;
  updateProfile: (patch: Partial<Omit<StoredProfile, 'id' | 'phone'>>) => Promise<void>;
  switchRole: (role: 'passenger' | 'driver') => void;
  signInAdmin: (accessCode: string) => Promise<ConfirmResult>;
  signOut: () => Promise<void>;
  deleteLocalAccount: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const ROLE_FOR_PREFERENCE: Record<RolePreference, 'passenger' | 'driver'> = { passenger: 'passenger', driver: 'driver', both: 'passenger' };

export function canUseRole(pref: RolePreference | undefined, role: 'passenger' | 'driver'): boolean {
  if (!pref) return false;
  return pref === 'both' || pref === role;
}

/** Anyone registered to drive must submit their ID, permit and a live selfie before using the app. */
export function needsDriverDocuments(profile: StoredProfile | null): boolean {
  return !!profile && canUseRole(profile.rolePreference, 'driver') && !profile.documents;
}

/** Reads an account's profile, moving one saved by an older version (single profile key) if needed. */
async function loadProfile(userId: string): Promise<StoredProfile | null> {
  const stored = await readSecureJson<StoredProfile>(profileKey(userId));
  if (stored) return stored;
  const legacy = await readSecureJson<StoredProfile>(SECURE_KEYS.profile);
  if (legacy?.id !== userId) return null;
  await writeSecureJson(profileKey(userId), legacy);
  return legacy;
}

const saveProfile = (profile: StoredProfile) => writeSecureJson(profileKey(profile.id), profile);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const [flags, setFlags] = useState<DeviceFlags>({ onboardingComplete: false, locationPromptSeen: false });
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const [draftRole, setDraftRole] = useState<RolePreference | null>(null);

  useEffect(() => {
    (async () => {
      const [storedSession, storedFlags, storedRole] = await Promise.all([
        readSecureJson<Session>(SECURE_KEYS.session),
        readJson<DeviceFlags>(STORAGE_KEYS.onboardingComplete),
        readJson<AppRole>(STORAGE_KEYS.activeRole),
      ]);
      if (storedFlags) setFlags(storedFlags);
      if (storedSession) {
        setSession(storedSession);
        const storedProfile = storedSession.isAdmin ? null : await loadProfile(storedSession.userId);
        if (storedSession.isAdmin) setActiveRole('admin');
        else if (storedProfile) {
          setProfile(storedProfile);
          const role = storedRole && storedRole !== 'admin' && canUseRole(storedProfile.rolePreference, storedRole)
            ? storedRole
            : ROLE_FOR_PREFERENCE[storedProfile.rolePreference];
          setActiveRole(role);
        }
      }
      setReady(true);
    })();
  }, []);

  const saveFlags = useCallback((patch: Partial<DeviceFlags>) => {
    setFlags((prev) => {
      const next = { ...prev, ...patch };
      void writeJson(STORAGE_KEYS.onboardingComplete, next);
      return next;
    });
  }, []);

  const setRole = useCallback((role: AppRole | null) => {
    setActiveRole(role);
    if (role) void writeJson(STORAGE_KEYS.activeRole, role);
  }, []);

  const startSession = useCallback(async (userId: string, phone: string, token: string) => {
    const nextSession: Session = { userId, phone, token, signedInAt: new Date().toISOString(), isAdmin: false };
    await writeSecureJson(SECURE_KEYS.session, nextSession);
    const match = await loadProfile(userId);
    setSession(nextSession);
    setProfile(match);
    setRole(match ? ROLE_FOR_PREFERENCE[match.rolePreference] : null);
  }, [setRole]);

  const beginAuth = useCallback<SessionContextValue['beginAuth']>(async ({ mode, phone, password, fullName }) => {
    const registered = await auth.isPhoneRegistered(phone);
    if (mode === 'register' && registered) {
      return { ok: false, message: 'An account already uses this phone number. Sign in with your password instead.' };
    }
    if (mode === 'reset' && !registered) {
      return { ok: false, message: 'No account uses this phone number on this device. Create an account instead.' };
    }
    const request = await auth.requestOtp(phone);
    setPendingAuth({ mode, phone, password, fullName, expiresAt: request.expiresAt });
    return { ok: true };
  }, []);

  const signIn = useCallback<SessionContextValue['signIn']>(async (phone, password) => {
    const result = await auth.signInWithPassword(phone, password);
    if (!result.ok) return result;
    await startSession(result.userId, phone, result.token);
    return { ok: true };
  }, [startSession]);

  const resendOtp = useCallback(async () => {
    if (!pendingAuth) return;
    const request = await auth.requestOtp(pendingAuth.phone);
    setPendingAuth({ ...pendingAuth, expiresAt: request.expiresAt });
  }, [pendingAuth]);

  const confirmOtp = useCallback<SessionContextValue['confirmOtp']>(
    async (code) => {
      if (!pendingAuth?.password) return { ok: false, message: 'This code expired. Start again.' };
      const result = await auth.verifyOtp(code);
      if (!result.ok) return result;
      const { phone, password } = pendingAuth;

      let userId: string;
      if (pendingAuth.mode === 'reset') {
        const account = await findAccount(phone);
        if (!account) return { ok: false, message: 'No account uses this phone number on this device.' };
        userId = account.userId;
      } else {
        // A profile made before passwords existed is kept: registering its number again adopts it.
        const legacy = await readSecureJson<StoredProfile>(SECURE_KEYS.profile);
        userId = legacy?.phone === phone ? legacy.id : createId('usr');
      }
      await saveCredentials(phone, userId, password);
      await startSession(userId, phone, result.token);
      // Forget the plain password as soon as it has been hashed.
      setPendingAuth({ ...pendingAuth, password: undefined });
      return { ok: true };
    },
    [pendingAuth, startSession],
  );

  const completeProfile = useCallback<SessionContextValue['completeProfile']>(
    async (input) => {
      if (!session) throw new Error('No session');
      const next: StoredProfile = { ...input, id: session.userId, phone: session.phone };
      await saveProfile(next);
      setProfile(next);
      setRole(ROLE_FOR_PREFERENCE[next.rolePreference]);
      setPendingAuth(null);
      setDraftRole(null);
    },
    [session, setRole],
  );

  const updateProfile = useCallback<SessionContextValue['updateProfile']>(
    async (patch) => {
      if (!profile) return;
      const next: StoredProfile = { ...profile, ...patch };
      await saveProfile(next);
      setProfile(next);
      if (activeRole && activeRole !== 'admin' && !canUseRole(next.rolePreference, activeRole)) {
        setRole(ROLE_FOR_PREFERENCE[next.rolePreference]);
      }
    },
    [profile, activeRole, setRole],
  );

  const switchRole = useCallback<SessionContextValue['switchRole']>(
    (role) => {
      if (profile && canUseRole(profile.rolePreference, role)) setRole(role);
    },
    [profile, setRole],
  );

  const signInAdmin = useCallback<SessionContextValue['signInAdmin']>(
    async (accessCode) => {
      const result = await auth.verifyAdminAccessCode(accessCode);
      if (!result.ok) return result;
      const next: Session = { userId: DEMO_ADMIN.id, phone: '', token: result.token, signedInAt: new Date().toISOString(), isAdmin: true };
      await writeSecureJson(SECURE_KEYS.session, next);
      setSession(next);
      setProfile(null);
      setActiveRole('admin');
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await deleteSecure(SECURE_KEYS.session);
    setSession(null);
    setProfile(null);
    setActiveRole(null);
    setPendingAuth(null);
  }, []);

  const deleteLocalAccount = useCallback(async () => {
    const tasks = [deleteSecure(SECURE_KEYS.session)];
    if (session && !session.isAdmin) {
      tasks.push(deleteSecure(profileKey(session.userId)), removeCredentials(session.phone));
      const legacy = await readSecureJson<StoredProfile>(SECURE_KEYS.profile);
      if (legacy?.id === session.userId) tasks.push(deleteSecure(SECURE_KEYS.profile));
    }
    await Promise.all(tasks);
    await removeKeys([STORAGE_KEYS.activeRole]);
    setSession(null);
    setProfile(null);
    setActiveRole(null);
  }, [session]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ready, session, profile, activeRole, flags, pendingAuth, draftRole,
      completeOnboarding: () => saveFlags({ onboardingComplete: true }),
      markLocationPromptSeen: () => saveFlags({ locationPromptSeen: true }),
      beginAuth, signIn, resendOtp, confirmOtp,
      chooseRole: setDraftRole,
      completeProfile, updateProfile, switchRole, signInAdmin, signOut, deleteLocalAccount,
    }),
    [ready, session, profile, activeRole, flags, pendingAuth, draftRole, saveFlags, beginAuth, signIn, resendOtp, confirmOtp, completeProfile, updateProfile, switchRole, signInAdmin, signOut, deleteLocalAccount],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** Display name used as the "actor" in activity logs. */
export function useActorName(): string {
  const { session, profile } = useSession();
  if (session?.isAdmin) return DEMO_ADMIN.fullName;
  return profile?.fullName ?? 'Guest';
}

/** Where the root index should send the user, given current session state. */
export function resolveHomeRoute(s: Pick<SessionContextValue, 'session' | 'profile' | 'activeRole' | 'flags'>): string {
  // Signed-out users always land on the hero page, which links to sign-in and registration.
  if (!s.session) return '/welcome';
  if (s.session.isAdmin) return '/admin-dashboard';
  if (!s.profile) return '/role-select';
  if (needsDriverDocuments(s.profile)) return '/driver-verification';
  if (!s.flags.locationPromptSeen) return '/location-permission';
  return s.activeRole === 'driver' ? '/driver-dashboard' : '/home';
}
