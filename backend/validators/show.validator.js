import { z } from 'zod';
import { objectIdSchema, dateQuerySchema } from './common.validator.js';
export const listPublicShowsQuerySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    date: dateQuerySchema,
    city: z.string().trim().min(1, 'City is required'),
  }),
});
