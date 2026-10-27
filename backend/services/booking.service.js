import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import SeatHold from '../models/SeatHold.js';
import BookedSeat from '../models/BookedSeat.js';
import { generateSeats } from './seatLayout.service.js';
import { generateBookingRef } from '../utils/generateBookingRef.js';
import paymentService from './payment.service.js';
import ticketService from './ticket.service.js';
import AppError from '../utils/AppError.js';
import { env } from '../config/env.js';
import {
  BOOKING_STATUSES,
  CANCEL_REASONS,
  CANCEL_CUTOFF_HOURS,
  CHECKOUT_HOLD_EXTENSION_MINUTES,
  MAX_HOLD_LIFETIME_MINUTES,
  PENDING_BOOKING_EXPIRY_MINUTES,
  CURRENCY,
  DEFAULT_PAGE_LIMIT,
} from '../config/constants.js';

/**
 * Initiates checkout for held seats and creates Razorpay order (Spec B6.4)
 */
export const checkout = async (userId, showId) => {
  const now = new Date();

  // 1. Require active holds owned by user (Spec B6.4)
  const holds = await SeatHold.find({
    show: showId,
    user: userId,
    expiresAt: { $gt: now },
  });

  if (!holds || holds.length === 0) {
    throw new AppError(
      'No active seat hold found. Holds expire after 5 minutes.',
      409,
      'HOLD_NOT_FOUND'
    );
  }

  // 2. Expire any old PENDING bookings for this user on this show
  await Booking.updateMany(
    { user: userId, show: showId, status: BOOKING_STATUSES.PENDING },
    { status: BOOKING_STATUSES.EXPIRED }
  );

  // 3. Fetch Show with references
  const show = await Show.findById(showId).populate('movie screen theatre');
  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  // 4. Map seat categories and compute server-side prices
  const layoutSeats = generateSeats(show.screen.layout);
  const layoutMap = new Map(layoutSeats.map((s) => [s.id, s]));
  const pricingObj =
    show.pricing instanceof Map ? Object.fromEntries(show.pricing) : show.pricing || {};

  const seats = holds.map((h) => {
    const layoutSeat = layoutMap.get(h.seatId);
    const category = layoutSeat ? layoutSeat.category : 'STANDARD';
    const price = pricingObj[category] || 0;
    return {
      seatId: h.seatId,
      category,
      price,
    };
  });

  const amount = seats.reduce((sum, s) => sum + s.price, 0);

  // 5. Immutable ticket snapshot (Spec B3, B4)
  const snapshot = {
    movieId: show.movie._id,
    movieTitle: show.movie.title,
    posterUrl: show.movie.posterUrl,
    certificate: show.movie.certificate,
    language: show.language,
    format: show.format,
    theatreName: show.theatre.name,
    theatreAddress: show.theatre.address,
    city: show.theatre.city,
    screenName: show.screen.name,
    startTime: show.startTime,
  };

  // 6. Generate booking reference with duplicate retry (up to 5 attempts, Spec B6.9)
  let booking;
  const bookingExpiresAt = new Date(
    now.getTime() + PENDING_BOOKING_EXPIRY_MINUTES * 60 * 1000
  );

  for (let attempt = 0; attempt < 5; attempt++) {
    const bookingRef = generateBookingRef();
    try {
      booking = await Booking.create({
        bookingRef,
        user: userId,
        show: show._id,
        seats,
        amount,
        currency: CURRENCY,
        status: BOOKING_STATUSES.PENDING,
        expiresAt: bookingExpiresAt,
        snapshot,
      });
      break;
    } catch (err) {
      if (err.code === 11000 && attempt < 4) continue;
      throw err;
    }
  }

  // 7. Create Razorpay order
  let order;
  try {
    order = await paymentService.createOrder(amount * 100, booking.bookingRef, {
      bookingId: booking._id.toString(),
      showId: show._id.toString(),
    });
  } catch (err) {
    booking.status = BOOKING_STATUSES.FAILED;
    await booking.save();
    throw err;
  }

  booking.razorpay = { orderId: order.id };
  await booking.save();

  // 8. Extend hold: expiresAt = min(max(current, now + 3m), holdCreatedAt + 8m) (Spec B6.4)
  for (const hold of holds) {
    const holdCreatedAt = hold.createdAt ? hold.createdAt.getTime() : now.getTime();
    const maxLifetime = holdCreatedAt + MAX_HOLD_LIFETIME_MINUTES * 60 * 1000;
    const desiredExtension = now.getTime() + CHECKOUT_HOLD_EXTENSION_MINUTES * 60 * 1000;
    const newExpiresAt = new Date(
      Math.min(Math.max(hold.expiresAt.getTime(), desiredExtension), maxLifetime)
    );
    hold.expiresAt = newExpiresAt;
    await hold.save();
  }

  return {
    booking: {
      id: booking._id.toString(),
      bookingRef: booking.bookingRef,
      amount: booking.amount,
      seats: booking.seats,
      snapshot: booking.snapshot,
      expiresAt: booking.expiresAt,
    },
    razorpay: {
      orderId: order.id,
      amountPaise: amount * 100,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
    },
  };
};

/**
 * Helper to confirm paid booking and insert BookedSeats inside transaction
 */
export const confirmPaidBooking = async (booking, paymentId, signature = null, session = null) => {
  const isOuterSession = Boolean(session);
  const dbSession = session || (await mongoose.startSession());
  try {
    const execute = async (s) => {
      // Insert BookedSeat rows (UNIQUE index decides final seat ownership)
      const bookedSeatsToInsert = booking.seats.map((seat) => ({
        show: booking.show,
        seatId: seat.seatId,
        booking: booking._id,
      }));
      await BookedSeat.insertMany(bookedSeatsToInsert, { session: s });

      // Delete active holds for these seats
      const seatIds = booking.seats.map((seat) => seat.seatId);
      await SeatHold.deleteMany({ show: booking.show, seatId: { $in: seatIds } }, { session: s });

      // Confirm booking
      booking.status = BOOKING_STATUSES.CONFIRMED;
      booking.razorpay = booking.razorpay || {};
      booking.razorpay.paymentId = paymentId;
      if (signature) {
        booking.razorpay.signature = signature;
      }
      booking.confirmedAt = new Date();
      await booking.save({ session: s });
    };

    if (isOuterSession) {
      await execute(dbSession);
    } else {
      await dbSession.withTransaction(async () => {
        await execute(dbSession);
      });
    }
  } catch (err) {
    // Duplicate key on BookedSeat: seats were taken during payment (Spec B6.5)
    if (err.code === 11000) {
      const refundRes = await paymentService.refund(
        paymentId,
        booking.amount * 100,
        {
          bookingRef: booking.bookingRef,
          reason: 'SEATS_LOST',
        }
      );
      booking.status = BOOKING_STATUSES.FAILED;
      booking.refund = refundRes;
      booking.cancelReason = CANCEL_REASONS.SEATS_LOST;
      await booking.save();

      throw new AppError(
        'Selected seats were no longer available. A full refund has been initiated.',
        409,
        'SEATS_UNAVAILABLE_REFUNDED',
        null,
        { refundId: refundRes.id }
      );
    }
    throw err;
  } finally {
    if (!isOuterSession) {
      await dbSession.endSession();
    }
  }
};

/**
 * Verifies payment signature and confirms booking in transaction (Spec B6.5)
 */
export const verifyAndConfirm = async (userId, payload) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

  const booking = await Booking.findOne({ _id: bookingId, user: userId });
  if (!booking) {
    throw new AppError('Booking not found', 404, 'NOT_FOUND');
  }

  // 1. Idempotent check: if already confirmed, return ticket immediately
  if (booking.status === BOOKING_STATUSES.CONFIRMED) {
    return ticketService.buildTicket(booking);
  }

  // 2. Reject non-payable bookings
  if (
    [
      BOOKING_STATUSES.FAILED,
      BOOKING_STATUSES.EXPIRED,
      BOOKING_STATUSES.CANCELLED,
    ].includes(booking.status)
  ) {
    throw new AppError('This booking is no longer payable', 409, 'BOOKING_NOT_PAYABLE');
  }

  // 3. Verify order ID matches booking record
  if (razorpay_order_id !== booking.razorpay?.orderId) {
    throw new AppError('Order ID mismatch', 400, 'INVALID_SIGNATURE');
  }

  // 4. Verify HMAC SHA256 signature with constant-time equality
  const isValid = paymentService.verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    throw new AppError('Invalid payment signature', 400, 'INVALID_SIGNATURE');
  }

  // 5. Fetch payment from Razorpay and capture if authorized
  try {
    const payment = await paymentService.fetchPayment(razorpay_payment_id);
    if (payment && payment.status === 'authorized') {
      await paymentService.capturePayment(razorpay_payment_id, booking.amount * 100);
    }
  } catch (err) {
    // Non-fatal if payment is already captured or provider test mock
    if (env.NODE_ENV !== 'test') {
      console.warn('[Payment fetch/capture notice]:', err.message);
    }
  }

  // 6. Execute confirmation inside MongoDB transaction
  await confirmPaidBooking(booking, razorpay_payment_id, razorpay_signature);

  return ticketService.buildTicket(booking);
};

/**
 * Marks booking as failed and releases seats (Spec B4)
 */
export const markFailed = async (userId, bookingId, reason = 'PAYMENT_FAILED') => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });
  if (!booking) {
    throw new AppError('Booking not found', 404, 'NOT_FOUND');
  }

  if (booking.status === BOOKING_STATUSES.CONFIRMED) {
    throw new AppError(
      'Cannot mark an already confirmed booking as failed',
      409,
      'BOOKING_NOT_PAYABLE'
    );
  }

  booking.status = BOOKING_STATUSES.FAILED;
  booking.cancelReason = reason;
  await booking.save();

  // Release user holds for this show
  const seatIds = (booking.seats || []).map((s) => s.seatId);
  await SeatHold.deleteMany({
    show: booking.show,
    user: userId,
    seatId: { $in: seatIds },
  });

  return {
    success: true,
    bookingId: booking._id.toString(),
  };
};

/**
 * Lists user bookings with tabs (upcoming, past, cancelled) and pagination (Spec B4)
 */
export const getMyBookings = async (
  userId,
  { tab = 'upcoming', page = 1, limit = DEFAULT_PAGE_LIMIT }
) => {
  const now = new Date();
  const filter = { user: userId };

  if (tab === 'upcoming') {
    filter.status = BOOKING_STATUSES.CONFIRMED;
    filter['snapshot.startTime'] = { $gte: now };
  } else if (tab === 'past') {
    filter.status = BOOKING_STATUSES.CONFIRMED;
    filter['snapshot.startTime'] = { $lt: now };
  } else if (tab === 'cancelled') {
    filter.status = BOOKING_STATUSES.CANCELLED;
  }

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const items = await Promise.all(bookings.map((b) => ticketService.buildTicket(b)));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieves single booking by ID (only owner allowed)
 */
export const getBookingById = async (userId, bookingId) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError('Booking not found', 404, 'NOT_FOUND');
  }

  return ticketService.buildTicket(booking);
};

/**
 * Cancels a confirmed booking and initiates Razorpay refund (Spec B6.6)
 */
export const cancelBooking = async (
  userId,
  bookingId,
  reason = null
) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId });

  if (!booking) {
    throw new AppError('Booking not found', 404, 'NOT_FOUND');
  }

  if (booking.status !== BOOKING_STATUSES.CONFIRMED) {
    throw new AppError(
      'Only confirmed bookings can be cancelled',
      409,
      'BOOKING_NOT_CANCELLABLE'
    );
  }

  // User cancel time-window check: must be > 24 hours before showtime (Spec B6.6, updated to 24h)
  const showTime = new Date(booking.snapshot.startTime).getTime();
  const cutoffMs = CANCEL_CUTOFF_HOURS * 60 * 60 * 1000;
  if (showTime - Date.now() <= cutoffMs) {
    throw new AppError(
      'Cancellation window closed (cancellations are only permitted up to 24 hours before showtime)',
      409,
      'CANCEL_WINDOW_CLOSED'
    );
  }

  // Cancellation in transaction: delete BookedSeat records so seats become available again immediately
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1. Delete BookedSeat records so seats are freed for booking
      await BookedSeat.deleteMany({ booking: booking._id }, { session });

      // 2. Also delete any active holds on these seats to ensure immediate availability
      const seatIds = (booking.seats || []).map((s) => s.seatId);
      if (seatIds.length > 0) {
        await SeatHold.deleteMany({ show: booking.show, seatId: { $in: seatIds } }, { session });
      }

      booking.status = BOOKING_STATUSES.CANCELLED;
      booking.cancelledAt = new Date();
      const validReasons = Object.values(CANCEL_REASONS);
      booking.cancelReason = reason && validReasons.includes(reason) ? reason : CANCEL_REASONS.USER;
      await booking.save({ session });
    });
  } finally {
    await session.endSession();
  }

  // Issue refund via Razorpay after transaction commit (Spec B6.6)
  if (booking.razorpay?.paymentId) {
    try {
      const refundRes = await paymentService.refund(
        booking.razorpay.paymentId,
        booking.amount * 100,
        { bookingRef: booking.bookingRef }
      );
      booking.refund = refundRes;
      await booking.save();
    } catch (refundErr) {
      console.warn('[Cancellation refund warning]:', refundErr.message);
      booking.refund = {
        id: null,
        amount: booking.amount,
        status: REFUND_STATUSES.FAILED,
        at: new Date(),
        error: refundErr.message,
      };
      await booking.save();
    }
  }

  return ticketService.buildTicket(booking);
};

/**
 * Webhook handler for asynchronous Razorpay events (Spec B6.9)
 */
export const handleWebhook = async (rawBody, signature) => {
  const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    throw new AppError('Invalid webhook signature', 400, 'INVALID_SIGNATURE');
  }

  let eventData;
  try {
    eventData = JSON.parse(rawBody.toString());
  } catch (err) {
    throw new AppError('Invalid webhook payload', 400, 'VALIDATION_ERROR');
  }

  const { event, payload } = eventData;
  if (!payload || !payload.payment || !payload.payment.entity) {
    return { received: true };
  }

  const paymentEntity = payload.payment.entity;
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  const booking = await Booking.findOne({ 'razorpay.orderId': orderId });
  if (!booking) {
    return { received: true };
  }

  if (event === 'payment.captured' && booking.status === BOOKING_STATUSES.PENDING) {
    await confirmPaidBooking(booking, paymentId, 'webhook');
  } else if (event === 'payment.failed' && booking.status === BOOKING_STATUSES.PENDING) {
    booking.status = BOOKING_STATUSES.FAILED;
    booking.cancelReason = 'PAYMENT_FAILED_WEBHOOK';
    await booking.save();

    const seatIds = booking.seats.map((s) => s.seatId);
    await SeatHold.deleteMany({
      show: booking.show,
      user: booking.user,
      seatId: { $in: seatIds },
    });
  }

  return { received: true };
};

/**
 * 1-minute background reconciliation for pending payments (Spec Phase 1.3)
 */
export const reconcilePendingPayments = async () => {
  const now = new Date();
  // Bookings in PENDING state created at least 1 minute ago with orderId
  const pendingBookings = await Booking.find({
    status: BOOKING_STATUSES.PENDING,
    'razorpay.orderId': { $exists: true, $ne: null },
    createdAt: { $lte: new Date(now.getTime() - 60 * 1000) },
  }).limit(25);

  for (const booking of pendingBookings) {
    try {
      const orderPayments = await paymentService.fetchOrderPayments(booking.razorpay.orderId);
      const items = orderPayments?.items || [];
      const successfulPayment = items.find((p) => p.status === 'captured');
      const authorizedPayment = items.find((p) => p.status === 'authorized');

      if (successfulPayment) {
        console.log(`[Reconcile] Auto-confirming captured booking: ${booking.bookingRef}`);
        await confirmPaidBooking(booking, successfulPayment.id, 'reconciled');
      } else if (authorizedPayment) {
        console.log(`[Reconcile] Capturing & confirming authorized booking: ${booking.bookingRef}`);
        await paymentService.capturePayment(authorizedPayment.id, booking.amount * 100);
        await confirmPaidBooking(booking, authorizedPayment.id, 'reconciled');
      } else if (booking.expiresAt && booking.expiresAt < now) {
        booking.status = BOOKING_STATUSES.EXPIRED;
        await booking.save();
        const seatIds = (booking.seats || []).map((s) => s.seatId);
        await SeatHold.deleteMany({
          show: booking.show,
          user: booking.user,
          seatId: { $in: seatIds },
        });
      }
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.error(`[Reconcile Error for ${booking.bookingRef}]:`, err.message);
      }
    }
  }
};

export default {
  checkout,
  verifyAndConfirm,
  confirmPaidBooking,
  reconcilePendingPayments,
  markFailed,
  getMyBookings,
  getBookingById,
  cancelBooking,
  handleWebhook,
};
