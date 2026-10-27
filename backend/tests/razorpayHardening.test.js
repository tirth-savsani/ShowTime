import { jest } from '@jest/globals';
import crypto from 'crypto';
import request from 'supertest';
import app from '../app.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import SeatHold from '../models/SeatHold.js';
import BookedSeat from '../models/BookedSeat.js';
import Booking from '../models/Booking.js';
import razorpayInstance from '../config/razorpay.js';
import bookingService from '../services/booking.service.js';
import paymentService from '../services/payment.service.js';
import {
  COOKIE_NAME,
  USER_ROLES,
  BOOKING_STATUSES,
  MOVIE_STATUSES,
} from '../config/constants.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Razorpay Payment Hardening, Verification & Reconciliation (Phase 1.3)', () => {
  let sampleMovie;
  let sampleTheatre;
  let sampleScreen;
  let sampleShow;
  let testUser;
  let userCookie;

  const generateSignature = (orderId, paymentId, secret = env.RAZORPAY_KEY_SECRET || 'mock_secret_key') => {
    return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  };

  beforeEach(async () => {
    // 1. Mock Razorpay methods
    jest.spyOn(razorpayInstance.orders, 'create').mockImplementation(async (options) => {
      return {
        id: `order_test_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created',
      };
    });

    jest.spyOn(razorpayInstance.payments, 'fetch').mockImplementation(async (paymentId) => {
      return {
        id: paymentId,
        order_id: 'order_test_123',
        status: 'authorized',
        amount: 25000,
        currency: 'INR',
      };
    });

    jest.spyOn(razorpayInstance.payments, 'capture').mockImplementation(async (paymentId, amount, currency) => {
      return {
        id: paymentId,
        status: 'captured',
        amount,
        currency,
      };
    });

    jest.spyOn(razorpayInstance.orders, 'fetchPayments').mockImplementation(async (orderId) => {
      return {
        items: [
          {
            id: 'pay_reconcile_captured_1',
            order_id: orderId,
            status: 'captured',
            amount: 25000,
          },
        ],
      };
    });

    // 2. User setup
    const passwordHash = await bcrypt.hash('TestPassword@123', 10);
    testUser = await User.create({
      name: 'Test Hardening User',
      email: `test_${Date.now()}@showtime.test`,
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });

    const token = jwt.sign({ sub: testUser._id.toString(), role: testUser.role }, env.JWT_SECRET);
    userCookie = `${COOKIE_NAME}=${token}`;

    // 3. Catalogue setup
    sampleMovie = await Movie.create({
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen.',
      durationMin: 166,
      genres: ['Sci-Fi', 'Adventure'],
      languages: ['English', 'Hindi'],
      certificate: 'UA',
      releaseDate: new Date('2024-03-01'),
      status: MOVIE_STATUSES.NOW_SHOWING,
      posterUrl: 'https://example.com/dune.jpg',
      posterPublicId: 'posters/dune_part_two',
    });

    sampleTheatre = await Theatre.create({
      name: 'PVR Nexus Mall',
      city: 'Bengaluru',
      address: 'Koramangala, Bengaluru',
      amenities: ['Parking', 'Dolby Atmos'],
    });

    sampleScreen = await Screen.create({
      theatre: sampleTheatre._id,
      name: 'Screen 1',
      soundType: 'Dolby Atmos',
      screenType: 'IMAX',
      layout: {
        rows: [
          { label: 'A', seatCount: 10, category: 'SILVER', aisleAfter: [5] },
          { label: 'B', seatCount: 10, category: 'GOLD', aisleAfter: [5] },
        ],
      },
      totalSeats: 20,
      isActive: true,
    });

    sampleShow = await Show.create({
      movie: sampleMovie._id,
      theatre: sampleTheatre._id,
      screen: sampleScreen._id,
      city: 'Bengaluru',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 27 * 60 * 60 * 1000),
      language: 'English',
      format: '2D',
      pricing: { SILVER: 250, GOLD: 350 },
      status: 'scheduled',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('1. POST /api/bookings/checkout creates Razorpay order and holds seats', async () => {
    // Hold seat A1
    await SeatHold.create({
      show: sampleShow._id,
      seatId: 'A1',
      user: testUser._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/bookings/checkout')
      .set('Cookie', userCookie)
      .send({ showId: sampleShow._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.razorpay.orderId).toBeDefined();
    expect(res.body.data.razorpay.amountPaise).toBe(25000);
    expect(res.body.data.booking.seats).toHaveLength(1);
    expect(res.body.data.booking.seats[0].seatId).toBe('A1');
  });

  it('2. POST /api/bookings/verify validates signature, captures authorized payment, confirms booking', async () => {
    // Hold seat A1
    await SeatHold.create({
      show: sampleShow._id,
      seatId: 'A1',
      user: testUser._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const checkoutRes = await request(app)
      .post('/api/bookings/checkout')
      .set('Cookie', userCookie)
      .send({ showId: sampleShow._id.toString() });

    const bookingId = checkoutRes.body.data.booking.id;
    const orderId = checkoutRes.body.data.razorpay.orderId;
    const paymentId = 'pay_test_valid_123';
    const signature = generateSignature(orderId, paymentId);

    const verifyRes = await request(app)
      .post('/api/bookings/verify')
      .set('Cookie', userCookie)
      .send({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.status).toBe(BOOKING_STATUSES.CONFIRMED);

    // Assert BookedSeat created and SeatHold deleted
    const bookedSeat = await BookedSeat.findOne({ show: sampleShow._id, seatId: 'A1' });
    expect(bookedSeat).not.toBeNull();
    const remainingHold = await SeatHold.findOne({ show: sampleShow._id, seatId: 'A1' });
    expect(remainingHold).toBeNull();
  });

  it('3. POST /api/bookings/verify rejects tampered signature with 400 INVALID_SIGNATURE', async () => {
    await SeatHold.create({
      show: sampleShow._id,
      seatId: 'A1',
      user: testUser._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const checkoutRes = await request(app)
      .post('/api/bookings/checkout')
      .set('Cookie', userCookie)
      .send({ showId: sampleShow._id.toString() });

    const bookingId = checkoutRes.body.data.booking.id;
    const orderId = checkoutRes.body.data.razorpay.orderId;

    const verifyRes = await request(app)
      .post('/api/bookings/verify')
      .set('Cookie', userCookie)
      .send({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_test_tampered',
        razorpay_signature: 'invalid_tampered_signature_hex_value_1234567890abcdef',
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.code).toBe('INVALID_SIGNATURE');
  });

  it('4. POST /api/bookings/verify is idempotent (double-call returns same ticket)', async () => {
    await SeatHold.create({
      show: sampleShow._id,
      seatId: 'A1',
      user: testUser._id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const checkoutRes = await request(app)
      .post('/api/bookings/checkout')
      .set('Cookie', userCookie)
      .send({ showId: sampleShow._id.toString() });

    const bookingId = checkoutRes.body.data.booking.id;
    const orderId = checkoutRes.body.data.razorpay.orderId;
    const paymentId = 'pay_test_idempotent_123';
    const signature = generateSignature(orderId, paymentId);

    // Call 1
    const res1 = await request(app)
      .post('/api/bookings/verify')
      .set('Cookie', userCookie)
      .send({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });
    expect(res1.status).toBe(200);

    // Call 2 (double verify)
    const res2 = await request(app)
      .post('/api/bookings/verify')
      .set('Cookie', userCookie)
      .send({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });
    expect(res2.status).toBe(200);
    expect(res2.body.data.id).toBe(res1.body.data.id);
  });

  it('5. Background reconcilePendingPayments reconciles captured payment automatically', async () => {
    const booking = await Booking.create({
      bookingRef: 'ST-RECON-1234',
      user: testUser._id,
      show: sampleShow._id,
      seats: [{ seatId: 'A-2', category: 'CLASSIC', price: 250 }],
      amount: 250,
      currency: 'INR',
      status: BOOKING_STATUSES.PENDING,
      razorpay: { orderId: 'order_recon_test_1' },
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // created 2 mins ago
      expiresAt: new Date(Date.now() + 3 * 60 * 1000),
      snapshot: {
        movieId: sampleMovie._id,
        movieTitle: sampleMovie.title,
        theatreName: sampleTheatre.name,
        theatreAddress: sampleTheatre.address,
        city: sampleTheatre.city,
        screenName: sampleScreen.name,
        format: '2D',
        language: 'English',
        certificate: 'UA',
        posterUrl: sampleMovie.posterUrl,
        startTime: sampleShow.startTime,
      },
    });

    await SeatHold.create({
      show: sampleShow._id,
      seatId: 'A-2',
      user: testUser._id,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    });

    await bookingService.reconcilePendingPayments();

    const updated = await Booking.findById(booking._id);
    expect(updated.status).toBe(BOOKING_STATUSES.CONFIRMED);
    expect(updated.razorpay.paymentId).toBe('pay_reconcile_captured_1');

    const bookedSeat = await BookedSeat.findOne({ show: sampleShow._id, seatId: 'A-2' });
    expect(bookedSeat).not.toBeNull();
  });
});
