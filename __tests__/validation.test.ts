import { formatPhone, normalizeRwandaPhone, relativeTime } from '@/lib/format';
import { motorcycleSchema, otpSchema, reasonSchema, registerSchema, signInSchema } from '@/lib/validation';

describe('phone handling', () => {
  it.each([
    ['0781234567', '+250781234567'],
    ['078 123 4567', '+250781234567'],
    ['+250 781 234 567', '+250781234567'],
    ['250731234567', '+250731234567'],
  ])('normalises %s', (input, expected) => {
    expect(normalizeRwandaPhone(input)).toBe(expected);
    expect(signInSchema.parse({ phone: input, password: 'x' }).phone).toBe(expected);
  });

  it('rejects numbers that are not Rwandan mobiles', () => {
    expect(signInSchema.safeParse({ phone: '0221234567' }).success).toBe(false);
    expect(signInSchema.safeParse({ phone: '07812' }).success).toBe(false);
    expect(signInSchema.safeParse({ phone: '' }).success).toBe(false);
  });

  it('formats E.164 numbers for display', () => {
    expect(formatPhone('+250781234567')).toBe('+250 781 234 567');
  });
});

describe('registration', () => {
  it('requires first and last name and accepted terms', () => {
    const base = { fullName: 'Grace Ingabire', phone: '0781234567', password: 'moto2026', confirmPassword: 'moto2026', acceptTerms: true };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, fullName: 'Grace' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
  });

  it('accepts only 6-digit OTP codes', () => {
    expect(otpSchema.safeParse({ code: '123456' }).success).toBe(true);
    expect(otpSchema.safeParse({ code: '12345' }).success).toBe(false);
    expect(otpSchema.safeParse({ code: '12a456' }).success).toBe(false);
  });
});

describe('motorcycle details', () => {
  const valid = { make: 'TVS', model: 'HLX 125', plateNumber: 'rd 214 f', color: 'Red', year: '2021' };

  it('normalises plate number and coerces year', () => {
    const out = motorcycleSchema.parse(valid);
    expect(out.plateNumber).toBe('RD 214 F');
    expect(out.year).toBe(2021);
  });

  it('rejects malformed plates and implausible years', () => {
    expect(motorcycleSchema.safeParse({ ...valid, plateNumber: 'ABC123' }).success).toBe(false);
    expect(motorcycleSchema.safeParse({ ...valid, year: '1990' }).success).toBe(false);
  });
});

describe('admin reasons', () => {
  it('needs at least 10 characters', () => {
    expect(reasonSchema.safeParse({ reason: 'bad' }).success).toBe(false);
    expect(reasonSchema.safeParse({ reason: 'Plate did not match records' }).success).toBe(true);
  });
});

describe('relativeTime', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  it('describes recent times', () => {
    expect(relativeTime('2026-10-20T11:59:50Z', now)).toBe('Just now');
    expect(relativeTime('2026-10-20T11:30:00Z', now)).toBe('30 min ago');
    expect(relativeTime('2026-10-19T12:00:00Z', now)).toBe('Yesterday');
  });
});
