import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { USER_ROLES, BOOKING_STATUSES } from '../config/constants.js';
import { validateStatusCode } from '../views/response.js';

describe('Response Helpers & Status Code Regression Tests (Phase 1.1)', () => {
  let testUser;
  let userCookie;
  let testMovie;
  let testTheatre;
  let testScreen;
  let testShow;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Regression User',
      email: 'regression@showtime.test',
      passwordHash: 'dummyhash123',
      role: USER_ROLES.USER,
      isActive: true,
    });
    const token = jwt.sign({ sub: testUser._id.toString(), role: testUser.role }, env.JWT_SECRET);
    userCookie = `token=${token}`;

    // Create test movie
    testMovie = await Movie.create({
      title: 'Regression Movie',
      slug: 'regression-movie',
      description: 'A regression test movie description.',
      durationMin: 120,
      genres: ['Action'],
      languages: ['Hindi'],
      formats: ['2D'],
      certificate: 'UA',
      releaseDate: new Date(),
      status: 'now_showing',
      posterUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      posterPublicId: 'sample_id',
    });

    // Create test theatre & screen
    testTheatre = await Theatre.create({
      name: 'Regression Cinema',
      city: 'Bengaluru',
      address: 'MG Road',
      isActive: true,
    });

    testScreen = await Screen.create({
      theatre: testTheatre._id,
      screenNumber: 1,
      name: 'Audi 1',
      supportedFormats: ['2D'],
      layout: {
        rows: [
          { label: 'A', category: 'CLASSIC', seatCount: 10, aisleAfter: [5] }
        ]
      }
    });

    // Create test show
    const startTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 120 * 60 * 1000);
    testShow = await Show.create({
      movie: testMovie._id,
      theatre: testTheatre._id,
      screen: testScreen._id,
      city: 'Bengaluru',
      format: '2D',
      language: 'Hindi',
      startTime,
      endTime,
      pricing: { CLASSIC: 200 },
      status: 'scheduled',
    });

    const baseSnapshot = {
      movieId: testMovie._id,
      movieTitle: testMovie.title,
      posterUrl: testMovie.posterUrl,
      certificate: testMovie.certificate,
      theatreName: testTheatre.name,
      theatreAddress: testTheatre.address,
      city: testTheatre.city,
      screenName: testScreen.name,
      startTime: testShow.startTime,
      format: testShow.format,
      language: testShow.language,
    };

    // Create bookings in upcoming, past, and cancelled states
    await Booking.create({
      bookingRef: 'SHT-TEST-001',
      user: testUser._id,
      show: testShow._id,
      seats: [{ seatId: 'A1', category: 'CLASSIC', price: 200 }],
      amount: 200,
      totalAmount: 200,
      status: BOOKING_STATUSES.CONFIRMED,
      snapshot: baseSnapshot,
    });

    await Booking.create({
      bookingRef: 'SHT-TEST-002',
      user: testUser._id,
      show: testShow._id,
      seats: [{ seatId: 'A2', category: 'CLASSIC', price: 200 }],
      amount: 200,
      totalAmount: 200,
      status: BOOKING_STATUSES.CONFIRMED,
      snapshot: {
        ...baseSnapshot,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Past
      },
    });

    await Booking.create({
      bookingRef: 'SHT-TEST-003',
      user: testUser._id,
      show: testShow._id,
      seats: [{ seatId: 'A3', category: 'CLASSIC', price: 200 }],
      amount: 200,
      totalAmount: 200,
      status: BOOKING_STATUSES.CANCELLED,
      snapshot: baseSnapshot,
    });
  });

  describe('Unit guards on validateStatusCode', () => {
    it('accepts valid integer status codes between 100 and 599', () => {
      expect(validateStatusCode(200)).toBe(200);
      expect(validateStatusCode(201)).toBe(201);
      expect(validateStatusCode(400)).toBe(400);
      expect(validateStatusCode(404)).toBe(404);
      expect(validateStatusCode(500)).toBe(500);
    });

    it('throws TypeError in development if status code is not an integer between 100 and 599', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      expect(() => validateStatusCode('200')).toThrow(TypeError);
      expect(() => validateStatusCode('Bookings fetched successfully')).toThrow(TypeError);
      expect(() => validateStatusCode(99)).toThrow(TypeError);
      expect(() => validateStatusCode(600)).toThrow(TypeError);
      expect(() => validateStatusCode(null)).toThrow(TypeError);

      process.env.NODE_ENV = originalEnv;
    });

    it('falls back to 500 in production when invalid status code is given', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      expect(validateStatusCode('invalid')).toBe(500);
      expect(validateStatusCode(999)).toBe(500);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('My Bookings Tabs Regression (Fixing BUG-001)', () => {
    it('GET /api/bookings/my?tab=upcoming returns 200 with integer status and items', async () => {
      const res = await request(app)
        .get('/api/bookings/my?tab=upcoming')
        .set('Cookie', userCookie);

      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Bookings fetched successfully');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });

    it('GET /api/bookings/my?tab=past returns 200 with integer status and items', async () => {
      const res = await request(app)
        .get('/api/bookings/my?tab=past')
        .set('Cookie', userCookie);

      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });

    it('GET /api/bookings/my?tab=cancelled returns 200 with integer status and items', async () => {
      const res = await request(app)
        .get('/api/bookings/my?tab=cancelled')
        .set('Cookie', userCookie);

      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });
  });

  describe('Catalogue & Discovery Endpoints Status Code & Shape Verification', () => {
    it('GET /api/movies returns 200 with envelope', async () => {
      const res = await request(app).get('/api/movies');
      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });

    it('GET /api/cities returns 200 with envelope', async () => {
      const res = await request(app).get('/api/cities');
      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });

    it('GET /api/movies/:id/shows returns 200 with envelope', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await request(app).get(`/api/movies/${testMovie._id}/shows?city=Bengaluru&date=${today}`);
      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });

    it('GET /health returns 200 with health details', async () => {
      const res = await request(app).get('/health');
      expect(Number.isInteger(res.status)).toBe(true);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(JSON.stringify(res.body)).not.toContain('Invalid status code');
    });
  });
});
