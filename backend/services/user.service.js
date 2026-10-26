/**
 * User Service (Spec B4 - Admin users)
 * Handles admin user listing and status management.
 */

import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { paginate } from '../utils/pagination.js';
import { DEFAULT_PAGE_LIMIT } from '../config/constants.js';

/**
 * List users with optional search and pagination (Spec B4 admin users).
 * @param {{ search?: string, page?: number, limit?: number }} opts
 */
export const listUsers = async ({ search, page = 1, limit = DEFAULT_PAGE_LIMIT } = {}) => {
  const filter = {};

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select('-passwordHash -__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return { users, pagination: paginate(page, limit, total) };
};

/**
 * Activate or deactivate a user (Spec B4 admin users).
 * Admin cannot deactivate themselves.
 * @param {string} adminId    - ID of the admin performing the action
 * @param {string} userId     - ID of the target user
 * @param {boolean} isActive  - desired state
 */
export const updateUserStatus = async (adminId, userId, isActive) => {
  // Admin cannot deactivate themselves (Spec B4)
  if (adminId.toString() === userId.toString()) {
    throw new AppError(
      'Admin cannot deactivate their own account.',
      400,
      'CANNOT_DEACTIVATE_SELF'
    );
  }

  const user = await User.findById(userId).select('-passwordHash -__v');
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  user.isActive = isActive;
  await user.save();

  return user.toObject();
};

export default { listUsers, updateUserStatus };
