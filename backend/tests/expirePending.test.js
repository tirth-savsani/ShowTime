import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import SeatHold from '../models/SeatHold.js';
import Booking from '../models/Booking.js';
import { expirePendingBookings } from '../jobs/expirePending.job.js';
import {
  BOOKING_STATUSES,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  PENDING_BOOKING_EXPIRY_MINUTES,
} from '../config/constants.js';

describe('expirePendingBookings() — cron service function (Background Jobs)', () => {
  let regularUser;
  let movie;
  let theatre;
  let screen;
  let show;

  const buildFutureDate = (hoursFromNow = 48) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    return d;
  };

  const makeBookingSnapshot = () => ({
    movieId: movie._id,
    movieTitle: movie.title,
    posterUrl: movie.posterUrl,
    certificate: 'UA',
    language: 'English',
    format: '2D',
    theatreName: theatre.name,
    theatreAddress: theatre.address,
    city: theatre.city,
    screenName: screen.name,
    startTime: buildFutureDate(48),
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('Password@123', 10);
    regularUser = await User.create({
      name: 'Regular User',
      email: `user_${Date.now()}@showtime.test`,
      passwordHash,
      isActive: true,
    });

    movie = await Movie.create({
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
      genres: ['Action', 'Crime'],
      languages: ['English', 'Hindi'],
      formats: ['2D', 'IMAX'],
      durationMin: 152,
      releaseDate: new Date('2026-07-18'),
      certificate: 'UA',
      posterUrl: 'https://res.cloudinary.com/showtime/image/upload/v1/mock_poster.jpg',
      posterPublicId: 'showtime/movies/mock_poster',
      status: MOVIE_STATUSES.NOW_SHOWING,
    });

    theatre = await Theatre.create({
      name: 'Test Theatre',
      city: 'Mumbai',
      address: '1 MG Road',
      isActive: true,
    });

    screen = await Screen.create({
      theatre: theatre._id,
      name: 'Screen 1',
      layout: {
        rows: [
          { label: 'A', seatCount: 10, category: 'SILVER', aisleAfter: [5] },
        ],
      },
      totalSeats: 10,
      isActive: true,
    });

    show = await Show.create({
      movie: movie._id,
      theatre: theatre._id,
      screen: screen._id,
      city: 'Mumbai',
      language: 'English',
      format: '2D',
      startTime: buildFutureDate(48),
      endTime: buildFutureDate(51),
      status: SHOW_STATUSES.SCHEDULED,
      pricing: { SILVER: 200 },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should mark PENDING bookings past their expiresAt as EXPIRED and delete their holds', async () => {
    const expiredAt = new Date(Date.now() - 60_000);
    const booking = await Booking.create({
      bookingRef: 'SHT-EXPIRE1',
      user: regularUser._id,
      show: show._id,
      seats: [{ seatId: 'A1', category: 'SILVER', price: 200 }],
      amount: 200,
      status: BOOKING_STATUSES.PENDING,
      expiresAt: expiredAt,
      snapshot: makeBookingSnapshot(),
    });

    await SeatHold.create({
      user: regularUser._id,
      show: show._id,
      seatId: 'A1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    const { expired, holdsDeleted } = await expirePendingBookings();

    expect(expired).toBe(1);
    expect(holdsDeleted).toBe(1);

    const updated = await Booking.findById(booking._id);
    expect(updated.status).toBe(BOOKING_STATUSES.EXPIRED);

    const remainingHolds = await SeatHold.countDocuments({ show: show._id, user: regularUser._id });
    expect(remainingHolds).toBe(0);
  });

  it('should NOT expire a PENDING booking whose expiresAt is in the future', async () => {
    const futureExpiry = new Date(Date.now() + 5 * 60_000);
    const booking = await Booking.create({
      bookingRef: 'SHT-FRESH1',
      user: regularUser._id,
      show: show._id,
      seats: [{ seatId: 'A2', category: 'SILVER', price: 200 }],
      amount: 200,
      status: BOOKING_STATUSES.PENDING,
      expiresAt: futureExpiry,
      snapshot: makeBookingSnapshot(),
    });

    const { expired } = await expirePendingBookings();
    expect(expired).toBe(0);

    const unchanged = await Booking.findById(booking._id);
    expect(unchanged.status).toBe(BOOKING_STATUSES.PENDING);
  });

  it('should NOT touch CONFIRMED bookings', async () => {
    const booking = await Booking.create({
      bookingRef: 'SHT-CONF1',
      user: regularUser._id,
      show: show._id,
      seats: [{ seatId: 'A3', category: 'SILVER', price: 200 }],
      amount: 200,
      status: BOOKING_STATUSES.CONFIRMED,
      confirmedAt: new Date(),
      snapshot: makeBookingSnapshot(),
    });

    const { expired } = await expirePendingBookings();
    expect(expired).toBe(0);

    const unchanged = await Booking.findById(booking._id);
    expect(unchanged.status).toBe(BOOKING_STATUSES.CONFIRMED);
  });

  it('should use createdAt fallback when expiresAt is null and booking is old enough', async () => {
    const oldCreatedAt = new Date(
      Date.now() - (PENDING_BOOKING_EXPIRY_MINUTES + 1) * 60_000
    );
    const booking = await Booking.create({
      bookingRef: 'SHT-OLDFALLBACK1',
      user: regularUser._id,
      show: show._id,
      seats: [{ seatId: 'A4', category: 'SILVER', price: 200 }],
      amount: 200,
      status: BOOKING_STATUSES.PENDING,
      expiresAt: null,
      createdAt: oldCreatedAt,
      snapshot: makeBookingSnapshot(),
    });

    const { expired } = await expirePendingBookings();
    expect(expired).toBe(1);

    const updated = await Booking.findById(booking._id);
    expect(updated.status).toBe(BOOKING_STATUSES.EXPIRED);
  });
});
