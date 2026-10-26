import mongoose from 'mongoose';
import Show from '../models/Show.js';
import SeatHold from '../models/SeatHold.js';
import BookedSeat from '../models/BookedSeat.js';
import { generateSeats } from './seatLayout.service.js';
import AppError from '../utils/AppError.js';
import {
  HOLD_MINUTES,
  MAX_SEATS_PER_BOOKING,
  SEAT_STATUSES,
  SHOW_STATUSES,
} from '../config/constants.js';

/**
 * Returns seat map for a show with availability status and pricing (Spec B6.2)
 */
export const getSeatMap = async (showId, userId = null) => {
  const show = await Show.findById(showId)
    .populate('movie', 'title durationMin certificate posterUrl')
    .populate('theatre', 'name city address amenities')
    .populate('screen');

  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  if (show.status !== SHOW_STATUSES.SCHEDULED) {
    throw new AppError('Show is not scheduled for booking', 404, 'NOT_FOUND');
  }

  // 1. Generate seats from screen layout
  const allSeats = generateSeats(show.screen.layout);

  // 2. Query booked seats
  const bookedSeats = await BookedSeat.find({ show: show._id }).select('seatId');
  const bookedSet = new Set(bookedSeats.map((b) => b.seatId));

  // 3. Query active holds (filter expiresAt > now, Spec B6.2)
  const now = new Date();
  const activeHolds = await SeatHold.find({
    show: show._id,
    expiresAt: { $gt: now },
  }).select('seatId user');

  const holdsMap = new Map(
    activeHolds.map((h) => [h.seatId, h.user ? h.user.toString() : null])
  );

  const pricingObj =
    show.pricing instanceof Map ? Object.fromEntries(show.pricing) : show.pricing || {};

  let availableCount = 0;
  let heldCount = 0;
  let bookedCount = 0;
  const currentUserIdStr = userId ? userId.toString() : null;

  // 4. Mark status and pricing for each seat
  for (const seat of allSeats) {
    const seatId = seat.id;
    seat.price = pricingObj[seat.category] || 0;

    if (bookedSet.has(seatId)) {
      seat.status = SEAT_STATUSES.BOOKED;
      bookedCount++;
    } else if (holdsMap.has(seatId)) {
      const holderUserId = holdsMap.get(seatId);
      if (currentUserIdStr && holderUserId === currentUserIdStr) {
        seat.status = SEAT_STATUSES.MINE;
      } else {
        seat.status = SEAT_STATUSES.HELD;
      }
      heldCount++; // MINE counts as held in counts (Spec B6.2)
    } else {
      seat.status = SEAT_STATUSES.AVAILABLE;
      availableCount++;
    }
  }

  // 5. Group seats by category (layout order), then by row label (Spec B6.2)
  const categoryMap = new Map();
  for (const row of show.screen.layout.rows) {
    if (!categoryMap.has(row.category)) {
      categoryMap.set(row.category, {
        name: row.category,
        price: pricingObj[row.category] || 0,
        rows: [],
      });
    }

    const catEntry = categoryMap.get(row.category);
    const rowSeats = allSeats.filter(
      (s) => s.row === row.label && s.category === row.category
    );

    catEntry.rows.push({
      label: row.label,
      seats: rowSeats.map((s) => ({
        id: s.id,
        number: s.number,
        status: s.status,
        aisleAfter: s.aisleAfter,
      })),
    });
  }

  const showSummary = {
    id: show._id.toString(),
    movie: {
      id: show.movie._id.toString(),
      title: show.movie.title,
      certificate: show.movie.certificate,
      durationMin: show.movie.durationMin,
      posterUrl: show.movie.posterUrl,
    },
    theatre: {
      id: show.theatre._id.toString(),
      name: show.theatre.name,
      city: show.theatre.city,
      address: show.theatre.address,
      amenities: show.theatre.amenities || [],
    },
    screen: {
      id: show.screen._id.toString(),
      name: show.screen.name,
      totalSeats: show.screen.totalSeats,
    },
    startTime: show.startTime,
    endTime: show.endTime,
    language: show.language,
    format: show.format,
    pricing: pricingObj,
  };

  return {
    show: showSummary,
    categories: Array.from(categoryMap.values()),
    seats: allSeats,
    counts: {
      total: allSeats.length,
      available: availableCount,
      held: heldCount,
      booked: bookedCount,
    },
  };
};

/**
 * Concurrency-safe atomic seat hold engine (Spec B6.3)
 */
export const holdSeats = async (userId, showId, seatIds) => {
  // 1. Validate show
  const show = await Show.findById(showId).populate('screen');
  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  if (show.status !== SHOW_STATUSES.SCHEDULED) {
    throw new AppError('Show is not scheduled for booking', 400, 'VALIDATION_ERROR');
  }

  const now = new Date();
  if (new Date(show.startTime).getTime() <= now.getTime()) {
    throw new AppError('Show has already started', 400, 'SHOW_IN_PAST');
  }

  // 2. Validate seat selection bounds
  if (
    !Array.isArray(seatIds) ||
    seatIds.length < 1 ||
    seatIds.length > MAX_SEATS_PER_BOOKING
  ) {
    throw new AppError(
      `You can hold between 1 and ${MAX_SEATS_PER_BOOKING} seats`,
      400,
      'VALIDATION_ERROR'
    );
  }

  const uniqueSeatIds = Array.from(new Set(seatIds));
  if (uniqueSeatIds.length !== seatIds.length) {
    throw new AppError('Seat IDs must be unique', 400, 'VALIDATION_ERROR');
  }

  const layoutSeats = generateSeats(show.screen.layout);
  const seatMap = new Map(layoutSeats.map((s) => [s.id, s]));

  for (const sid of seatIds) {
    if (!seatMap.has(sid)) {
      throw new AppError(
        `Seat '${sid}' does not exist in this screen layout`,
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  // 3. User can have only one active hold per show; replace old hold (Spec B6.3)
  await SeatHold.deleteMany({ show: show._id, user: userId });

  // 4. Purge expired holds for requested seats (TTL monitor lags up to 60s, Spec B6.3)
  await SeatHold.deleteMany({
    show: show._id,
    seatId: { $in: seatIds },
    expiresAt: { $lte: now },
  });

  // 5. Check already booked seats
  const booked = await BookedSeat.find({
    show: show._id,
    seatId: { $in: seatIds },
  }).select('seatId');

  if (booked.length > 0) {
    const unavailableSeatIds = booked.map((b) => b.seatId);
    throw new AppError(
      'One or more selected seats are already booked',
      409,
      'SEATS_UNAVAILABLE',
      null,
      { unavailableSeatIds }
    );
  }

  // 6. Attempt atomic insertMany with ordered: false
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
  const holdDocs = seatIds.map((seatId) => ({
    show: show._id,
    seatId,
    user: userId,
    expiresAt,
  }));

  try {
    await SeatHold.insertMany(holdDocs, { ordered: false });
  } catch (error) {
    // Handle duplicate key / bulk write collision: all-or-nothing rollback (Spec B6.3)
    let failedSeatIds = [];
    if (error.writeErrors && Array.isArray(error.writeErrors)) {
      failedSeatIds = error.writeErrors
        .map((we) => holdDocs[we.index]?.seatId || seatIds[we.index])
        .filter(Boolean);
    }

    if (failedSeatIds.length === 0) {
      // Fallback query for conflicting holds by other users
      const conflicting = await SeatHold.find({
        show: show._id,
        seatId: { $in: seatIds },
        user: { $ne: userId },
        expiresAt: { $gt: now },
      }).select('seatId');
      failedSeatIds = conflicting.map((c) => c.seatId);
      if (failedSeatIds.length === 0) {
        failedSeatIds = seatIds;
      }
    }

    // Rollback any seats that were inserted in this batch for this user
    await SeatHold.deleteMany({ show: show._id, user: userId });

    throw new AppError(
      'One or more selected seats are no longer available',
      409,
      'SEATS_UNAVAILABLE',
      null,
      { unavailableSeatIds: failedSeatIds }
    );
  }

  // 7. Calculate server-side pricing breakdown
  const pricingObj =
    show.pricing instanceof Map ? Object.fromEntries(show.pricing) : show.pricing || {};

  let amount = 0;
  const categoriesBreakdown = {};

  for (const sid of seatIds) {
    const seat = seatMap.get(sid);
    const price = pricingObj[seat.category] || 0;
    amount += price;

    if (!categoriesBreakdown[seat.category]) {
      categoriesBreakdown[seat.category] = {
        category: seat.category,
        price,
        count: 0,
        subtotal: 0,
      };
    }
    categoriesBreakdown[seat.category].count += 1;
    categoriesBreakdown[seat.category].subtotal += price;
  }

  return {
    seatIds,
    expiresAt,
    amount,
    categories: Object.values(categoriesBreakdown),
  };
};

/**
 * Releases holds for a user on a given show (Spec B4)
 */
export const releaseHold = async (userId, showId) => {
  const result = await SeatHold.deleteMany({ show: showId, user: userId });
  return {
    released: true,
    count: result.deletedCount,
  };
};

/**
 * Returns current active hold for user on a given show (Spec B4)
 */
export const getUserHold = async (userId, showId) => {
  const now = new Date();
  const holds = await SeatHold.find({
    show: showId,
    user: userId,
    expiresAt: { $gt: now },
  });

  if (holds.length === 0) {
    return { hold: null };
  }

  const show = await Show.findById(showId).populate('screen');
  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  const layoutSeats = generateSeats(show.screen.layout);
  const seatMap = new Map(layoutSeats.map((s) => [s.id, s]));
  const pricingObj =
    show.pricing instanceof Map ? Object.fromEntries(show.pricing) : show.pricing || {};

  let amount = 0;
  const seatIds = holds.map((h) => h.seatId);
  for (const sid of seatIds) {
    const seat = seatMap.get(sid);
    const price = seat ? pricingObj[seat.category] || 0 : 0;
    amount += price;
  }

  return {
    hold: {
      seatIds,
      expiresAt: holds[0].expiresAt,
      amount,
    },
  };
};

export default {
  getSeatMap,
  holdSeats,
  releaseHold,
  getUserHold,
};
