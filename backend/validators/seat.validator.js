import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';
import { MAX_SEATS_PER_BOOKING } from '../config/constants.js';

export const seatIdRegex = /^[A-Z]{1,2}[0-9]{1,2}$/;

export const holdSeatsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    seatIds: z
      .array(
        z
          .string()
          .trim()
          .regex(seatIdRegex, 'Seat ID must match row and seat number format (e.g. A1, B12)')
      )
      .min(1, 'Please select at least 1 seat')
      .max(MAX_SEATS_PER_BOOKING, `Cannot book more than ${MAX_SEATS_PER_BOOKING} seats at once`)
      .refine((seats) => new Set(seats).size === seats.length, {
        message: 'Seat IDs must be unique',
      }),
  }),
});

export const seatShowParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export default {
  holdSeatsSchema,
  seatShowParamsSchema,
};
