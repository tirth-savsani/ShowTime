import request from 'supertest';
import app from '../app.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import BookedSeat from '../models/BookedSeat.js';
import SeatHold from '../models/SeatHold.js';
import {
  COOKIE_NAME,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  BOOKING_STATUSES,
  SHOW_AVAILABILITY,
} from '../config/constants.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

describe('Show Discovery and Details Module (Spec B3, B4, B6.7, B6.8)', () => {
  let userCookie;
  let regularUser;
  let sampleMovie;
  let sampleTheatre;
  let sampleScreen;

  const createFakeBooking = async (showDoc, userDoc, ref) => {
    return await Booking.create({
      bookingRef: ref,
      user: userDoc._id,
      show: showDoc._id,
      seats: [{ seatId: 'A1', category: 'SILVER', price: 150 }],
      amount: 150,
      currency: 'INR',
      status: BOOKING_STATUSES.CONFIRMED,
      snapshot: {
        movieId: sampleMovie._id,
        movieTitle: sampleMovie.title,
        theatreName: showDoc.theatre?.name || 'Sample Theatre',
        theatreAddress: 'Address',
        city: 'Bengaluru',
        screenName: 'Screen 1',
        certificate: 'UA',
        posterUrl: sampleMovie.posterUrl,
        startTime: showDoc.startTime,
        language: showDoc.language,
        format: showDoc.format,
      },
    });
  };

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('Password@123', 10);
    regularUser = await User.create({
      name: 'Regular User',
      email: `user_${Date.now()}@showtime.test`,
      passwordHash,
      isActive: true,
    });

    const userToken = jwt.sign(
      { sub: regularUser._id.toString() },
      env.JWT_SECRET
    );
    userCookie = `${COOKIE_NAME}=${userToken}`;

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

    sampleTheatre = await Theatre.create({
      name: 'PVR Phoenix Marketcity',
      city: 'Bengaluru',
      address: 'Whitefield Main Road, Mahadevapura',
      amenities: ['Parking', 'Food Court', 'Recliners'],
      isActive: true,
    });

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

  describe('Public Discovery: GET /api/movies/:id/shows', () => {
    let secondTheatre;
    let secondScreen;
    let targetDateStr;

    beforeEach(async () => {
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

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      targetDateStr = `${yyyy}-${mm}-${dd}`;

      // Show 1 on PVR (10 total seats, 0 booked -> AVAILABLE)
      const pvrStart = new Date(`${targetDateStr}T10:00:00+05:30`);
      const pvrEnd = new Date(pvrStart.getTime() + 135 * 60 * 1000);
      await Show.create({
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

      const bookingInox1 = await createFakeBooking(inoxShow1, regularUser, 'SHT-INX01');

      const bookedSeatsShow2 = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'].map((seatId) => ({
        show: inoxShow1._id,
        seatId,
        booking: bookingInox1._id,
      }));
      await BookedSeat.insertMany(bookedSeatsShow2);

      await SeatHold.create({
        show: inoxShow1._id,
        seatId: 'A8',
        user: regularUser._id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

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

      expect(theatres[0].theatre.name).toBe('INOX Garuda Mall');
      expect(theatres[1].theatre.name).toBe('PVR Phoenix Marketcity');

      const inoxShows = theatres[0].shows;
      expect(inoxShows.length).toBe(2);
      expect(inoxShows[0].availability).toBe(SHOW_AVAILABILITY.FILLING_FAST);
      expect(inoxShows[1].availability).toBe(SHOW_AVAILABILITY.SOLD_OUT);

      const pvrShows = theatres[1].shows;
      expect(pvrShows.length).toBe(1);
      expect(pvrShows[0].availability).toBe(SHOW_AVAILABILITY.AVAILABLE);
      expect(pvrShows[0].priceFrom).toBe(200);
      expect(pvrShows[0].priceTo).toBe(350);
    });

    it('excludes past shows from today discovery', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const pastTime = new Date(Date.now() - 60 * 60 * 1000);
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
