import { DEMO_ADMIN, DEMO_OTP_CODE } from '@/data/mock';
import { createId } from '@/lib/id';

/**
 * SIMULATED authentication. Nothing leaves the device and no SMS is sent.
 * Replace this module with real API calls when a backend exists; the screens only depend on these signatures.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface OtpRequest {
  phone: string;
  expiresAt: string;
}

export async function requestOtp(phone: string): Promise<OtpRequest> {
  await delay(700);
  return { phone, expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() };
}

export async function verifyOtp(code: string): Promise<{ ok: true; token: string } | { ok: false; message: string }> {
  await delay(600);
  if (code.trim() !== DEMO_OTP_CODE) return { ok: false, message: 'That code is not correct. In this demo, the code is 123456.' };
  return { ok: true, token: createId('demo-token') };
}

export async function verifyAdminAccessCode(code: string): Promise<{ ok: true; token: string } | { ok: false; message: string }> {
  await delay(600);
  if (code.trim().toUpperCase() !== DEMO_ADMIN.accessCode) return { ok: false, message: 'Access code not recognised.' };
  return { ok: true, token: createId('demo-admin-token') };
}
