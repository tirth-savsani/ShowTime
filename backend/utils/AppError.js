/**
 * AppError class for operational errors with machine-readable error codes (Spec B7)
 */
export class AppError extends Error {
  constructor(message, statusCode, code = 'SERVER_ERROR', errors = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.errors = errors;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
