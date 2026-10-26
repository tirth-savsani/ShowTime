import { z } from 'zod';

export const createTheatreSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Theatre name is required' })
      .trim()
      .min(2, 'Theatre name must be at least 2 characters')
      .max(80, 'Theatre name cannot exceed 80 characters'),
    city: z
      .string({ required_error: 'City is required' })
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(60, 'City cannot exceed 60 characters'),
    address: z
      .string({ required_error: 'Address is required' })
      .trim()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address cannot exceed 200 characters'),
    amenities: z
      .array(z.string().trim())
      .optional()
      .default([])
      .refine((v) => v.length <= 8, {
        message: 'Amenities cannot exceed 8 items',
      }),
  }),
});

export const updateTheatreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    city: z.string().trim().min(2).max(60).optional(),
    address: z.string().trim().min(5).max(200).optional(),
    amenities: z
      .array(z.string().trim())
      .optional()
      .refine((v) => !v || v.length <= 8, {
        message: 'Amenities cannot exceed 8 items',
      }),
    isActive: z.boolean().optional(),
  }),
});

export const updateTheatreStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive status is required' }),
  }),
});
