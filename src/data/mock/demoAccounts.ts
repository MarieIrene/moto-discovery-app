/**
 * Demo-only credentials. These exist so evaluators can walk through flows.
 * None of this is security: a real app verifies OTPs and admin rights on a server.
 */
export const DEMO_OTP_CODE = '123456';
export const DEMO_ADMIN = {
  id: 'admin-demo',
  fullName: 'Demo Admin',
  email: 'admin@motodiscovery.demo',
  accessCode: 'ADMIN-2026',
} as const;
