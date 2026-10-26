import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { bookingLimiter } from '../middlewares/rateLimiter.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  checkoutSchema,
  verifyPaymentSchema,
  markFailedSchema,
  listMyBookingsSchema,
  cancelBookingSchema,
} from '../validators/booking.validator.js';

const router = express.Router();

// All booking routes require authenticated user (Spec B4)
router.use(authenticate);

// 1. Checkout (Rate limited)
router.post(
  '/checkout',
  bookingLimiter,
  validate(checkoutSchema),
  bookingController.checkout
);

// 2. Verify and Confirm (Rate limited)
router.post(
  '/verify',
  bookingLimiter,
  validate(verifyPaymentSchema),
  bookingController.verifyPayment
);

// 3. Mark failed
router.post(
  '/:id/failed',
  validate(markFailedSchema),
  bookingController.markFailed
);

// 4. My Bookings list with tabs
router.get(
  '/my',
  validate(listMyBookingsSchema),
  bookingController.getMyBookings
);

// 5. Get Booking by ID
router.get(
  '/:id',
  validate(idParamSchema),
  bookingController.getBookingById
);

// 6. Cancel Booking
router.post(
  '/:id/cancel',
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

export default router;
