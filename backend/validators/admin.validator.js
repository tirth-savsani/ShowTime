/**
 * Admin Validators (Spec B4)
 * Zod schemas for admin bookings query and user status update.
 */

import { z } from 'zod';
import { objectIdSchema, paginationSchema } from './common.validator.js';
import { BOOKING_STATUSES } from '../config/constants.js';

/**
 * Query schema for GET /api/admin/bookings
 * Filters: movie (ObjectId), status, email, dateFrom, dateTo; pagination via paginationSchema.
 */
export const adminBookingsQuerySchema = paginationSchema.extend({
  query: paginationSchema.shape.query.extend({
    movie: objectIdSchema.optional(),
    status: z
      .enum(Object.values(BOOKING_STATUSES))
      .optional(),
    email: z.string().email().optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFrom must be YYYY-MM-DD')
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateTo must be YYYY-MM-DD')
      .optional(),
  }),
});

/**
 * Body schema for PATCH /api/admin/users/:id/status
 */
export const userStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive (boolean) is required.' }),
  }),
});

/**
 * Query schema for GET /api/admin/users
 */
export const adminUsersQuerySchema = paginationSchema.extend({
  query: paginationSchema.shape.query.extend({
    search: z.string().optional(),
  }),
});
