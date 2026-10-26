/**
 * Expire Pending Bookings Job (Spec B4, B6.10)
 *
 * Runs every minute via node-cron.
 * Marks PENDING bookings older than PENDING_BOOKING_EXPIRY_MINUTES as EXPIRED
 * and deletes their associated SeatHolds.
 *
 * Rules:
 * - Wrapped in try/catch — never throws, never crashes the process.
 * - Logs counts only (no PII).
 */

import cron from 'node-cron';
import Booking from '../models/Booking.js';
import SeatHold from '../models/SeatHold.js';
import { BOOKING_STATUSES, PENDING_BOOKING_EXPIRY_MINUTES } from '../config/constants.js';

/**
 * Core expiry logic — extracted so tests can call it directly.
 * @returns {Promise<{ expired: number, holdsDeleted: number }>}
 */
export const expirePendingBookings = async () => {
  const cutoff = new Date(Date.now() - PENDING_BOOKING_EXPIRY_MINUTES * 60 * 1000);

  // Find all PENDING bookings whose expiresAt is in the past (or createdAt old enough)
  // Spec says "older than 10 minutes" — we use the expiresAt field when set, else createdAt
  const expiredBookings = await Booking.find({
    status: BOOKING_STATUSES.PENDING,
    $or: [
      { expiresAt: { $lte: new Date() } },          // explicit expiry field
      { expiresAt: null, createdAt: { $lte: cutoff } }, // fallback to createdAt
    ],
  }).select('_id user show').lean();

  if (expiredBookings.length === 0) {
    return { expired: 0, holdsDeleted: 0 };
  }

  const bookingIds = expiredBookings.map((b) => b._id);
  const showIds    = [...new Set(expiredBookings.map((b) => b.show.toString()))];
  const userIds    = [...new Set(expiredBookings.map((b) => b.user.toString()))];

  // Mark bookings EXPIRED
  const updateResult = await Booking.updateMany(
    { _id: { $in: bookingIds }, status: BOOKING_STATUSES.PENDING },
    { $set: { status: BOOKING_STATUSES.EXPIRED } }
  );

  // Release the SeatHolds for all affected show/user pairs (Spec B6.10)
  const holdDeleteResult = await SeatHold.deleteMany({
    show: { $in: showIds },
    user: { $in: userIds },
  });

  return {
    expired: updateResult.modifiedCount,
    holdsDeleted: holdDeleteResult.deletedCount,
  };
};

/**
 * Start the cron job — called once from server.js after DB connects.
 */
export const startExpirePendingJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const { expired, holdsDeleted } = await expirePendingBookings();
      if (expired > 0) {
        console.log(`[expirePendingJob] Expired ${expired} booking(s); released ${holdsDeleted} hold(s).`);
      }
    } catch (err) {
      console.error('[expirePendingJob] Error during expiry run:', err.message);
    }
  });

  console.log('[expirePendingJob] Scheduler started (every minute).');
};

export default { expirePendingBookings, startExpirePendingJob };
