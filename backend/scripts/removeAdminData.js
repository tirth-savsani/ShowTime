/**
 * Migration Script: Remove Admin Data (Phase 2)
 *
 * Removes all admin accounts and unsets legacy role fields from all user records.
 * ShowTime v2 has NO admin side.
 */

import mongoose from 'mongoose';
import { validateEnv, env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';

const removeAdminData = async () => {
  try {
    validateEnv();
    await connectDB();

    console.log('\n--- Starting Admin Data Clean-up (Phase 2) ---');

    // 1. Delete users with admin email or role='admin'
    const deleteResult = await User.collection.deleteMany({
      $or: [
        { role: 'admin' },
        { email: /admin@/i },
      ],
    });
    console.log(`- Deleted ${deleteResult.deletedCount} administrative user records.`);

    // 2. Unset role field on all remaining users
    const unsetResult = await User.collection.updateMany(
      {},
      { $unset: { role: '' } }
    );
    console.log(`- Stripped 'role' field from ${unsetResult.modifiedCount} user records.`);

    console.log('--- Admin Data Clean-up Completed Successfully ---\n');
  } catch (err) {
    console.error('Error removing admin data:', err.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

removeAdminData();
