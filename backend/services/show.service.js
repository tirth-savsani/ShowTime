import mongoose from 'mongoose';
import Show from '../models/Show.js';
import Movie from '../models/Movie.js';
import Screen from '../models/Screen.js';
import Theatre from '../models/Theatre.js';
import BookedSeat from '../models/BookedSeat.js';
import SeatHold from '../models/SeatHold.js';
import Booking from '../models/Booking.js';
import { extractCategories } from './seatLayout.service.js';
import AppError from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { getISTDayBounds } from '../utils/dateUtils.js';
import {
  SHOW_ADS_MINUTES,
  SHOW_BUFFER_MINUTES,
  SHOW_STATUSES,
  BOOKING_STATUSES,
  CANCEL_REASONS,
  FILLING_FAST_THRESHOLD,
  SHOW_AVAILABILITY,
  DEFAULT_PAGE_LIMIT,
} from '../config/constants.js';

/**
 * Validates show overlap on a screen with the 15-minute buffer (Spec B6.7)
 */
export const checkShowOverlap = async (screenId, startTime, endTime, excludeShowId = null) => {
  const bufferMs = SHOW_BUFFER_MINUTES * 60 * 1000;
  const filter = {
    screen: screenId,
    status: SHOW_STATUSES.SCHEDULED,
    startTime: { $lt: new Date(endTime.getTime() + bufferMs) },
    endTime: { $gt: new Date(startTime.getTime() - bufferMs) },
  };

  if (excludeShowId) {
    filter._id = { $ne: excludeShowId };
  }

  const conflict = await Show.findOne(filter).populate('movie', 'title');
  if (conflict) {
    throw new AppError(
      'Show overlaps with an existing scheduled show on this screen',
      409,
      'SHOW_OVERLAP',
      null,
      {
        conflictingShow: {
          id: conflict._id.toString(),
          movieTitle: conflict.movie?.title,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
        },
      }
    );
  }
};

/**
 * Creates a new Show (Spec B4, B6.7)
 */
export const createShow = async ({ movie, screen, startTime, language, format, pricing }) => {
  const startTimeDate = new Date(startTime);
  const now = new Date();

  // Validate start time is in the future (Spec B7)
  if (startTimeDate.getTime() <= now.getTime()) {
    throw new AppError('Show startTime must be in the future', 400, 'SHOW_IN_PAST');
  }

  // Advance booking window limit (30 days)
  const maxAdvanceMs = 30 * 24 * 60 * 60 * 1000;
  if (startTimeDate.getTime() > now.getTime() + maxAdvanceMs) {
    throw new AppError(
      'Show startTime cannot be more than 30 days in the future',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Validate Movie
  const movieDoc = await Movie.findOne({ _id: movie, isDeleted: false });
  if (!movieDoc) {
    throw new AppError('Movie not found', 404, 'NOT_FOUND');
  }

  if (!movieDoc.languages.includes(language)) {
    throw new AppError(
      `Language '${language}' is not available for movie '${movieDoc.title}'`,
      400,
      'VALIDATION_ERROR'
    );
  }

  if (!movieDoc.formats.includes(format)) {
    throw new AppError(
      `Format '${format}' is not available for movie '${movieDoc.title}'`,
      400,
      'VALIDATION_ERROR'
    );
  }

  // Validate Screen and Theatre
  const screenDoc = await Screen.findById(screen).populate('theatre');
  if (!screenDoc || !screenDoc.isActive) {
    throw new AppError('Screen not found or inactive', 404, 'NOT_FOUND');
  }

  if (!screenDoc.theatre || !screenDoc.theatre.isActive) {
    throw new AppError('Theatre not found or inactive', 404, 'NOT_FOUND');
  }

  // Validate pricing covers screen categories exactly (Spec B5)
  const requiredCategories = extractCategories(screenDoc.layout);
  const providedCategories = Object.keys(pricing);

  for (const cat of requiredCategories) {
    if (pricing[cat] === undefined) {
      throw new AppError(
        `Pricing must include category '${cat}' required by the screen layout`,
        400,
        'VALIDATION_ERROR'
      );
    }
  }

  if (providedCategories.length !== requiredCategories.length) {
    throw new AppError(
      'Pricing categories must match screen layout categories exactly',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Compute endTime = startTime + movie.durationMin + SHOW_ADS_MINUTES (Spec B6.7)
  const durationTotalMinutes = movieDoc.durationMin + SHOW_ADS_MINUTES;
  const endTimeDate = new Date(startTimeDate.getTime() + durationTotalMinutes * 60 * 1000);

  // Check overlap with existing scheduled shows
  await checkShowOverlap(screenDoc._id, startTimeDate, endTimeDate);

  const show = await Show.create({
    movie: movieDoc._id,
    screen: screenDoc._id,
    theatre: screenDoc.theatre._id,
    city: screenDoc.theatre.city,
    startTime: startTimeDate,
    endTime: endTimeDate,
    language,
    format,
    pricing,
    status: SHOW_STATUSES.SCHEDULED,
  });

  return show.populate([
    { path: 'movie', select: 'title durationMin posterUrl certificate' },
    { path: 'screen', select: 'name totalSeats' },
    { path: 'theatre', select: 'name city address' },
  ]);
};

/**
 * Updates a Show (Spec B4, B6.7)
 */
export const updateShow = async (showId, updateData) => {
  const show = await Show.findById(showId).populate('movie screen theatre');
  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  const touchesScheduleOrPricing = Boolean(
    updateData.startTime || updateData.screen || updateData.pricing
  );

  // If modifying time, screen or pricing, check for confirmed bookings (Spec B4, B7)
  if (touchesScheduleOrPricing) {
    const hasBookings =
      (await BookedSeat.exists({ show: show._id })) ||
      (await Booking.exists({ show: show._id, status: BOOKING_STATUSES.CONFIRMED }));

    if (hasBookings) {
      throw new AppError(
        'Cannot modify show time, screen, or pricing when confirmed bookings exist',
        409,
        'SHOW_HAS_BOOKINGS'
      );
    }
  }

  let screenDoc = show.screen;
  if (updateData.screen && updateData.screen.toString() !== show.screen._id.toString()) {
    screenDoc = await Screen.findById(updateData.screen).populate('theatre');
    if (!screenDoc || !screenDoc.isActive) {
      throw new AppError('Screen not found or inactive', 404, 'NOT_FOUND');
    }
    if (!screenDoc.theatre || !screenDoc.theatre.isActive) {
      throw new AppError('Theatre not found or inactive', 404, 'NOT_FOUND');
    }
    show.screen = screenDoc._id;
    show.theatre = screenDoc.theatre._id;
    show.city = screenDoc.theatre.city;
  }

  if (updateData.language) {
    if (!show.movie.languages.includes(updateData.language)) {
      throw new AppError(
        `Language '${updateData.language}' is not available for this movie`,
        400,
        'VALIDATION_ERROR'
      );
    }
    show.language = updateData.language;
  }

  if (updateData.format) {
    if (!show.movie.formats.includes(updateData.format)) {
      throw new AppError(
        `Format '${updateData.format}' is not available for this movie`,
        400,
        'VALIDATION_ERROR'
      );
    }
    show.format = updateData.format;
  }

  if (updateData.pricing) {
    const requiredCategories = extractCategories(screenDoc.layout);
    for (const cat of requiredCategories) {
      if (updateData.pricing[cat] === undefined) {
        throw new AppError(
          `Pricing must include category '${cat}' required by the screen layout`,
          400,
          'VALIDATION_ERROR'
        );
      }
    }
    show.pricing = updateData.pricing;
  }

  if (updateData.startTime) {
    const newStartTime = new Date(updateData.startTime);
    if (newStartTime.getTime() <= Date.now()) {
      throw new AppError('Show startTime must be in the future', 400, 'SHOW_IN_PAST');
    }
    show.startTime = newStartTime;
    const durationTotalMinutes = show.movie.durationMin + SHOW_ADS_MINUTES;
    show.endTime = new Date(newStartTime.getTime() + durationTotalMinutes * 60 * 1000);
  }

  if (touchesScheduleOrPricing && (updateData.startTime || updateData.screen)) {
    await checkShowOverlap(screenDoc._id, show.startTime, show.endTime, show._id);
  }

  if (updateData.status) {
    show.status = updateData.status;
  }

  await show.save();

  return show.populate([
    { path: 'movie', select: 'title durationMin posterUrl certificate' },
    { path: 'screen', select: 'name totalSeats' },
    { path: 'theatre', select: 'name city address' },
  ]);
};

/**
 * Cancels a show (Spec B4)
 */
export const cancelShow = async (showId, cascade = false) => {
  const show = await Show.findById(showId);
  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  const hasConfirmedBookings =
    (await BookedSeat.exists({ show: show._id })) ||
    (await Booking.exists({ show: show._id, status: BOOKING_STATUSES.CONFIRMED }));

  if (hasConfirmedBookings && !cascade) {
    throw new AppError(
      'Show has confirmed bookings. Use cascade=true to cancel the show and its bookings',
      409,
      'SHOW_HAS_BOOKINGS'
    );
  }

  if (hasConfirmedBookings && cascade) {
    // Mark confirmed bookings as cancelled
    await Booking.updateMany(
      { show: show._id, status: BOOKING_STATUSES.CONFIRMED },
      {
        status: BOOKING_STATUSES.CANCELLED,
        cancelReason: CANCEL_REASONS.SHOW_CANCELLED,
        cancelledAt: new Date(),
      }
    );
    await BookedSeat.deleteMany({ show: show._id });
    await SeatHold.deleteMany({ show: show._id });
  }

  show.status = SHOW_STATUSES.CANCELLED;
  await show.save();

  return show;
};

/**
 * Gets a single Show by ID (Spec B4)
 */
export const getShowById = async (showId) => {
  const show = await Show.findById(showId).populate([
    { path: 'movie', select: 'title durationMin posterUrl certificate genres languages formats' },
    { path: 'screen', select: 'name totalSeats layout' },
    { path: 'theatre', select: 'name city address amenities' },
  ]);

  if (!show) {
    throw new AppError('Show not found', 404, 'NOT_FOUND');
  }

  return show;
};

/**
 * Public listing of shows by movie grouped by theatre (Spec B6.8)
 */
export const listByMovie = async (movieId, { date, city }) => {
  // Interpret date query in Asia/Kolkata (Spec B6.8)
  const dayStart = new Date(`${date}T00:00:00+05:30`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const from = new Date(Math.max(dayStart.getTime(), now.getTime()));

  // Ensure movie exists and not soft-deleted
  const movie = await Movie.findOne({ _id: movieId, isDeleted: false });
  if (!movie) {
    throw new AppError('Movie not found', 404, 'NOT_FOUND');
  }

  const movieSummary = {
    id: movie._id.toString(),
    title: movie.title,
    certificate: movie.certificate,
    durationMin: movie.durationMin,
    posterUrl: movie.posterUrl,
  };

  const filter = {
    movie: movie._id,
    city: { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') },
    status: SHOW_STATUSES.SCHEDULED,
    startTime: { $gte: from, $lt: dayEnd },
  };

  const shows = await Show.find(filter)
    .populate('theatre', 'name address amenities')
    .populate('screen', 'name totalSeats')
    .sort({ startTime: 1 });

  if (shows.length === 0) {
    return {
      date,
      movie: movieSummary,
      theatres: [],
    };
  }

  const showIds = shows.map((s) => s._id);

  // Two grouped aggregations across all returned shows (no N+1 queries)
  const [bookedCounts, heldCounts] = await Promise.all([
    BookedSeat.aggregate([
      { $match: { show: { $in: showIds } } },
      { $group: { _id: '$show', n: { $sum: 1 } } },
    ]),
    SeatHold.aggregate([
      { $match: { show: { $in: showIds }, expiresAt: { $gt: now } } },
      { $group: { _id: '$show', n: { $sum: 1 } } },
    ]),
  ]);

  const bookedMap = new Map(bookedCounts.map((b) => [b._id.toString(), b.n]));
  const heldMap = new Map(heldCounts.map((h) => [h._id.toString(), h.n]));

  // Group shows by theatre
  const theatreMap = new Map();

  for (const show of shows) {
    const totalSeats = show.screen?.totalSeats || 0;
    const booked = bookedMap.get(show._id.toString()) || 0;
    const held = heldMap.get(show._id.toString()) || 0;
    const free = Math.max(0, totalSeats - booked - held);

    let availability = SHOW_AVAILABILITY.AVAILABLE;
    if (free === 0) {
      availability = SHOW_AVAILABILITY.SOLD_OUT;
    } else if (totalSeats > 0 && free / totalSeats <= FILLING_FAST_THRESHOLD) {
      availability = SHOW_AVAILABILITY.FILLING_FAST;
    }

    const pricingObj =
      show.pricing instanceof Map ? Object.fromEntries(show.pricing) : show.pricing || {};
    const prices = Object.values(pricingObj);
    const priceFrom = prices.length ? Math.min(...prices) : 0;
    const priceTo = prices.length ? Math.max(...prices) : 0;

    const showCard = {
      id: show._id.toString(),
      startTime: show.startTime,
      endTime: show.endTime,
      language: show.language,
      format: show.format,
      screenName: show.screen?.name,
      pricing: pricingObj,
      priceFrom,
      priceTo,
      availability,
    };

    const theatre = show.theatre;
    const theatreId = theatre._id.toString();

    if (!theatreMap.has(theatreId)) {
      theatreMap.set(theatreId, {
        theatre: {
          id: theatreId,
          name: theatre.name,
          address: theatre.address,
          amenities: theatre.amenities || [],
        },
        shows: [],
      });
    }

    theatreMap.get(theatreId).shows.push(showCard);
  }

  // Sort theatres by name (Spec B6.8)
  const theatres = Array.from(theatreMap.values()).sort((a, b) =>
    a.theatre.name.localeCompare(b.theatre.name)
  );

  return {
    date,
    movie: movieSummary,
    theatres,
  };
};

export default {
  checkShowOverlap,
  createShow,
  updateShow,
  cancelShow,
  getShowById,
  listByMovie,
};
