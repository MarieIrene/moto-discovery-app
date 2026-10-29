import { sha256Hex } from '@/lib/sha256';
import { readSecureJson, SECURE_KEYS, writeSecureJson } from './secureStorage';

/**
 * SIMULATED account store: phone number → password hash, kept in the device's secure storage.
 * Passwords are never stored, only a salted SHA-256 hash. A real app sends the password to a
 * server over HTTPS and checks it there with a slow hash (bcrypt, scrypt or Argon2).
 */
export interface Credential {
  userId: string;
  salt: string;
  hash: string;
  updatedAt: string;
}

type Registry = Record<string, Credential>;

export type PasswordCheck = { ok: true; userId: string } | { ok: false; reason: 'no_account' | 'wrong_password' | 'locked'; retryInSeconds?: number };

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;
const failures = new Map<string, { count: number; lockedUntil: number }>();

/** 16 random bytes as hex. Uses the platform's secure random source when there is one. */
function newSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${password}`);
}

async function readRegistry(): Promise<Registry> {
  return (await readSecureJson<Registry>(SECURE_KEYS.accounts)) ?? {};
}

export async function findAccount(phone: string): Promise<Credential | null> {
  return (await readRegistry())[phone] ?? null;
}

/** Creates or replaces the password for a phone number. */
export async function saveCredentials(phone: string, userId: string, password: string): Promise<void> {
  const salt = newSalt();
  const registry = await readRegistry();
  registry[phone] = { userId, salt, hash: await hashPassword(password, salt), updatedAt: new Date().toISOString() };
  await writeSecureJson(SECURE_KEYS.accounts, registry);
  failures.delete(phone);
}

export async function removeCredentials(phone: string): Promise<void> {
  const registry = await readRegistry();
  delete registry[phone];
  await writeSecureJson(SECURE_KEYS.accounts, registry);
}

/** Checks a password. After 5 wrong tries the number is locked for 30 seconds to slow down guessing. */
export async function checkPassword(phone: string, password: string, now = Date.now()): Promise<PasswordCheck> {
  const record = failures.get(phone);
  if (record && record.lockedUntil > now) return { ok: false, reason: 'locked', retryInSeconds: Math.ceil((record.lockedUntil - now) / 1000) };

  const account = await findAccount(phone);
  if (!account) return { ok: false, reason: 'no_account' };
  if ((await hashPassword(password, account.salt)) === account.hash) {
    failures.delete(phone);
    return { ok: true, userId: account.userId };
  }
  // Counting starts again once a lock has run out.
  const count = (record && !record.lockedUntil ? record.count : 0) + 1;
  failures.set(phone, count >= MAX_ATTEMPTS ? { count: 0, lockedUntil: now + LOCK_MS } : { count, lockedUntil: 0 });
  return { ok: false, reason: 'wrong_password' };
}
