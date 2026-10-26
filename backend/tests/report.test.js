/**
 * Task 7 Tests — Background Jobs and Admin Reporting (Spec B4, B6.10, B6.11)
 *
 * Tests:
 * 1. expirePendingBookings() service function (called directly)
 *    - PENDING booking older than expiry threshold → marked EXPIRED, holds deleted
 *    - PENDING booking within threshold → untouched
 *    - CONFIRMED booking → untouched
 * 2. GET /api/admin/stats — shape assertion
 * 3. GET /api/admin/bookings — list with pagination
 * 4. PATCH /api/admin/bookings/:id/cancel — admin cancel
 * 5. GET /api/admin/users — list with pagination
 * 6. PATCH /api/admin/users/:id/status — activate/deactivate + cannot self-deactivate
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { SeatHold } from '../models/SeatHold.js';
import { BookedSeat } from '../models/BookedSeat.js';
import { Booking } from '../models/Booking.js';
import razorpayInstance from '../config/razorpay.js';
import { expirePendingBookings } from '../jobs/expirePending.job.js';
import {
  BOOKING_STATUSES,
  CANCEL_REASONS,
  COOKIE_NAME,
  USER_ROLES,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  PENDING_BOOKING_EXPIRY_MINUTES,
} from '../config/constants.js';
import { env } from '../config/env.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const signCookie = (userId, role) => {
  const token = jwt.sign(
    { sub: userId.toString(), role },
    process.env.JWT_SECRET || env.JWT_SECRET
  );
  return `${COOKIE_NAME}=${token}`;
};

const buildFutureDate = (hoursFromNow = 48) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d;
};

const makeScreen = (theatreId) => ({
  theatre: theatreId,
  name: 'Screen A',
  totalSeats: 10,
  layout: {
    rows: [
      { label: 'A', seatCount: 5, category: 'SILVER', aisleAfter: [] },
      { label: 'B', seatCount: 5, category: 'GOLD', aisleAfter: [] },
    ],
    aisles: [],
  },
  isActive: true,
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

describe('Task 7 — Background Jobs & Admin Reporting', () => {
  let adminUser, adminCookie;
  let regularUser, userCookie;
  let movie, theatre, screen, show;

  beforeEach(async () => {
    // Mock Razorpay
    jest.spyOn(razorpayInstance.orders, 'create').mockResolvedValue({
      id: `order_mock_${Date.now()}`,
      amount: 50000,
      currency: 'INR',
      receipt: 'rcpt_mock',
      status: 'created',
    });
    jest.spyOn(razorpayInstance.payments, 'refund').mockResolvedValue({
      id: `rfnd_mock_${Date.now()}`,
      payment_id: 'pay_mock',
      amount: 50000,
      status: 'processed',
    });

    const passwordHash = await bcrypt.hash('Password@123', 10);

    adminUser = await User.create({
      name: 'Admin',
      email: 'admin.report@showtime.test',
      passwordHash,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });
    adminCookie = signCookie(adminUser._id, USER_ROLES.ADMIN);

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user.report@showtime.test',
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });
    userCookie = signCookie(regularUser._id, USER_ROLES.USER);

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

    screen = await Screen.create(makeScreen(theatre._id));

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
      pricing: { SILVER: 200, GOLD: 350 },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── 1. expirePendingBookings service ────────────────────────────────────────

  describe('expirePendingBookings() — cron service function', () => {
    const makeBookingSnapshot = () => ({
      movieId: new mongoose.Types.ObjectId(),
      movieTitle: 'Test Movie',
      posterUrl: 'https://example.com/poster.jpg',
      certificate: 'U',
      language: 'English',
      format: '2D',
      theatreName: 'Test Theatre',
      theatreAddress: '1 MG Road',
      city: 'Mumbai',
      screenName: 'Screen A',
      startTime: buildFutureDate(48),
    });

    it('should mark PENDING bookings past their expiresAt as EXPIRED and delete their holds', async () => {
      // Create an expired PENDING booking (expiresAt in the past)
      const expiredAt = new Date(Date.now() - 60_000); // 1 minute ago
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

      // Create a SeatHold for the same user/show (should be released)
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
      const futureExpiry = new Date(Date.now() + 5 * 60_000); // 5 minutes from now
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
      // Insert a booking with null expiresAt and old createdAt
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
      // Force createdAt (bypass timestamps auto-set)
      await Booking.updateOne({ _id: booking._id }, { $set: { createdAt: oldCreatedAt } });

      const { expired } = await expirePendingBookings();
      expect(expired).toBeGreaterThanOrEqual(1);

      const updated = await Booking.findById(booking._id);
      expect(updated.status).toBe(BOOKING_STATUSES.EXPIRED);
    });
  });

  // ── 2. GET /api/admin/stats ──────────────────────────────────────────────────

  describe('GET /api/admin/stats', () => {
    it('should return stats with correct shape', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data).toHaveProperty('totals');
      expect(data.totals).toHaveProperty('revenue');
      expect(data.totals).toHaveProperty('bookings');
      expect(data.totals).toHaveProperty('tickets');

      expect(data).toHaveProperty('activeShows');
      expect(typeof data.activeShows).toBe('number');

      expect(data).toHaveProperty('perDay');
      expect(Array.isArray(data.perDay)).toBe(true);
      expect(data.perDay.length).toBe(14); // 14-day default, zero-filled

      // Each day entry should have required fields
      data.perDay.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('revenue');
        expect(day).toHaveProperty('bookings');
        expect(day).toHaveProperty('tickets');
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      expect(data).toHaveProperty('topMovies');
      expect(Array.isArray(data.topMovies)).toBe(true);

      expect(data).toHaveProperty('upcomingOccupancy');
      expect(Array.isArray(data.upcomingOccupancy)).toBe(true);
    });

    it('should reject non-admin users with 403', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', userCookie);
      expect(res.status).toBe(403);
    });

    it('perDay should be zero-filled for days with no bookings', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      const perDay = res.body.data.perDay;
      // All revenues should be 0 since we have no confirmed bookings in tests
      perDay.forEach((d) => expect(d.revenue).toBe(0));
    });

    it('activeShows should count scheduled future shows', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      // We created 1 scheduled future show in beforeEach
      expect(res.body.data.activeShows).toBeGreaterThanOrEqual(1);
    });
  });

  // ── 3. GET /api/admin/bookings ───────────────────────────────────────────────

  describe('GET /api/admin/bookings', () => {
    const makeBookingSnapshot = (movieId) => ({
      movieId: movieId || new mongoose.Types.ObjectId(),
      movieTitle: 'Test Movie',
      posterUrl: 'https://example.com/poster.jpg',
      certificate: 'U',
      language: 'English',
      format: '2D',
      theatreName: 'Test Theatre',
      theatreAddress: '1 MG Road',
      city: 'Mumbai',
      screenName: 'Screen A',
      startTime: buildFutureDate(48),
    });

    it('should list all bookings with pagination envelope', async () => {
      await Booking.create({
        bookingRef: 'SHT-LIST1',
        user: regularUser._id,
        show: show._id,
        seats: [{ seatId: 'A1', category: 'SILVER', price: 200 }],
        amount: 200,
        status: BOOKING_STATUSES.CONFIRMED,
        confirmedAt: new Date(),
        snapshot: makeBookingSnapshot(movie._id),
      });

      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('pages');
    });

    it('should filter bookings by status', async () => {
      await Booking.create({
        bookingRef: 'SHT-PEND1',
        user: regularUser._id,
        show: show._id,
        seats: [{ seatId: 'B1', category: 'GOLD', price: 350 }],
        amount: 350,
        status: BOOKING_STATUSES.PENDING,
        snapshot: makeBookingSnapshot(movie._id),
      });

      const res = await request(app)
        .get('/api/admin/bookings?status=PENDING')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      res.body.data.items.forEach((b) => expect(b.status).toBe('PENDING'));
    });

    it('should require admin role', async () => {
      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Cookie', userCookie);
      expect(res.status).toBe(403);
    });
  });

  // ── 4. PATCH /api/admin/bookings/:id/cancel ──────────────────────────────────

  describe('PATCH /api/admin/bookings/:id/cancel', () => {
    it('should allow admin to cancel a confirmed booking', async () => {
      const booking = await Booking.create({
        bookingRef: 'SHT-ADMCAN1',
        user: regularUser._id,
        show: show._id,
        seats: [{ seatId: 'A1', category: 'SILVER', price: 200 }],
        amount: 200,
        status: BOOKING_STATUSES.CONFIRMED,
        confirmedAt: new Date(),
        snapshot: {
          movieId: movie._id,
          movieTitle: movie.title,
          posterUrl: movie.posterUrl,
          certificate: movie.certificate,
          language: 'English',
          format: '2D',
          theatreName: theatre.name,
          theatreAddress: theatre.address,
          city: theatre.city,
          screenName: screen.name,
          startTime: buildFutureDate(48),
        },
      });

      await BookedSeat.create({
        show: show._id,
        booking: booking._id,
        seatId: 'A1',
        category: 'SILVER',
        price: 200,
        user: regularUser._id,
      });

      const res = await request(app)
        .patch(`/api/admin/bookings/${booking._id}/cancel`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await Booking.findById(booking._id);
      expect(updated.status).toBe(BOOKING_STATUSES.CANCELLED);
      expect(updated.cancelReason).toBe(CANCEL_REASONS.ADMIN);

      // BookedSeats should be cleared
      const remainingSeats = await BookedSeat.countDocuments({ booking: booking._id });
      expect(remainingSeats).toBe(0);
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/admin/bookings/${fakeId}/cancel`)
        .set('Cookie', adminCookie);
      expect(res.status).toBe(404);
    });
  });

  // ── 5. GET /api/admin/users ──────────────────────────────────────────────────

  describe('GET /api/admin/users', () => {
    it('should list users with pagination', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2); // admin + regularUser
    });

    it('should filter users by search (name/email)', async () => {
      const res = await request(app)
        .get('/api/admin/users?search=Regular')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      const items = res.body.data.items;
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.some((u) => u.name === 'Regular User')).toBe(true);
    });

    it('should never return passwordHash', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      res.body.data.items.forEach((u) => {
        expect(u).not.toHaveProperty('passwordHash');
        expect(u).not.toHaveProperty('password');
      });
    });

    it('should require admin role', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Cookie', userCookie);
      expect(res.status).toBe(403);
    });
  });

  // ── 6. PATCH /api/admin/users/:id/status ────────────────────────────────────

  describe('PATCH /api/admin/users/:id/status', () => {
    it('should deactivate a user', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      const updated = await User.findById(regularUser._id);
      expect(updated.isActive).toBe(false);
    });

    it('should reactivate a deactivated user', async () => {
      await User.findByIdAndUpdate(regularUser._id, { isActive: false });

      const res = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(true);
    });

    it('should return 400 CANNOT_DEACTIVATE_SELF when admin tries to deactivate themselves', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CANNOT_DEACTIVATE_SELF');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/admin/users/${fakeId}/status`)
        .set('Cookie', adminCookie)
        .send({ isActive: false });

      expect(res.status).toBe(404);
    });

    it('should return 400 when isActive is missing from body', async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/status`)
        .set('Cookie', adminCookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
