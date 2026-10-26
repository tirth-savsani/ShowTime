/**
 * Report Service (Spec B4, B6.11)
 * All aggregations are pure MongoDB pipelines; no business logic in controllers.
 */

import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import BookedSeat from '../models/BookedSeat.js';
import SeatHold from '../models/SeatHold.js';
import { BOOKING_STATUSES, TIMEZONE } from '../config/constants.js';

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

/**
 * Zero-fill an array of { date, revenue, bookings, tickets } so every day
 * in [startDate, endDate] inclusive is present (Spec B6.11).
 * @param {Array<{date:string, revenue:number, bookings:number, tickets:number}>} rows
 * @param {Date} startDate
 * @param {Date} endDate
 */
const zeroFillDays = (rows, startDate, endDate) => {
  const map = Object.fromEntries(rows.map((r) => [r.date, r]));
  const result = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    // Format YYYY-MM-DD in IST using Intl (no external deps)
    const label = cursor.toLocaleDateString('en-CA', { timeZone: TIMEZONE }); // en-CA gives YYYY-MM-DD
    result.push(
      map[label] ?? { date: label, revenue: 0, bookings: 0, tickets: 0 }
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return result;
};

// -------------------------------------------------------------------
// getStats (Spec B6.11)
// -------------------------------------------------------------------

/**
 * Aggregate admin dashboard stats.
 * @param {number} days - number of trailing days for perDay chart (default 14)
 * @returns {Promise<{totals, perDay, topMovies, upcomingOccupancy, activeShows}>}
 */
export const getStats = async (days = 14) => {
  const now = new Date();

  // Start of IST day `days` ago (midnight IST converted to UTC)
  // Using a simple offset: IST = UTC+5:30 = 330 min
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const todayStartIST = new Date(
    Math.floor((now.getTime() + IST_OFFSET_MS) / 86400000) * 86400000 - IST_OFFSET_MS
  );
  const periodStart = new Date(todayStartIST.getTime() - (days - 1) * 86400000);

  // Run all aggregations concurrently
  const [totalsResult, perDayResult, topMoviesResult, activeShows, upcomingShows] =
    await Promise.all([
      // 1. Totals: total revenue, confirmed bookings count, total tickets sold
      Booking.aggregate([
        { $match: { status: BOOKING_STATUSES.CONFIRMED } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
            bookings: { $sum: 1 },
            tickets: { $sum: { $size: '$seats' } },
          },
        },
      ]),

      // 2. Per-day breakdown (last N days, IST timezone grouping)
      Booking.aggregate([
        {
          $match: {
            status: BOOKING_STATUSES.CONFIRMED,
            confirmedAt: { $gte: periodStart },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$confirmedAt',
                timezone: TIMEZONE,
              },
            },
            revenue: { $sum: '$amount' },
            bookings: { $sum: 1 },
            tickets: { $sum: { $size: '$seats' } },
          },
        },
        { $project: { _id: 0, date: '$_id', revenue: 1, bookings: 1, tickets: 1 } },
        { $sort: { date: 1 } },
      ]),

      // 3. Top 5 movies by revenue (CONFIRMED bookings)
      Booking.aggregate([
        { $match: { status: BOOKING_STATUSES.CONFIRMED } },
        {
          $group: {
            _id: '$snapshot.movieId',
            revenue: { $sum: '$amount' },
            bookings: { $sum: 1 },
            tickets: { $sum: { $size: '$seats' } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'movies',
            localField: '_id',
            foreignField: '_id',
            as: 'movie',
          },
        },
        { $unwind: '$movie' },
        {
          $project: {
            _id: 0,
            movieId: '$_id',
            title: '$movie.title',
            posterUrl: '$movie.posterUrl',
            revenue: 1,
            bookings: 1,
            tickets: 1,
          },
        },
      ]),

      // 4. Count active shows
      Show.countDocuments({ status: 'scheduled', startTime: { $gt: now } }),

      // 5. Next 10 upcoming shows (for occupancy calculation)
      Show.find({ status: 'scheduled', startTime: { $gt: now } })
        .sort({ startTime: 1 })
        .limit(10)
        .populate('movie', 'title')
        .populate('screen', 'name totalSeats')
        .populate('theatre', 'name')
        .lean(),
    ]);

  // ---- Build perDay with zero-fill ----
  const endDate = todayStartIST;
  const perDay = zeroFillDays(perDayResult, periodStart, endDate);

  // ---- Totals ----
  const totals = totalsResult[0]
    ? {
        revenue: totalsResult[0].revenue,
        bookings: totalsResult[0].bookings,
        tickets: totalsResult[0].tickets,
      }
    : { revenue: 0, bookings: 0, tickets: 0 };

  // ---- Upcoming Occupancy ----
  const upcomingOccupancy = await buildOccupancy(upcomingShows, now);

  return {
    totals,
    perDay,
    topMovies: topMoviesResult,
    upcomingOccupancy,
    activeShows,
  };
};

/**
 * Given the next 10 shows, compute booked + held seat counts and occupancy %.
 */
const buildOccupancy = async (shows, now) => {
  if (!shows.length) return [];

  const showIds = shows.map((s) => s._id);

  // Two batch aggregations in parallel
  const [bookedCounts, heldCounts] = await Promise.all([
    BookedSeat.aggregate([
      { $match: { show: { $in: showIds } } },
      { $group: { _id: '$show', count: { $sum: 1 } } },
    ]),
    SeatHold.aggregate([
      { $match: { show: { $in: showIds }, expiresAt: { $gt: now } } },
      { $group: { _id: '$show', count: { $sum: 1 } } },
    ]),
  ]);

  const bookedMap = Object.fromEntries(bookedCounts.map((r) => [r._id.toString(), r.count]));
  const heldMap = Object.fromEntries(heldCounts.map((r) => [r._id.toString(), r.count]));

  return shows.map((show) => {
    const id = show._id.toString();
    const totalSeats = show.screen?.totalSeats ?? 0;
    const booked = bookedMap[id] ?? 0;
    const held = heldMap[id] ?? 0;
    const occupancyPct = totalSeats > 0 ? Math.round((booked / totalSeats) * 100) : 0;

    return {
      showId: id,
      movieTitle: show.movie?.title ?? '',
      theatreName: show.theatre?.name ?? '',
      screenName: show.screen?.name ?? '',
      startTime: show.startTime,
      totalSeats,
      bookedSeats: booked,
      heldSeats: held,
      occupancyPct,
    };
  });
};

export default { getStats };
