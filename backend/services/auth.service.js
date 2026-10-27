import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Pre-computed dummy hash to mitigate timing attacks on unknown email login
const DUMMY_HASH = bcrypt.hashSync('dummy_password_timing_attack_mitigation_salt', 10);

export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user._id ? user._id.toString() : user.id,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const register = async ({ name, email, password, phone }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  // Hash password in service with bcrypt (12 rounds)
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone || null,
    isActive: true,
  });

  const token = generateToken(user);
  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    // Constant-time dummy hash compare to prevent username enumeration via timing leaks
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact support.',
      403,
      'ACCOUNT_DISABLED'
    );
  }

  // Update lastLoginAt
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  return { user, token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact support.',
      403,
      'ACCOUNT_DISABLED'
    );
  }

  return user;
};

export default {
  generateToken,
  register,
  login,
  getCurrentUser,
};
