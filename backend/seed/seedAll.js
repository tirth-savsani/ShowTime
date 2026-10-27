/**
 * Comprehensive Database Seeder (Spec B9, Phase 3)
 *
 * Seeds:
 * 1. Demo user: demo@showtime.test / Demo@1234
 * 2. 50 curated movies (38 now_showing, 12 coming_soon) with SVG posters
 * 3. 29 theatres across 10 Indian cities
 * 4. Screens with Layout A (220 seats), Layout B (140 seats), Layout C (80 seats)
 * 5. Rolling shows for the next 7 days at 10:00, 13:30, 17:00, 20:30 IST
 *
 * Rules:
 * - Idempotent: safe to run multiple times.
 * - Refuses to wipe existing collections unless SEED_CONFIRM=true.
 */

import bcrypt from 'bcryptjs';
import { validateEnv } from '../config/env.js';
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
import { ensureRollingShows } from '../services/showScheduler.service.js';

export const seedAll = async () => {
  try {
    validateEnv();
    await connectDB();

    console.log('\n--- Starting ShowTime Phase 3 Seed Process ---');

    // 1. Guard against accidental overwrite in production/development
    const existingMovieCount = await Movie.countDocuments();
    const existingTheatreCount = await Theatre.countDocuments();

    if (existingMovieCount > 0 || existingTheatreCount > 0) {
      if (process.env.SEED_CONFIRM !== 'true') {
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
        User.deleteMany({ email: 'demo@showtime.test' }),
      ]);
      console.log('Seeded collections wiped clean.');
    }

    // 2. Seed Demo User
    console.log('\n1. Seeding Demo User...');
    const demoPasswordHash = await bcrypt.hash('Demo@1234', 10);
    const demoUser = await User.findOneAndUpdate(
      { email: 'demo@showtime.test' },
      {
        name: 'Demo Cinephile',
        email: 'demo@showtime.test',
        passwordHash: demoPasswordHash,
        phone: '9876543210',
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`- Demo user ready: ${demoUser.email} (Password: Demo@1234)`);

    // 3. Seed 50 Movies
    console.log(`\n2. Seeding ${moviesData.length} Movies...`);
    const createdMovies = [];
    for (const mov of moviesData) {
      const doc = await Movie.create(mov);
      createdMovies.push(doc);
    }
    console.log(`- Successfully inserted ${createdMovies.length} movies.`);

    // 4. Seed Theatres and Screens
    console.log(`\n3. Seeding ${theatresData.length} Theatres and Screens across 10 cities...`);
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

    // 5. Seed Shows for the next 7 days using showScheduler service
    console.log('\n4. Seeding Rolling Shows for next 7 days across screens...');
    const schedulerResult = await ensureRollingShows({ daysAhead: 7 });
    console.log(`- Successfully scheduled ${schedulerResult.insertedCount} shows across next 7 days.`);

    console.log('\n--- ShowTime Seed Completed Successfully! ---');

    if (process.env.NODE_ENV !== 'test') {
      await disconnectDB();
    }

    return {
      success: true,
      users: 1,
      movies: createdMovies.length,
      theatres: createdTheatres.length,
      screens: createdScreens.length,
      shows: schedulerResult.insertedCount,
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
  seedAll();
}

export default seedAll;
