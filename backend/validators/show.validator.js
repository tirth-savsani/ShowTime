import { z } from 'zod';
import { objectIdSchema, dateQuerySchema } from './common.validator.js';
import { SHOW_STATUSES, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../config/constants.js';

export const createShowSchema = z.object({
  body: z.object({
    movie: objectIdSchema,
    screen: objectIdSchema,
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'startTime must be a valid ISO date-time string',
    }),
    language: z.string().trim().min(1, 'Language is required').max(40),
    format: z.string().trim().min(1, 'Format is required').max(20),
    pricing: z
      .record(
        z.string(),
        z.coerce
          .number()
          .int('Price must be an integer')
          .min(50, 'Price must be at least 50')
          .max(5000, 'Price cannot exceed 5000')
      )
      .refine((obj) => Object.keys(obj).length > 0, {
        message: 'Pricing must contain at least one category',
      }),
  }),
});

export const updateShowSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    startTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'startTime must be a valid ISO date-time string',
      })
      .optional(),
    screen: objectIdSchema.optional(),
    language: z.string().trim().min(1).max(40).optional(),
    format: z.string().trim().min(1).max(20).optional(),
    pricing: z
      .record(
        z.string(),
        z.coerce
          .number()
          .int('Price must be an integer')
          .min(50, 'Price must be at least 50')
          .max(5000, 'Price cannot exceed 5000')
      )
      .optional(),
    status: z.enum(Object.values(SHOW_STATUSES)).optional(),
  }),
});

export const listPublicShowsQuerySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    date: dateQuerySchema,
    city: z.string().trim().min(1, 'City is required'),
  }),
});

export const listAdminShowsQuerySchema = z.object({
  query: z.object({
    movie: objectIdSchema.optional(),
    theatre: objectIdSchema.optional(),
    date: dateQuerySchema.optional(),
    status: z.enum(Object.values(SHOW_STATUSES)).optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : DEFAULT_PAGE_LIMIT))
      .pipe(z.number().int().min(1).max(MAX_PAGE_LIMIT)),
  }),
});

export const cancelShowSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    cascade: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});
