import rateLimit from 'express-rate-limit';
import { sendError } from '../views/response.js';

const rateLimitHandler = (req, res, next, options) => {
  return sendError(
    res,
    429,
    options.message || 'Too many requests. Please try again later.',
    'RATE_LIMITED'
  );
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  handler: rateLimitHandler,
  skip: (req) => process.env.NODE_ENV === 'test',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login/registration attempts. Please try again after 15 minutes.',
  handler: rateLimitHandler,
  skip: (req) => process.env.NODE_ENV === 'test',
});

export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many checkout or verification requests. Please try again later.',
  handler: rateLimitHandler,
  skip: (req) => process.env.NODE_ENV === 'test',
});
