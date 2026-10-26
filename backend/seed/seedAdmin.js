import bcrypt from 'bcryptjs';
import { env, validateEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { USER_ROLES } from '../config/constants.js';

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed admin.');
      process.exit(1);
    }

    await connectDB();

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin user already exists (${adminEmail}). No changes made.`);
      if (process.env.NODE_ENV !== 'test') {
        await disconnectDB();
      }
      return existingAdmin;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminUser = await User.create({
      name: 'ShowTime Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: USER_ROLES.ADMIN,
      isActive: true,
    });

    console.log(`Admin user successfully seeded: ${adminEmail}`);
    if (process.env.NODE_ENV !== 'test') {
      await disconnectDB();
    }
    return adminUser;
  } catch (error) {
    console.error('Failed to seed admin:', error);
    if (process.env.NODE_ENV !== 'test') {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
};

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedAdmin.js')) {
  validateEnv();
  seedAdmin().then(() => process.exit(0));
}

export default seedAdmin;
