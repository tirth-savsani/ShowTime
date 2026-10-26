import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { BookedSeat } from '../models/BookedSeat.js';
import { SeatHold } from '../models/SeatHold.js';
import {
  COOKIE_NAME,
  USER_ROLES,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  BOOKING_STATUSES,
  SHOW_AVAILABILITY,
} from '../config/constants.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Show Scheduling and Discovery Module (Spec B3, B4, B6.7, B6.8)', () => {
  let adminCookie;
  let userCookie;
  let regularUser;
  let adminUser;
  let sampleMovie;
  let sampleTheatre;
  let sampleScreen;

  beforeEach(async () => {
    // 1. Create Users
    const passwordHash = await bcrypt.hash('Password@123', 10);
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin.show@showtime.test',
      passwordHash,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user.show@showtime.test',
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });

    const adminToken = jwt.sign(
      { sub: adminUser._id.toString(), role: adminUser.role },
      env.JWT_SECRET
    );
    const userToken = jwt.sign(
      { sub: regularUser._id.toString(), role: regularUser.role },
      env.JWT_SECRET
    );

    adminCookie = `${COOKIE_NAME}=${adminToken}`;
    userCookie = `${COOKIE_NAME}=${userToken}`;

    // 2. Create Sample Movie (120 mins duration)
    sampleMovie = await Movie.create({
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      genres: ['Sci-Fi', 'Action'],
      languages: ['English', 'Hindi'],
      formats: ['2D', 'IMAX'],
      durationMin: 120,
      releaseDate: new Date('2026-07-16'),
      certificate: 'UA',
      posterUrl: 'https://res.cloudinary.com/showtime/image/upload/v1/mock_poster.jpg',
      posterPublicId: 'showtime/movies/mock_poster',
      status: MOVIE_STATUSES.NOW_SHOWING,
    });

    // 3. Create Sample Theatre
    sampleTheatre = await Theatre.create({
      name: 'PVR Phoenix Marketcity',
      city: 'Bengaluru',
      address: 'Whitefield Main Road, Mahadevapura',
      amenities: ['Parking', 'Food Court', 'Recliners'],
      isActive: true,
    });

    // 4. Create Sample Screen (Two categories: SILVER, GOLD; total 10 seats)
    sampleScreen = await Screen.create({
      theatre: sampleTheatre._id,
      name: 'Audi 1',
      layout: {
        rows: [
          { label: 'A', seatCount: 5, category: 'SILVER', aisleAfter: [2] },
          { label: 'B', seatCount: 5, category: 'GOLD', aisleAfter: [2] },
        ],
      },
      totalSeats: 10,
      isActive: true,
    });
  });

  describe('Admin Show Scheduling (POST /api/admin/shows)', () => {
    it('creates a show successfully and computes endTime with 15m ads', async () => {
      // 3 days in future at 14:00 UTC
      const startTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      startTime.setUTCHours(14, 0, 0, 0);

      const res = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: startTime.toISOString(),
          language: 'English',
          format: 'IMAX',
          pricing: {
            SILVER: 200,
            GOLD: 350,
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.city).toBe('Bengaluru');
      expect(res.body.data.theatre.name).toBe('PVR Phoenix Marketcity');
      expect(res.body.data.pricing).toEqual({ SILVER: 200, GOLD: 350 });

      // Movie duration = 120m, ads = 15m -> total 135m = 2 hours 15 mins
      const expectedEnd = new Date(startTime.getTime() + 135 * 60 * 1000);
      expect(new Date(res.body.data.endTime).toISOString()).toBe(expectedEnd.toISOString());
    });

    it('rejects regular users with 403 FORBIDDEN', async () => {
      const startTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const res = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', userCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: startTime.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('rejects show scheduling with startTime in the past with 400 SHOW_IN_PAST', async () => {
      const pastTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      const res = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: pastTime.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SHOW_IN_PAST');
    });

    it('rejects pricing that does not cover all categories in the screen layout', async () => {
      const startTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      // Screen requires SILVER and GOLD; only providing SILVER
      const res = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: startTime.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150 },
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects language not offered by movie', async () => {
      const startTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: startTime.toISOString(),
          language: 'Tamil', // Movie only has English and Hindi
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Show Overlap Validation (Spec B6.7)', () => {
    it('enforces 15-minute buffer between shows on the same screen', async () => {
      // Create Base Show: Day 4, 14:00 to 16:15 UTC (120m movie + 15m ads)
      const baseStart = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
      baseStart.setUTCHours(14, 0, 0, 0);

      const baseRes = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: baseStart.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(baseRes.status).toBe(201);
      const baseShowId = baseRes.body.data.id;

      // 1. Overlap test: Starts at 16:20 (only 5m after base show ends at 16:15; buffer requires >= 16:30)
      const overlapStart = new Date(baseStart.getTime() + (120 + 15 + 5) * 60 * 1000);
      const overlapRes = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: overlapStart.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(overlapRes.status).toBe(409);
      expect(overlapRes.body.code).toBe('SHOW_OVERLAP');
      expect(overlapRes.body.details?.conflictingShow?.id).toBe(baseShowId);
      expect(overlapRes.body.details?.conflictingShow?.movieTitle).toBe('Inception');

      // 2. Overlap test: Ends within 15m before base show starts
      // Base starts 14:00. Buffer requires ends <= 13:45.
      // If duration is 135m, starting at 11:35 ends at 13:50 (which violates 15m buffer)
      const earlyOverlapStart = new Date(baseStart.getTime() - (135 + 10) * 60 * 1000);
      const earlyOverlapRes = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: earlyOverlapStart.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(earlyOverlapRes.status).toBe(409);
      expect(earlyOverlapRes.body.code).toBe('SHOW_OVERLAP');

      // 3. Non-overlapping show: Starts at 16:35 (20 mins after 16:15, safely > 15m buffer)
      const safeStart = new Date(baseStart.getTime() + (135 + 20) * 60 * 1000);
      const safeRes = await request(app)
        .post('/api/admin/shows')
        .set('Cookie', adminCookie)
        .send({
          movie: sampleMovie._id.toString(),
          screen: sampleScreen._id.toString(),
          startTime: safeStart.toISOString(),
          language: 'English',
          format: '2D',
          pricing: { SILVER: 150, GOLD: 250 },
        });

      expect(safeRes.status).toBe(201);
    });
  });

  const createFakeBooking = async (show, user, bookingRef = 'SHT-TEST01') => {
    return Booking.create({
      bookingRef,
      user: user._id,
      show: show._id,
      seats: [{ seatId: 'A1', category: 'SILVER', price: 150 }],
      amount: 150,
      status: BOOKING_STATUSES.CONFIRMED,
      snapshot: {
        movieId: sampleMovie._id,
        movieTitle: sampleMovie.title,
        posterUrl: sampleMovie.posterUrl,
        certificate: sampleMovie.certificate,
        language: show.language || 'English',
        format: show.format || '2D',
        theatreName: sampleTheatre.name,
        theatreAddress: sampleTheatre.address,
        city: sampleTheatre.city,
        screenName: sampleScreen.name,
        startTime: show.startTime,
      },
    });
  };

  describe('Show Modification & Cancellation Guards', () => {
    let testShow;

    beforeEach(async () => {
      const startTime = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 135 * 60 * 1000);
      testShow = await Show.create({
        movie: sampleMovie._id,
        screen: sampleScreen._id,
        theatre: sampleTheatre._id,
        city: sampleTheatre.city,
        startTime,
        endTime,
        language: 'English',
        format: '2D',
        pricing: { SILVER: 150, GOLD: 250 },
        status: SHOW_STATUSES.SCHEDULED,
      });
    });

    it('blocks updating time/screen/pricing when confirmed bookings exist (SHOW_HAS_BOOKINGS)', async () => {
      // Simulate confirmed booking with booked seat
      const fakeBooking = await createFakeBooking(testShow, regularUser, 'SHT-TEST01');

      await BookedSeat.create({
        show: testShow._id,
        seatId: 'A1',
        booking: fakeBooking._id,
      });

      const newStart = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
      const res = await request(app)
        .put(`/api/admin/shows/${testShow._id}`)
        .set('Cookie', adminCookie)
        .send({
          startTime: newStart.toISOString(),
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SHOW_HAS_BOOKINGS');
    });

    it('blocks deleting show with confirmed bookings unless cascade=true', async () => {
      const fakeBooking = await createFakeBooking(testShow, regularUser, 'SHT-TEST02');

      await BookedSeat.create({
        show: testShow._id,
        seatId: 'A1',
        booking: fakeBooking._id,
      });

      // 1. Without cascade -> 409
      const res = await request(app)
        .delete(`/api/admin/shows/${testShow._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SHOW_HAS_BOOKINGS');

      // 2. With cascade=true -> 200
      const cascadeRes = await request(app)
        .delete(`/api/admin/shows/${testShow._id}?cascade=true`)
        .set('Cookie', adminCookie);

      expect(cascadeRes.status).toBe(200);
      expect(cascadeRes.body.data.status).toBe(SHOW_STATUSES.CANCELLED);

      // Verify booked seat deleted
      const remainingBookedSeats = await BookedSeat.countDocuments({ show: testShow._id });
      expect(remainingBookedSeats).toBe(0);

      // Verify booking cancelled
      const updatedBooking = await Booking.findById(fakeBooking._id);
      expect(updatedBooking.status).toBe(BOOKING_STATUSES.CANCELLED);
    });
  });

  describe('Public Discovery: GET /api/movies/:id/shows', () => {
    let secondTheatre;
    let secondScreen;
    let targetDateStr;

    beforeEach(async () => {
      // Setup second theatre in Bengaluru
      secondTheatre = await Theatre.create({
        name: 'INOX Garuda Mall',
        city: 'Bengaluru',
        address: 'Magrath Road',
        amenities: ['M-Ticket', 'Food Court'],
        isActive: true,
      });

      secondScreen = await Screen.create({
        theatre: secondTheatre._id,
        name: 'Screen 2',
        layout: {
          rows: [{ label: 'A', seatCount: 10, category: 'SILVER', aisleAfter: [] }],
        },
        totalSeats: 10,
        isActive: true,
      });

      // Choose a fixed future date for tests (Day 7 from now)
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      targetDateStr = `${yyyy}-${mm}-${dd}`;

      // Show 1 on PVR (10 total seats, 0 booked -> AVAILABLE)
      const pvrStart = new Date(`${targetDateStr}T10:00:00+05:30`);
      const pvrEnd = new Date(pvrStart.getTime() + 135 * 60 * 1000);
      const pvrShow = await Show.create({
        movie: sampleMovie._id,
        screen: sampleScreen._id,
        theatre: sampleTheatre._id,
        city: 'Bengaluru',
        startTime: pvrStart,
        endTime: pvrEnd,
        language: 'English',
        format: 'IMAX',
        pricing: { SILVER: 200, GOLD: 350 },
        status: SHOW_STATUSES.SCHEDULED,
      });

      // Show 2 on INOX (10 total seats, 8 booked -> 2 left = 20% <= 30% -> FILLING_FAST)
      const inoxStart1 = new Date(`${targetDateStr}T14:00:00+05:30`);
      const inoxEnd1 = new Date(inoxStart1.getTime() + 135 * 60 * 1000);
      const inoxShow1 = await Show.create({
        movie: sampleMovie._id,
        screen: secondScreen._id,
        theatre: secondTheatre._id,
        city: 'Bengaluru',
        startTime: inoxStart1,
        endTime: inoxEnd1,
        language: 'Hindi',
        format: '2D',
        pricing: { SILVER: 150 },
        status: SHOW_STATUSES.SCHEDULED,
      });

      // Show 3 on INOX (10 total seats, 10 booked -> 0 left -> SOLD_OUT)
      const inoxStart2 = new Date(`${targetDateStr}T18:00:00+05:30`);
      const inoxEnd2 = new Date(inoxStart2.getTime() + 135 * 60 * 1000);
      const inoxShow2 = await Show.create({
        movie: sampleMovie._id,
        screen: secondScreen._id,
        theatre: secondTheatre._id,
        city: 'Bengaluru',
        startTime: inoxStart2,
        endTime: inoxEnd2,
        language: 'English',
        format: '2D',
        pricing: { SILVER: 180 },
        status: SHOW_STATUSES.SCHEDULED,
      });

      // Populate bookings for Show 2 (8 seats booked)
      const bookingInox1 = await createFakeBooking(inoxShow1, regularUser, 'SHT-INX01');

      const bookedSeatsShow2 = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'].map((seatId) => ({
        show: inoxShow1._id,
        seatId,
        booking: bookingInox1._id,
      }));
      await BookedSeat.insertMany(bookedSeatsShow2);

      // And 1 active hold for Show 2 (expires in 5 minutes) -> total 8 occupied
      await SeatHold.create({
        show: inoxShow1._id,
        seatId: 'A8',
        user: regularUser._id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      // Populate bookings for Show 3 (all 10 seats booked -> SOLD_OUT)
      const bookingInox2 = await createFakeBooking(inoxShow2, regularUser, 'SHT-INX02');

      const bookedSeatsShow3 = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'].map(
        (seatId) => ({
          show: inoxShow2._id,
          seatId,
          booking: bookingInox2._id,
        })
      );
      await BookedSeat.insertMany(bookedSeatsShow3);
    });

    it('returns grouped shows by theatre sorted alphabetically with availability labels', async () => {
      const res = await request(app).get(
        `/api/movies/${sampleMovie._id}/shows?date=${targetDateStr}&city=Bengaluru`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { date, movie, theatres } = res.body.data;
      expect(date).toBe(targetDateStr);
      expect(movie.title).toBe('Inception');
      expect(theatres.length).toBe(2);

      // Alphabetical sorting: "INOX Garuda Mall" should come before "PVR Phoenix Marketcity"
      expect(theatres[0].theatre.name).toBe('INOX Garuda Mall');
      expect(theatres[1].theatre.name).toBe('PVR Phoenix Marketcity');

      // Verify INOX Shows availability
      const inoxShows = theatres[0].shows;
      expect(inoxShows.length).toBe(2);
      expect(inoxShows[0].availability).toBe(SHOW_AVAILABILITY.FILLING_FAST); // 8/10 occupied = 20% left
      expect(inoxShows[1].availability).toBe(SHOW_AVAILABILITY.SOLD_OUT); // 10/10 occupied = 0 left

      // Verify PVR Shows availability
      const pvrShows = theatres[1].shows;
      expect(pvrShows.length).toBe(1);
      expect(pvrShows[0].availability).toBe(SHOW_AVAILABILITY.AVAILABLE); // 0/10 occupied = 100% left
      expect(pvrShows[0].priceFrom).toBe(200);
      expect(pvrShows[0].priceTo).toBe(350);
    });

    it('excludes past shows from today discovery', async () => {
      // Create a past show earlier today
      const todayStr = new Date().toISOString().split('T')[0];
      const pastTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const pastEndTime = new Date(pastTime.getTime() + 135 * 60 * 1000);

      await Show.create({
        movie: sampleMovie._id,
        screen: sampleScreen._id,
        theatre: sampleTheatre._id,
        city: 'Bengaluru',
        startTime: pastTime,
        endTime: pastEndTime,
        language: 'English',
        format: '2D',
        pricing: { SILVER: 200, GOLD: 350 },
        status: SHOW_STATUSES.SCHEDULED,
      });

      const res = await request(app).get(
        `/api/movies/${sampleMovie._id}/shows?date=${todayStr}&city=Bengaluru`
      );

      expect(res.status).toBe(200);
      if (res.body.data.theatres.length > 0) {
        for (const t of res.body.data.theatres) {
          for (const s of t.shows) {
            expect(new Date(s.startTime).getTime()).toBeGreaterThan(Date.now());
          }
        }
      }
    });

    it('returns empty theatres list for a city with no scheduled shows', async () => {
      const res = await request(app).get(
        `/api/movies/${sampleMovie._id}/shows?date=${targetDateStr}&city=Delhi`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.theatres).toEqual([]);
    });
  });

  describe('Show Details Endpoint (GET /api/shows/:id)', () => {
    it('returns populated show details for public consumption', async () => {
      const startTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 135 * 60 * 1000);

      const show = await Show.create({
        movie: sampleMovie._id,
        screen: sampleScreen._id,
        theatre: sampleTheatre._id,
        city: sampleTheatre.city,
        startTime,
        endTime,
        language: 'English',
        format: 'IMAX',
        pricing: { SILVER: 200, GOLD: 350 },
        status: SHOW_STATUSES.SCHEDULED,
      });

      const res = await request(app).get(`/api/shows/${show._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(show._id.toString());
      expect(res.body.data.movie.title).toBe('Inception');
      expect(res.body.data.theatre.name).toBe('PVR Phoenix Marketcity');
      expect(res.body.data.screen.name).toBe('Audi 1');
      expect(res.body.data.screen.layout.rows.length).toBe(2);
    });

    it('returns 404 NOT_FOUND for non-existent show id', async () => {
      const nonExistentId = '66f000000000000000000999';
      const res = await request(app).get(`/api/shows/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });
});
