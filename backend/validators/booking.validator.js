import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../config/constants.js';

export const checkoutSchema = z.object({
  body: z.object({
    showId: objectIdSchema,
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    bookingId: objectIdSchema,
    razorpay_order_id: z.string().trim().min(1, 'razorpay_order_id is required'),
    razorpay_payment_id: z.string().trim().min(1, 'razorpay_payment_id is required'),
    razorpay_signature: z.string().trim().min(1, 'razorpay_signature is required'),
  }),
});

export const markFailedSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      reason: z.string().optional(),
    })
    .optional(),
});

export const listMyBookingsSchema = z.object({
  query: z.object({
    tab: z.enum(['upcoming', 'past', 'cancelled']).optional().default('upcoming'),
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

export const cancelBookingSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      reason: z.string().optional(),
    })
    .optional(),
});

export default {
  checkoutSchema,
  verifyPaymentSchema,
  markFailedSchema,
  listMyBookingsSchema,
  cancelBookingSchema,
};
