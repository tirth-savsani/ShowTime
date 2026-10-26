import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

const rowValidator = z.object({
  label: z
    .string({ required_error: 'Row label is required' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{1,2}$/, 'Row label must be 1 or 2 uppercase letters'),
  seatCount: z
    .number({ required_error: 'seatCount is required' })
    .int('seatCount must be an integer')
    .min(1, 'seatCount must be at least 1')
    .max(30, 'seatCount cannot exceed 30'),
  category: z
    .string({ required_error: 'category is required' })
    .trim()
    .toUpperCase()
    .min(2, 'category must be at least 2 characters')
    .max(20, 'category cannot exceed 20 characters'),
  aisleAfter: z
    .array(z.number().int())
    .optional()
    .default([])
    .refine((aisles) => new Set(aisles).size === aisles.length, {
      message: 'aisleAfter numbers must be unique within a row',
    }),
}).refine(
  (row) => {
    return row.aisleAfter.every((aisle) => aisle >= 1 && aisle < row.seatCount);
  },
  {
    message: 'Each aisleAfter number must be between 1 and seatCount - 1',
  }
);

export const createScreenSchema = z.object({
  body: z.object({
    theatre: objectIdSchema,
    name: z
      .string({ required_error: 'Screen name is required' })
      .trim()
      .min(1, 'Screen name must be at least 1 character')
      .max(40, 'Screen name cannot exceed 40 characters'),
    layout: z.object({
      rows: z
        .array(rowValidator)
        .min(1, 'Screen must have at least 1 row')
        .max(26, 'Screen cannot exceed 26 rows')
        .refine(
          (rows) => {
            const labels = rows.map((r) => r.label);
            return new Set(labels).size === labels.length;
          },
          {
            message: 'Row labels must be unique across the screen layout',
          }
        )
        .refine(
          (rows) => {
            const total = rows.reduce((sum, r) => sum + r.seatCount, 0);
            return total <= 600;
          },
          {
            message: 'Total seats cannot exceed 600',
          }
        ),
    }),
  }),
});

export const updateScreenSchema = z.object({
  body: z.object({
    theatre: objectIdSchema.optional(),
    name: z.string().trim().min(1).max(40).optional(),
    layout: z
      .object({
        rows: z
          .array(rowValidator)
          .min(1)
          .max(26)
          .refine(
            (rows) => {
              const labels = rows.map((r) => r.label);
              return new Set(labels).size === labels.length;
            },
            { message: 'Row labels must be unique across the screen layout' }
          )
          .refine(
            (rows) => {
              const total = rows.reduce((sum, r) => sum + r.seatCount, 0);
              return total <= 600;
            },
            { message: 'Total seats cannot exceed 600' }
          ),
      })
      .optional(),
  }),
});
