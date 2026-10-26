import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name cannot exceed 60 characters')
      .regex(
        /^[a-zA-Z\s.'-]+$/,
        'Name can only contain letters, spaces, dots, hyphens, and apostrophes'
      ),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .max(120, 'Email cannot exceed 120 characters')
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password cannot exceed 64 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9][0-9]{9}$/, 'Phone must be a valid 10-digit Indian mobile number')
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  }),
});
