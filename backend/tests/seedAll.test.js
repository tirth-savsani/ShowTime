/**
 * SeedAll Integration Tests (Spec B9)
 *
 * Verifies:
 * 1. seedAll creates admin, demo user, 10 movies, 4 theatres, 8 screens, and scheduled shows
 * 2. Idempotency: second call without SEED_CONFIRM=true safely skips
 * 3. Safe re-seed: call with SEED_CONFIRM=true wipes and re-seeds cleanly
 */

import { seedAll } from '../seed/seedAll.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { USER_ROLES } from '../config/constants.js';

describe('Comprehensive Seeder (seedAll.js)', () => {
  beforeEach(async () => {
    delete process.env.SEED_CONFIRM;
  });

  it('seeds complete catalogue, users, screens, and shows successfully', async () => {
    process.env.ADMIN_EMAIL = 'admin.seedall@showtime.test';
    process.env.ADMIN_PASSWORD = 'AdminSeedPassword@123';

    const result = await seedAll();

    expect(result.success).toBe(true);
    expect(result.users).toBe(2);
    expect(result.movies).toBe(10);
    expect(result.theatres).toBe(4);
    expect(result.screens).toBe(8);
    expect(result.shows).toBeGreaterThan(0);

    // Verify Admin & Demo User
    const admin = await User.findOne({ email: 'admin.seedall@showtime.test' });
    expect(admin).not.toBeNull();
    expect(admin.role).toBe(USER_ROLES.ADMIN);

    const demo = await User.findOne({ email: 'demo@showtime.test' });
    expect(demo).not.toBeNull();
    expect(demo.role).toBe(USER_ROLES.USER);

    // Verify Theatres & Screens
    const theatres = await Theatre.find();
    expect(theatres.length).toBe(4);

    const screens = await Screen.find();
    expect(screens.length).toBe(8);

    // Verify Layout A (Audi 1) totalSeats = 164 and Layout B (Audi 2) totalSeats = 76
    const audi1 = screens.find((s) => s.name === 'Audi 1');
    expect(audi1.totalSeats).toBe(164);

    const audi2 = screens.find((s) => s.name === 'Audi 2');
    expect(audi2.totalSeats).toBe(76);

    // Verify Shows
    const showCount = await Show.countDocuments();
    expect(showCount).toBe(8 * 4 * 7); // 8 screens * 4 slots * 7 days = 224 shows
  }, 30000);

  it('is idempotent and skips re-seeding when data already exists and SEED_CONFIRM is not set', async () => {
    // Seed first time
    await seedAll();

    // Second call without SEED_CONFIRM should skip
    const secondRun = await seedAll();
    expect(secondRun.skipped).toBe(true);

    const movieCount = await Movie.countDocuments();
    expect(movieCount).toBe(10);
  }, 30000);

  it('wipes and re-seeds when SEED_CONFIRM=true', async () => {
    process.env.SEED_CONFIRM = 'true';

    const wipeRun = await seedAll();
    expect(wipeRun.success).toBe(true);
    expect(wipeRun.movies).toBe(10);

    const movieCount = await Movie.countDocuments();
    expect(movieCount).toBe(10);
  }, 30000);
});
