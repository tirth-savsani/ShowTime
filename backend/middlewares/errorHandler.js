import { sendError } from '../views/response.js';
import { env } from '../config/env.js';

/**
 * Mask email in logs to avoid PII leakage (Spec B8)
 */
const maskEmail = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_\-.]+)/g, (_, user, domain) => {
    const visible = user.slice(0, 2);
    return `${visible}***@${domain}`;
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'SERVER_ERROR';
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;
  let details = err.details || null;

  // 1. Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // 2. Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 3. Mongo Duplicate Key Error (code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    code = field.toLowerCase().includes('email') ? 'EMAIL_EXISTS' : 'DUPLICATE';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // 4. JWT Errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHENTICATED';
    message = err.name === 'TokenExpiredError' ? 'Token has expired. Please log in again.' : 'Invalid token.';
  }

  // 5. Multer Errors
  else if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum size allowed is 5 MB.';
    } else {
      message = err.message || 'Upload error occurred.';
    }
  }

  // 6. Non-operational unexpected server errors
  else if (!err.isOperational) {
    statusCode = 500;
    code = 'SERVER_ERROR';
    if (env.NODE_ENV === 'production') {
      message = 'An unexpected server error occurred.';
    }
  }

  // Safe logging: mask emails, never log credentials
  const loggedMessage = maskEmail(err.message || message);
  if (statusCode >= 500) {
    console.error(`[ERROR 500] ${req.method} ${req.originalUrl}:`, loggedMessage, env.NODE_ENV !== 'production' ? err.stack : '');
  } else {
    console.warn(`[WARN ${statusCode} - ${code}] ${req.method} ${req.originalUrl}:`, loggedMessage);
  }

  return sendError(res, statusCode, message, code, errors, details);
};

export default errorHandler;
