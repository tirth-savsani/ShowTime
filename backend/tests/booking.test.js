import { jest } from '@jest/globals';
import crypto from 'crypto';
import request from 'supertest';
import app from '../app.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { User } from '../models/User.js';
import { SeatHold } from '../models/SeatHold.js';
import { BookedSeat } from '../models/BookedSeat.js';
import { Booking } from '../models/Booking.js';
import razorpayInstance from '../config/razorpay.js';
import {
  COOKIE_NAME,
  USER_ROLES,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  BOOKING_STATUSES,
} from '../config/constants.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Booking, Razorpay Payment and Cancellation Module (Spec B3, B4, B6.4, B6.5, B6.6, B6.9)', () => {
  let sampleMovie;
  let sampleTheatre;
  let sampleScreen;
  let sampleShow;
  let user1;
  let user2;
  let adminUser;
  let user1Cookie;
  let user2Cookie;
  let adminCookie;

  const generateSignature = (orderId, paymentId, secret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET || 'mock_secret_key') => {
    return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  };

  const generateWebhookSig = (rawBody, secret = process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret') => {
    return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  };

  beforeEach(async () => {
    // 1. Mock Razorpay SDK methods
    jest.spyOn(razorpayInstance.orders, 'create').mockImplementation(async (options) => {
      return {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created',
      };
    });

    jest.spyOn(razorpayInstance.payments, 'refund').mockImplementation(async (paymentId, options) => {
      return {
        id: `rfnd_mock_${Date.now()}`,
        payment_id: paymentId,
        amount: options.amount,
        status: 'processed',
      };
    });

    // 2. Create Users
    const passwordHash = await bcrypt.hash('Password@123', 10);
    user1 = await User.create({
      name: 'User One',
      email: 'user1.book@showtime.test',
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });

    user2 = await User.create({
      name: 'User Two',
      email: 'user2.book@showtime.test',
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });

    adminUser = await User.create({
      name: 'Admin Book',
      email: 'admin.book@showtime.test',
      passwordHash,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    const token1 = jwt.sign({ sub: user1._id.toString(), role: user1.role }, env.JWT_SECRET);
    const token2 = jwt.sign({ sub: user2._id.toString(), role: user2.role }, env.JWT_SECRET);
    const adminToken = jwt.sign({ sub: adminUser._id.toString(), role: adminUser.role }, env.JWT_SECRET);

    user1Cookie = `${COOKIE_NAME}=${token1}`;
    user2Cookie = `${COOKIE_NAME}=${token2}`;
    adminCookie = `${COOKIE_NAME}=${adminToken}`;

    // 3. Create Catalogue setup
    sampleMovie = await Movie.create({
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

    sampleTheatre = await Theatre.create({
      name: 'PVR Orion Mall',
      city: 'Bengaluru',
      address: 'Brigade Gateway, Malleshwaram',
      amenities: ['Parking', 'Food Court'],
      isActive: true,
    });

    sampleScreen = await Screen.create({
      theatre: sampleTheatre._id,
      name: 'Audi 1',
      layout: {
        rows: [
          { label: 'A', seatCount: 10, category: 'SILVER', aisleAfter: [5] },
          { label: 'B', seatCount: 10, category: 'GOLD', aisleAfter: [5] },
        ],
      },
      totalSeats: 20,
      isActive: true,
    });

    // 4. Create Show (starts 24 hours in the future)
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + (152 + 15) * 60 * 1000);
    sampleShow = await Show.create({
      movie: sampleMovie._id,
      screen: sampleScreen._id,
      theatre: sampleTheatre._id,
      city: 'Bengaluru',
      startTime,
      endTime,
      language: 'English',
      format: '2D',
      pricing: { SILVER: 200, GOLD: 350 },
      status: SHOW_STATUSES.SCHEDULED,
    });
  });

  describe('Checkout Endpoint (POST /api/bookings/checkout)', () => {
    it('fails with 409 HOLD_NOT_FOUND when user has no active seat hold', async () => {
      const res = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: sampleShow._id.toString() });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('HOLD_NOT_FOUND');
    });

    it('creates PENDING booking and Razorpay order when hold is active, extending hold time', async () => {
      // 1. User holds A1 and B1 (SILVER 200 + GOLD 350 = 550)
      const holdRes = await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', user1Cookie)
        .send({ seatIds: ['A1', 'B1'] });

      expect(holdRes.status).toBe(201);
      const originalExpiresAt = new Date(holdRes.body.data.expiresAt).getTime();

      // 2. Checkout
      const checkoutRes = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: sampleShow._id.toString() });

      expect(checkoutRes.status).toBe(201);
      expect(checkoutRes.body.success).toBe(true);

      const { booking, razorpay } = checkoutRes.body.data;
      expect(booking.amount).toBe(550);
      expect(booking.seats.length).toBe(2);
      expect(booking.bookingRef).toMatch(/^SHT-[A-Z0-9]{6}$/);
      expect(razorpay.orderId).toBeDefined();
      expect(razorpay.amountPaise).toBe(55000);
      expect(razorpay.currency).toBe('INR');

      // Verify DB record
      const dbBooking = await Booking.findById(booking.id);
      expect(dbBooking.status).toBe(BOOKING_STATUSES.PENDING);
      expect(dbBooking.razorpay.orderId).toBe(razorpay.orderId);

      // Verify hold was extended (Spec B6.4)
      const holds = await SeatHold.find({ show: sampleShow._id, user: user1._id });
      for (const h of holds) {
        expect(h.expiresAt.getTime()).toBeGreaterThanOrEqual(originalExpiresAt);
      }
    });
  });

  describe('Payment Verification Endpoint (POST /api/bookings/verify)', () => {
    let pendingBooking;
    let mockOrderId;

    beforeEach(async () => {
      // Setup active hold and checkout
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', user1Cookie)
        .send({ seatIds: ['A1', 'A2'] });

      const checkoutRes = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: sampleShow._id.toString() });

      pendingBooking = checkoutRes.body.data.booking;
      mockOrderId = checkoutRes.body.data.razorpay.orderId;
    });

    it('rejects tampered signature with 400 INVALID_SIGNATURE', async () => {
      const paymentId = 'pay_mock_12345';
      const fakeSignature = 'tampered_signature_abc123';

      const res = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId: pendingBooking.id,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: fakeSignature,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_SIGNATURE');

      // Booking remains PENDING
      const dbBooking = await Booking.findById(pendingBooking.id);
      expect(dbBooking.status).toBe(BOOKING_STATUSES.PENDING);
    });

    it('rejects mismatched orderId with 400 INVALID_SIGNATURE', async () => {
      const paymentId = 'pay_mock_12345';
      const wrongOrderId = 'order_wrong_99999';
      const signature = generateSignature(wrongOrderId, paymentId);

      const res = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId: pendingBooking.id,
          razorpay_order_id: wrongOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_SIGNATURE');
    });

    it('successfully confirms booking, creates BookedSeat, removes SeatHold, and returns ticket with QR code', async () => {
      const paymentId = 'pay_mock_12345';
      const validSignature = generateSignature(mockOrderId, paymentId);

      const res = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId: pendingBooking.id,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const ticket = res.body.data;
      expect(ticket.id).toBe(pendingBooking.id);
      expect(ticket.status).toBe(BOOKING_STATUSES.CONFIRMED);
      expect(ticket.qrDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(ticket.razorpay.paymentId).toBe(paymentId);

      // Verify BookedSeat rows inserted in DB
      const bookedSeats = await BookedSeat.find({ booking: pendingBooking.id });
      expect(bookedSeats.length).toBe(2);
      const bookedSeatIds = bookedSeats.map((b) => b.seatId).sort();
      expect(bookedSeatIds).toEqual(['A1', 'A2']);

      // Verify SeatHold rows deleted
      const remainingHolds = await SeatHold.countDocuments({
        show: sampleShow._id,
        seatId: { $in: ['A1', 'A2'] },
      });
      expect(remainingHolds).toBe(0);
    });

    it('is idempotent: repeated verification of CONFIRMED booking returns same ticket without error', async () => {
      const paymentId = 'pay_mock_12345';
      const validSignature = generateSignature(mockOrderId, paymentId);

      // First call -> confirms
      const firstRes = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId: pendingBooking.id,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        });
      expect(firstRes.status).toBe(200);

      // Second call -> returns same ticket idempotently
      const secondRes = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId: pendingBooking.id,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        });

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.data.id).toBe(pendingBooking.id);
      expect(secondRes.body.data.status).toBe(BOOKING_STATUSES.CONFIRMED);
    });

    it('automatically refunds payment and returns 409 SEATS_UNAVAILABLE_REFUNDED if seats were taken during payment', async () => {
      // Simulate another booking taking A1 before User 1 verifies
      await BookedSeat.create({
        show: sampleShow._id,
        seatId: 'A1',
        booking: new User()._id,
      });

      const paymentId = 'pay_mock_race_winner';
      const validSignature = generateSignature(mockOrderId, paymentId);

      const res = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId: pendingBooking.id,
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SEATS_UNAVAILABLE_REFUNDED');
      expect(res.body.details?.refundId).toBeDefined();

      // Booking status should be FAILED with refund stored
      const dbBooking = await Booking.findById(pendingBooking.id);
      expect(dbBooking.status).toBe(BOOKING_STATUSES.FAILED);
      expect(dbBooking.refund.status).toBe('PROCESSED');
    });
  });

  describe('Security and Ownership (GET /api/bookings/:id)', () => {
    let user1ConfirmedBooking;

    beforeEach(async () => {
      // Setup confirmed booking for User 1
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', user1Cookie)
        .send({ seatIds: ['A1'] });

      const checkoutRes = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: sampleShow._id.toString() });

      const bookingId = checkoutRes.body.data.booking.id;
      const orderId = checkoutRes.body.data.razorpay.orderId;
      const paymentId = 'pay_mock_own_123';
      const signature = generateSignature(orderId, paymentId);

      const verifyRes = await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });

      user1ConfirmedBooking = verifyRes.body.data;
    });

    it('allows owner to read own booking', async () => {
      const res = await request(app)
        .get(`/api/bookings/${user1ConfirmedBooking.id}`)
        .set('Cookie', user1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user1ConfirmedBooking.id);
    });

    it('blocks another user from reading user booking with 404 NOT_FOUND', async () => {
      const res = await request(app)
        .get(`/api/bookings/${user1ConfirmedBooking.id}`)
        .set('Cookie', user2Cookie);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('allows admin to read any user booking', async () => {
      const res = await request(app)
        .get(`/api/bookings/${user1ConfirmedBooking.id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user1ConfirmedBooking.id);
    });
  });

  describe('Cancellation and Cutoff Rules (POST /api/bookings/:id/cancel)', () => {
    it('cancels booking and issues refund when show is more than 2 hours away', async () => {
      // Show is 24 hours away (> 2h cutoff)
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', user1Cookie)
        .send({ seatIds: ['A1'] });

      const checkoutRes = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: sampleShow._id.toString() });

      const bookingId = checkoutRes.body.data.booking.id;
      const orderId = checkoutRes.body.data.razorpay.orderId;
      const paymentId = 'pay_mock_cancel_ok';

      await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: generateSignature(orderId, paymentId),
        });

      // User cancels booking
      const cancelRes = await request(app)
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Cookie', user1Cookie)
        .send({});

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe(BOOKING_STATUSES.CANCELLED);
      expect(cancelRes.body.data.refund.status).toBe('PROCESSED');

      // BookedSeat is deleted, seat becomes free
      const bookedCount = await BookedSeat.countDocuments({ booking: bookingId });
      expect(bookedCount).toBe(0);
    });

    it('rejects cancellation with 409 CANCEL_WINDOW_CLOSED when within 2 hours of showtime', async () => {
      // Create show 1 hour in the future
      const closeStartTime = new Date(Date.now() + 60 * 60 * 1000);
      const closeEndTime = new Date(closeStartTime.getTime() + 167 * 60 * 1000);
      const closeShow = await Show.create({
        movie: sampleMovie._id,
        screen: sampleScreen._id,
        theatre: sampleTheatre._id,
        city: 'Bengaluru',
        startTime: closeStartTime,
        endTime: closeEndTime,
        language: 'English',
        format: '2D',
        pricing: { SILVER: 200, GOLD: 350 },
        status: SHOW_STATUSES.SCHEDULED,
      });

      // Hold and checkout
      await request(app)
        .post(`/api/shows/${closeShow._id}/hold`)
        .set('Cookie', user1Cookie)
        .send({ seatIds: ['A1'] });

      const checkoutRes = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: closeShow._id.toString() });

      const bookingId = checkoutRes.body.data.booking.id;
      const orderId = checkoutRes.body.data.razorpay.orderId;
      const paymentId = 'pay_mock_too_late';

      await request(app)
        .post('/api/bookings/verify')
        .set('Cookie', user1Cookie)
        .send({
          bookingId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: generateSignature(orderId, paymentId),
        });

      // Attempt to cancel
      const cancelRes = await request(app)
        .post(`/api/bookings/${bookingId}/cancel`)
        .set('Cookie', user1Cookie)
        .send({});

      expect(cancelRes.status).toBe(409);
      expect(cancelRes.body.code).toBe('CANCEL_WINDOW_CLOSED');
    });
  });

  describe('Webhook Backup Handling (POST /api/payments/webhook)', () => {
    it('rejects invalid webhook signature with 400 INVALID_SIGNATURE', async () => {
      const rawPayload = Buffer.from(JSON.stringify({ event: 'payment.captured' }));

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', 'invalid_signature_string')
        .send(rawPayload);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_SIGNATURE');
    });

    it('confirms PENDING booking idempotently on payment.captured event', async () => {
      // Hold and checkout
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', user1Cookie)
        .send({ seatIds: ['A5'] });

      const checkoutRes = await request(app)
        .post('/api/bookings/checkout')
        .set('Cookie', user1Cookie)
        .send({ showId: sampleShow._id.toString() });

      const bookingId = checkoutRes.body.data.booking.id;
      const orderId = checkoutRes.body.data.razorpay.orderId;

      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_mock_webhook_captured',
              order_id: orderId,
              amount: 20000,
            },
          },
        },
      };

      const payloadStr = JSON.stringify(webhookBody);
      const sig = generateWebhookSig(payloadStr);

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('x-razorpay-signature', sig)
        .send(payloadStr);

      expect(res.status).toBe(200);

      // Verify booking was confirmed
      const dbBooking = await Booking.findById(bookingId);
      expect(dbBooking.status).toBe(BOOKING_STATUSES.CONFIRMED);
      expect(dbBooking.razorpay.paymentId).toBe('pay_mock_webhook_captured');

      // Verify BookedSeat created
      const booked = await BookedSeat.findOne({ booking: bookingId, seatId: 'A5' });
      expect(booked).not.toBeNull();
    });
  });
});
