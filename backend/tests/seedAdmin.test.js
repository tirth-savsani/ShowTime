import { seedAdmin } from '../seed/seedAdmin.js';
import { User } from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';

describe('Admin Seeding Script', () => {
  it('seeds admin user idempotently from environment variables', async () => {
    process.env.ADMIN_EMAIL = 'admin.seed.test@showtime.test';
    process.env.ADMIN_PASSWORD = 'AdminSeedPassword@123';

    // First seed creates the admin
    const admin = await seedAdmin();
    expect(admin).toBeDefined();
    expect(admin.email).toBe('admin.seed.test@showtime.test');
    expect(admin.role).toBe(USER_ROLES.ADMIN);

    const dbUser = await User.findOne({ email: 'admin.seed.test@showtime.test' });
    expect(dbUser).not.toBeNull();
    expect(dbUser.role).toBe(USER_ROLES.ADMIN);

    // Second seed runs idempotently without duplicating or throwing
    const existing = await seedAdmin();
    expect(existing.email).toBe('admin.seed.test@showtime.test');
  });
});
