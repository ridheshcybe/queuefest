import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  clinicName: z.string().min(2, 'Clinic name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const addPatientSchema = z.object({
  name: z.string().min(1, 'Patient name is required'),
  priority: z.enum(['Normal', 'Urgent', 'Emergency']).default('Normal'),
});

export const tokenLookupSchema = z.object({
  token: z.string().regex(/^[A-Z0-9]{6}$/, 'Invalid token format'),
});