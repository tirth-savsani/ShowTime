import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { User } from '../models/User.js';
import { SeatHold } from '../models/SeatHold.js';
import { BookedSeat } from '../models/BookedSeat.js';
import {
  COOKIE_NAME,
  USER_ROLES,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  SEAT_STATUSES,
} from '../config/constants.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Seat Map and Concurrency-Safe Atomic Seat Hold Engine (Spec B3, B4, B6.2, B6.3)', () => {
  let sampleMovie;
  let sampleTheatre;
  let sampleScreen;
  let sampleShow;
  let primaryUser;
  let primaryUserCookie;

  beforeEach(async () => {
    // 1. Create Movie
    sampleMovie = await Movie.create({
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space.',
      genres: ['Sci-Fi', 'Adventure'],
      languages: ['English', 'Hindi'],
      formats: ['2D', 'IMAX'],
      durationMin: 169,
      releaseDate: new Date('2026-11-07'),
      certificate: 'UA',
      posterUrl: 'https://res.cloudinary.com/showtime/image/upload/v1/mock.jpg',
      posterPublicId: 'showtime/movies/mock',
      status: MOVIE_STATUSES.NOW_SHOWING,
    });

    // 2. Create Theatre
    sampleTheatre = await Theatre.create({
      name: 'PVR Forum Mall',
      city: 'Bengaluru',
      address: 'Koramangala, Hosur Road',
      amenities: ['Parking', 'Food Court'],
      isActive: true,
    });

    // 3. Create Screen (Rows A: 10 seats, B: 10 seats)
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

    // 4. Create Show (starts 3 days in the future)
    const startTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + (169 + 15) * 60 * 1000);
    sampleShow = await Show.create({
      movie: sampleMovie._id,
      screen: sampleScreen._id,
      theatre: sampleTheatre._id,
      city: 'Bengaluru',
      startTime,
      endTime,
      language: 'English',
      format: 'IMAX',
      pricing: { SILVER: 200, GOLD: 350 },
      status: SHOW_STATUSES.SCHEDULED,
    });

    // 5. Create Primary User
    const passwordHash = await bcrypt.hash('Password@123', 10);
    primaryUser = await User.create({
      name: 'Primary Test User',
      email: 'primary.hold@showtime.test',
      passwordHash,
      role: USER_ROLES.USER,
      isActive: true,
    });
    const token = jwt.sign(
      { sub: primaryUser._id.toString(), role: primaryUser.role },
      env.JWT_SECRET
    );
    primaryUserCookie = `${COOKIE_NAME}=${token}`;
  });

  describe('Parallel Concurrency Test: 20 simultaneous users for the same seat', () => {
    it('asserts exactly one user succeeds and 19 fail with 409 SEATS_UNAVAILABLE', async () => {
      const NUM_USERS = 20;
      const targetSeatId = 'A1';

      // Create 20 unique users with tokens
      const passwordHash = await bcrypt.hash('Password@123', 10);
      const userCookies = [];

      for (let i = 0; i < NUM_USERS; i++) {
        const u = await User.create({
          name: `Concurrent User ${i}`,
          email: `concurrent.user.${i}.${Date.now()}@showtime.test`,
          passwordHash,
          role: USER_ROLES.USER,
          isActive: true,
        });
        const token = jwt.sign({ sub: u._id.toString(), role: u.role }, env.JWT_SECRET);
        userCookies.push(`${COOKIE_NAME}=${token}`);
      }

      // Fire 20 parallel hold requests for the exact same seat 'A1'
      const holdPromises = userCookies.map((cookie) =>
        request(app)
          .post(`/api/shows/${sampleShow._id}/hold`)
          .set('Cookie', cookie)
          .send({ seatIds: [targetSeatId] })
      );

      const responses = await Promise.all(holdPromises);

      const successfulResponses = responses.filter((r) => r.status === 201);
      const failedResponses = responses.filter((r) => r.status === 409);

      // Verify exactly ONE succeeds and 19 fail
      expect(successfulResponses.length).toBe(1);
      expect(failedResponses.length).toBe(NUM_USERS - 1);

      // Verify success payload
      const winner = successfulResponses[0];
      expect(winner.body.success).toBe(true);
      expect(winner.body.data.seatIds).toEqual([targetSeatId]);
      expect(winner.body.data.amount).toBe(200); // SILVER price
      expect(new Date(winner.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());

      // Verify failure payload
      for (const fail of failedResponses) {
        expect(fail.body.success).toBe(false);
        expect(fail.body.code).toBe('SEATS_UNAVAILABLE');
        expect(fail.body.details?.unavailableSeatIds).toContain(targetSeatId);
      }

      // Verify database state: exactly ONE hold document exists for A1
      const totalHolds = await SeatHold.countDocuments({
        show: sampleShow._id,
        seatId: targetSeatId,
      });
      expect(totalHolds).toBe(1);
    }, 20000);
  });

  describe('All-or-Nothing Atomic Rollback', () => {
    it('rolls back partial inserts if one seat in the selection is unavailable', async () => {
      // User 1 holds A1
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie)
        .send({ seatIds: ['A1'] });

      // Create User 2
      const passwordHash = await bcrypt.hash('Password@123', 10);
      const user2 = await User.create({
        name: 'User Two',
        email: 'user2.rollback@showtime.test',
        passwordHash,
        role: USER_ROLES.USER,
        isActive: true,
      });
      const token2 = jwt.sign({ sub: user2._id.toString(), role: user2.role }, env.JWT_SECRET);
      const user2Cookie = `${COOKIE_NAME}=${token2}`;

      // User 2 attempts to hold A1 (taken) and A2 (available)
      const res = await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', user2Cookie)
        .send({ seatIds: ['A1', 'A2'] });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('SEATS_UNAVAILABLE');
      expect(res.body.details?.unavailableSeatIds).toContain('A1');

      // Crucial test: User 2 must have ZERO holds in database (A2 was rolled back)
      const user2Holds = await SeatHold.find({ show: sampleShow._id, user: user2._id });
      expect(user2Holds.length).toBe(0);

      // A2 must remain AVAILABLE on seat map
      const seatMapRes = await request(app).get(`/api/shows/${sampleShow._id}/seats`);
      const a2Seat = seatMapRes.body.data.seats.find((s) => s.id === 'A2');
      expect(a2Seat.status).toBe(SEAT_STATUSES.AVAILABLE);
    });
  });

  describe('Expired Hold Lifecycle and Availability', () => {
    it('makes seat AVAILABLE again when hold expires and allows another user to hold it', async () => {
      // Manually insert an expired hold for A1 (expired 30 seconds ago)
      await SeatHold.create({
        show: sampleShow._id,
        seatId: 'A1',
        user: primaryUser._id,
        expiresAt: new Date(Date.now() - 30 * 1000),
      });

      // 1. Seat map must show A1 as AVAILABLE (filter expiresAt > now)
      const seatMapRes = await request(app).get(`/api/shows/${sampleShow._id}/seats`);
      expect(seatMapRes.status).toBe(200);

      const a1Seat = seatMapRes.body.data.seats.find((s) => s.id === 'A1');
      expect(a1Seat.status).toBe(SEAT_STATUSES.AVAILABLE);
      expect(seatMapRes.body.data.counts.available).toBe(20);

      // 2. Another user can immediately hold A1 (purging the expired hold)
      const passwordHash = await bcrypt.hash('Password@123', 10);
      const newUser = await User.create({
        name: 'New User',
        email: 'newuser.expire@showtime.test',
        passwordHash,
        role: USER_ROLES.USER,
        isActive: true,
      });
      const token = jwt.sign({ sub: newUser._id.toString(), role: newUser.role }, env.JWT_SECRET);
      const newUserCookie = `${COOKIE_NAME}=${token}`;

      const holdRes = await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', newUserCookie)
        .send({ seatIds: ['A1'] });

      expect(holdRes.status).toBe(201);
      expect(holdRes.body.data.seatIds).toEqual(['A1']);

      // Exactly 1 valid hold exists in DB now (held by newUser)
      const activeHolds = await SeatHold.find({ show: sampleShow._id, seatId: 'A1' });
      expect(activeHolds.length).toBe(1);
      expect(activeHolds[0].user.toString()).toBe(newUser._id.toString());
    });
  });

  describe('User Hold Replacement and Release', () => {
    it('replaces user existing hold when holding new seats', async () => {
      // 1. User holds A1, A2
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie)
        .send({ seatIds: ['A1', 'A2'] });

      let holds = await SeatHold.find({ show: sampleShow._id, user: primaryUser._id });
      expect(holds.length).toBe(2);

      // 2. Same user holds B1, B2 -> A1, A2 should be freed
      const res = await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie)
        .send({ seatIds: ['B1', 'B2'] });

      expect(res.status).toBe(201);
      expect(res.body.data.seatIds).toEqual(['B1', 'B2']);

      // Check database: only B1, B2 are held
      holds = await SeatHold.find({ show: sampleShow._id, user: primaryUser._id });
      expect(holds.length).toBe(2);
      const heldSeatIds = holds.map((h) => h.seatId).sort();
      expect(heldSeatIds).toEqual(['B1', 'B2']);

      // A1 and A2 are back to AVAILABLE
      const seatMapRes = await request(app).get(`/api/shows/${sampleShow._id}/seats`);
      const a1 = seatMapRes.body.data.seats.find((s) => s.id === 'A1');
      const a2 = seatMapRes.body.data.seats.find((s) => s.id === 'A2');
      expect(a1.status).toBe(SEAT_STATUSES.AVAILABLE);
      expect(a2.status).toBe(SEAT_STATUSES.AVAILABLE);
    });

    it('releases user hold via DELETE /api/shows/:id/hold', async () => {
      // Hold A1
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie)
        .send({ seatIds: ['A1'] });

      // Release
      const delRes = await request(app)
        .delete(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.released).toBe(true);

      const remainingHolds = await SeatHold.countDocuments({
        show: sampleShow._id,
        user: primaryUser._id,
      });
      expect(remainingHolds).toBe(0);
    });
  });

  describe('Seat Map Status: MINE vs HELD vs BOOKED vs AVAILABLE', () => {
    it('shows MINE for caller, HELD for other users and guests, and BOOKED for booked seats', async () => {
      // 1. Primary user holds A1
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie)
        .send({ seatIds: ['A1'] });

      // 2. Another user books A2
      const passwordHash = await bcrypt.hash('Password@123', 10);
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other.seatmap@showtime.test',
        passwordHash,
        role: USER_ROLES.USER,
        isActive: true,
      });
      const otherToken = jwt.sign(
        { sub: otherUser._id.toString(), role: otherUser.role },
        env.JWT_SECRET
      );
      const otherCookie = `${COOKIE_NAME}=${otherToken}`;

      await BookedSeat.create({
        show: sampleShow._id,
        seatId: 'A2',
        booking: new User()._id, // dummy objectId
      });

      // 3. Primary User checks seat map: A1 is MINE, A2 is BOOKED, A3 is AVAILABLE
      const mySeatMap = await request(app)
        .get(`/api/shows/${sampleShow._id}/seats`)
        .set('Cookie', primaryUserCookie);

      expect(mySeatMap.status).toBe(200);
      const myA1 = mySeatMap.body.data.seats.find((s) => s.id === 'A1');
      const myA2 = mySeatMap.body.data.seats.find((s) => s.id === 'A2');
      const myA3 = mySeatMap.body.data.seats.find((s) => s.id === 'A3');

      expect(myA1.status).toBe(SEAT_STATUSES.MINE);
      expect(myA2.status).toBe(SEAT_STATUSES.BOOKED);
      expect(myA3.status).toBe(SEAT_STATUSES.AVAILABLE);

      // 4. Other User checks seat map: A1 is HELD, A2 is BOOKED
      const otherSeatMap = await request(app)
        .get(`/api/shows/${sampleShow._id}/seats`)
        .set('Cookie', otherCookie);

      const otherA1 = otherSeatMap.body.data.seats.find((s) => s.id === 'A1');
      expect(otherA1.status).toBe(SEAT_STATUSES.HELD);

      // 5. Unauthenticated guest checks seat map: A1 is HELD, A2 is BOOKED
      const guestSeatMap = await request(app).get(`/api/shows/${sampleShow._id}/seats`);

      const guestA1 = guestSeatMap.body.data.seats.find((s) => s.id === 'A1');
      expect(guestA1.status).toBe(SEAT_STATUSES.HELD);
    });

    it('retrieves active user hold via GET /api/shows/:id/hold', async () => {
      // 1. Before holding: hold is null
      const initialRes = await request(app)
        .get(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie);

      expect(initialRes.status).toBe(200);
      expect(initialRes.body.data.hold).toBeNull();

      // 2. Hold A1 and B1 (SILVER 200 + GOLD 350 = 550)
      await request(app)
        .post(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie)
        .send({ seatIds: ['A1', 'B1'] });

      // 3. After holding: returns seatIds, expiresAt, and amount
      const afterRes = await request(app)
        .get(`/api/shows/${sampleShow._id}/hold`)
        .set('Cookie', primaryUserCookie);

      expect(afterRes.status).toBe(200);
      expect(afterRes.body.data.hold).not.toBeNull();
      expect(afterRes.body.data.hold.seatIds.sort()).toEqual(['A1', 'B1']);
      expect(afterRes.body.data.hold.amount).toBe(550);
    });
  });
});
