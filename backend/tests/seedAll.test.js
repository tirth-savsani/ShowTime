/**
 * SeedAll Integration Tests (Spec B9, Phase 3)
 *
 * Verifies:
 * 1. seedAll creates demo user, 50 movies, 29 theatres, screens, and scheduled shows
 * 2. Idempotency: second call without SEED_CONFIRM=true safely skips
 * 3. Safe re-seed: call with SEED_CONFIRM=true wipes and re-seeds cleanly
 */

import { seedAll } from '../seed/seedAll.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';

describe('Comprehensive Seeder (seedAll.js)', () => {
  beforeEach(async () => {
    delete process.env.SEED_CONFIRM;
  });

  it('seeds complete catalogue, users, screens, and shows successfully', async () => {
    const result = await seedAll();

    expect(result.success).toBe(true);
    expect(result.users).toBe(1);
    expect(result.movies).toBe(50);
    expect(result.theatres).toBe(29);
    expect(result.screens).toBe(59);
    expect(result.shows).toBeGreaterThan(0);

    // Verify Demo User
    const demo = await User.findOne({ email: 'demo@showtime.test' });
    expect(demo).not.toBeNull();
    expect(demo.email).toBe('demo@showtime.test');

    // Verify Theatres & Screens
    const theatres = await Theatre.find();
    expect(theatres.length).toBe(29);

    const screens = await Screen.find();
    expect(screens.length).toBe(59);

    // Verify Layout A totalSeats = 220 and Layout B totalSeats = 140
    const screenWithLayoutA = screens.find((s) => s.layout.rows.length === 12);
    expect(screenWithLayoutA).toBeDefined();
    expect(screenWithLayoutA.totalSeats).toBe(220);

    const screenWithLayoutB = screens.find((s) => s.layout.rows.length === 10);
    expect(screenWithLayoutB).toBeDefined();
    expect(screenWithLayoutB.totalSeats).toBe(140);

    // Verify Shows count is positive
    const showCount = await Show.countDocuments();
    expect(showCount).toBeGreaterThan(50);
  }, 40000);

  it('is idempotent and skips re-seeding when data already exists and SEED_CONFIRM is not set', async () => {
    // Seed first time
    await seedAll();

    // Second call without SEED_CONFIRM should skip
    const secondRun = await seedAll();
    expect(secondRun.skipped).toBe(true);

    const movieCount = await Movie.countDocuments();
    expect(movieCount).toBe(50);
  }, 40000);

  it('wipes and re-seeds when SEED_CONFIRM=true', async () => {
    process.env.SEED_CONFIRM = 'true';

    const wipeRun = await seedAll();
    expect(wipeRun.success).toBe(true);
    expect(wipeRun.movies).toBe(50);

    const movieCount = await Movie.countDocuments();
    expect(movieCount).toBe(50);
  }, 40000);
});
