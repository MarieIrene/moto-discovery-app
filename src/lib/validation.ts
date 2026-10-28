import { z } from 'zod';
import { normalizeRwandaPhone } from './format';

/** Rwandan mobile numbers: 07X XXX XXXX locally, or +250 7X XXX XXXX. */
export const rwandaPhone = z
  .string()
  .trim()
  .min(1, 'Enter your phone number')
  .refine((v) => /^(\+?250|0)?7\d{8}$/.test(v.replace(/[\s-]/g, '')), 'Enter a Rwandan mobile number, like 078 123 4567')
  .transform(normalizeRwandaPhone);

export const fullName = z
  .string()
  .trim()
  .min(3, 'Enter your full name')
  .max(60, 'Name must be 60 characters or fewer')
  .refine((v) => v.split(/\s+/).length >= 2, 'Enter your first and last name');

export const signInSchema = z.object({ phone: rwandaPhone });

export const registerSchema = z.object({
  fullName,
  phone: rwandaPhone,
  acceptTerms: z.boolean().refine((v) => v, 'Accept the terms to continue'),
});

export const otpSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const plateNumber = z
  .string()
  .trim()
  .toUpperCase()
  .refine((v) => /^R[A-Z]\s?\d{3}\s?[A-Z]$/.test(v), 'Use the format RD 123 A');

const currentYear = new Date().getFullYear();

export const motorcycleSchema = z.object({
  make: z.string().trim().min(2, 'Enter the motorcycle make'),
  model: z.string().trim().min(1, 'Enter the model'),
  plateNumber,
  color: z.string().trim().min(3, 'Enter the colour'),
  year: z.coerce
    .number({ message: 'Enter a year' })
    .int('Enter a whole year')
    .min(2000, 'Year must be 2000 or later')
    .max(currentYear + 1, `Year must be ${currentYear + 1} or earlier`),
});

export const profileSchema = z.object({
  fullName,
  district: z.string().trim().min(2, 'Choose your district'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]),
});

export const driverProfileSchema = profileSchema.extend({ motorcycle: motorcycleSchema });

export const adminSignInSchema = z.object({
  accessCode: z.string().trim().min(1, 'Enter the demo access code'),
});

export const reasonSchema = z.object({
  reason: z.string().trim().min(10, 'Give a reason of at least 10 characters').max(300, 'Keep it under 300 characters'),
});

export const reportSchema = z.object({
  category: z.enum(['unsafe_riding', 'no_helmet', 'overcharging', 'harassment', 'no_show', 'other'], {
    message: 'Choose what happened',
  }),
  description: z.string().trim().min(20, 'Describe what happened in at least 20 characters').max(500, 'Keep it under 500 characters'),
});

export type SignInForm = z.input<typeof signInSchema>;
export type RegisterForm = z.input<typeof registerSchema>;
export type OtpForm = z.input<typeof otpSchema>;
export type ProfileFormInput = z.input<typeof driverProfileSchema>;
export type ReportFormInput = z.input<typeof reportSchema>;

/** Profile form values as typed by the user (year is text in the input). */
export interface ProfileFormValues {
  fullName: string;
  district: string;
  email: string;
  motorcycle?: { make: string; model: string; plateNumber: string; color: string; year: string | number };
}

/** Profile form values after validation and normalisation. */
export interface ProfileFormOutput {
  fullName: string;
  district: string;
  email: string;
  motorcycle?: z.output<typeof motorcycleSchema>;
}

export function profileFormSchema(includeDriver: boolean) {
  return includeDriver ? driverProfileSchema : profileSchema.extend({ motorcycle: z.undefined().optional() });
}
