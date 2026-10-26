import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { COOKIE_NAME } from '../config/constants.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Read token from httpOnly cookie
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }
    // Fallback: Authorization header Bearer token
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please log in.', 401, 'UNAUTHENTICATED')
      );
    }

    // 2. Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return next(
        new AppError('Invalid or expired authentication token.', 401, 'UNAUTHENTICATED')
      );
    }

    // 3. Re-load user from database on every request (Spec B8)
    const user = await User.findById(decoded.sub);
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401, 'UNAUTHENTICATED')
      );
    }

    // 4. Reject inactive users immediately (Spec B8)
    if (!user.isActive) {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DISABLED')
      );
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
