/**
 * Comprehensive Database Seeder (Spec B9)
 *
 * Seeds:
 * 1. Admin user from ADMIN_EMAIL & ADMIN_PASSWORD env vars
 * 2. Demo user: demo@showtime.test / Demo@1234
 * 3. 10 realistic movies (7 now_showing, 3 coming_soon)
 * 4. 4 theatres across 3 cities (Bengaluru, Mumbai, Delhi NCR)
 * 5. 2 screens each (Audi 1: 164 seats, Audi 2: 76 seats) with computed totalSeats
 * 6. Shows for the next 7 days at 10:00, 13:30, 17:00, 20:30 IST across screens
 *
 * Rules:
 * - Idempotent: safe to run multiple times without corrupting state.
 * - Refuses to wipe existing collections unless SEED_CONFIRM=true.
 */

import bcrypt from 'bcryptjs';
import { validateEnv, env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { SeatHold } from '../models/SeatHold.js';
import { BookedSeat } from '../models/BookedSeat.js';
import { Booking } from '../models/Booking.js';
import { moviesData } from './data/movies.js';
import { theatresData } from './data/theatres.js';
import {
  USER_ROLES,
  MOVIE_STATUSES,
  SHOW_STATUSES,
  SHOW_ADS_MINUTES,
} from '../config/constants.js';

// IST daily show time slots (in IST hours and minutes)
const SHOW_SLOTS_IST = [
  { hour: 10, minute: 0 },
  { hour: 13, minute: 30 },
  { hour: 17, minute: 0 },
  { hour: 20, minute: 30 },
];

/**
 * Converts a calendar date and IST hour:minute into a UTC Date object.
 * IST = UTC + 5:30 -> UTC = IST - 5:30
 */
const createISTDate = (baseDate, istHour, istMinute) => {
  const d = new Date(baseDate);
  // Set to midnight UTC
  d.setUTCHours(0, 0, 0, 0);
  // Add IST time and subtract 5.5 hours to get UTC
  const istOffsetMs = (istHour * 60 + istMinute - 330) * 60 * 1000;
  return new Date(d.getTime() + istOffsetMs);
};

export const seedAll = async () => {
  try {
    console.log('--- Starting ShowTime Seed Process (Spec B9) ---');
    await connectDB();

    const shouldWipe = process.env.SEED_CONFIRM === 'true';

    // 1. Check existing data
    const existingMovieCount = await Movie.countDocuments();
    const existingTheatreCount = await Theatre.countDocuments();

    if (existingMovieCount > 0 || existingTheatreCount > 0) {
      if (!shouldWipe) {
        console.log(
          `Database already contains data (${existingMovieCount} movies, ${existingTheatreCount} theatres).`
        );
        console.log(
          'To clean and re-seed all collections, re-run with: SEED_CONFIRM=true node seed/seedAll.js'
        );
        if (process.env.NODE_ENV !== 'test') {
          await disconnectDB();
        }
        return { skipped: true };
      }

      console.log('SEED_CONFIRM=true detected: wiping collections before seeding...');
      await Promise.all([
        SeatHold.deleteMany({}),
        BookedSeat.deleteMany({}),
        Booking.deleteMany({}),
        Show.deleteMany({}),
        Screen.deleteMany({}),
        Theatre.deleteMany({}),
        Movie.deleteMany({}),
        User.deleteMany({ email: { $in: [env.ADMIN_EMAIL?.toLowerCase(), 'demo@showtime.test'] } }),
      ]);
      console.log('Seeded collections wiped clean.');
    }

    // 2. Seed Users: Admin and Demo User
    console.log('\n1. Seeding Users...');
    const adminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || 'admin@showtime.test').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || 'Admin@1234';
    const adminHash = await bcrypt.hash(adminPassword, 10);

    const adminUser = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'ShowTime Administrator',
        email: adminEmail,
        passwordHash: adminHash,
        role: USER_ROLES.ADMIN,
        isActive: true,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    console.log(`- Admin user ready: ${adminUser.email}`);

    const demoPasswordHash = await bcrypt.hash('Demo@1234', 10);
    const demoUser = await User.findOneAndUpdate(
      { email: 'demo@showtime.test' },
      {
        name: 'ShowTime Demo User',
        email: 'demo@showtime.test',
        passwordHash: demoPasswordHash,
        role: USER_ROLES.USER,
        phone: '9876543210',
        isActive: true,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    console.log(`- Demo user ready: ${demoUser.email} (Password: Demo@1234)`);

    // 3. Seed Movies
    console.log('\n2. Seeding 10 Movies...');
    const createdMovies = [];
    for (const mov of moviesData) {
      const doc = await Movie.create(mov);
      createdMovies.push(doc);
    }
    console.log(`- Successfully inserted ${createdMovies.length} movies.`);

    // Filter now_showing movies for show scheduling
    const nowShowingMovies = createdMovies.filter(
      (m) => m.status === MOVIE_STATUSES.NOW_SHOWING
    );

    // 4. Seed Theatres and Screens
    console.log('\n3. Seeding Theatres and Screens...');
    const createdTheatres = [];
    const createdScreens = [];

    for (const tData of theatresData) {
      const theatre = await Theatre.create({
        name: tData.name,
        city: tData.city,
        address: tData.address,
        amenities: tData.amenities,
        isActive: true,
      });
      createdTheatres.push(theatre);

      for (const sData of tData.screens) {
        const totalSeats = sData.layout.rows.reduce((sum, r) => sum + r.seatCount, 0);
        const screen = await Screen.create({
          theatre: theatre._id,
          name: sData.name,
          layout: sData.layout,
          totalSeats,
          isActive: true,
        });
        createdScreens.push(screen);
      }
    }
    console.log(
      `- Inserted ${createdTheatres.length} theatres and ${createdScreens.length} screens.`
    );

    // 5. Seed Shows for the next 7 days
    console.log('\n4. Seeding Shows for next 7 days across screens...');
    const showsToInsert = [];
    const now = new Date();
    let movieRotationIndex = 0;

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const baseDate = new Date(now);
      baseDate.setDate(baseDate.getDate() + dayOffset);

      for (const screen of createdScreens) {
        const theatre = createdTheatres.find((t) => t._id.equals(screen.theatre));
        const isLayoutA = screen.name === 'Audi 1';

        for (const slot of SHOW_SLOTS_IST) {
          const startTime = createISTDate(baseDate, slot.hour, slot.minute);

          // Pick rotating now_showing movie
          const movie = nowShowingMovies[movieRotationIndex % nowShowingMovies.length];
          movieRotationIndex++;

          // Select format supported by screen & movie
          const format = movie.formats.includes('IMAX') && isLayoutA
            ? 'IMAX'
            : movie.formats[0];
          const language = movie.languages[0];

          // Compute endTime: startTime + duration + buffer (Spec B3, B6.7)
          const endTime = new Date(
            startTime.getTime() + (movie.durationMin + SHOW_ADS_MINUTES) * 60 * 1000
          );

          // Pricing map per layout categories (Spec B9: SILVER 150, GOLD 250, PLATINUM 350; IMAX +100)
          const imaxPremium = format === 'IMAX' ? 100 : 0;
          const pricing = isLayoutA
            ? {
                PLATINUM: 350 + imaxPremium,
                GOLD: 250 + imaxPremium,
                SILVER: 150 + imaxPremium,
              }
            : {
                PLATINUM: 350 + imaxPremium,
                GOLD: 250 + imaxPremium,
              };

          showsToInsert.push({
            movie: movie._id,
            theatre: theatre._id,
            screen: screen._id,
            city: theatre.city,
            startTime,
            endTime,
            language,
            format,
            pricing,
            status: SHOW_STATUSES.SCHEDULED,
          });
        }
      }
    }

    const insertedShows = await Show.insertMany(showsToInsert);
    console.log(`- Successfully inserted ${insertedShows.length} scheduled shows.`);

    console.log('\n--- ShowTime Seed Completed Successfully! ---');

    if (process.env.NODE_ENV !== 'test') {
      await disconnectDB();
    }

    return {
      success: true,
      users: 2,
      movies: createdMovies.length,
      theatres: createdTheatres.length,
      screens: createdScreens.length,
      shows: insertedShows.length,
    };
  } catch (error) {
    console.error('Seed process failed:', error);
    if (process.env.NODE_ENV !== 'test') {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
};

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedAll.js')) {
  validateEnv();
  seedAll().then(() => process.exit(0));
}

export default seedAll;
