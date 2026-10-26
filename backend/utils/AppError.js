/**
 * AppError class for operational errors with machine-readable error codes (Spec B7)
 */
export class AppError extends Error {
  constructor(message, statusCode, code = 'SERVER_ERROR', errors = null, details = null) {
    let finalMessage = message;
    let finalStatusCode = statusCode;
    let finalCode = code;
    let finalErrors = errors;
    let finalDetails = details;

    // Overload: new AppError(statusCode, code, message, details)
    if (typeof message === 'number') {
      finalStatusCode = message;
      finalCode = typeof statusCode === 'string' ? statusCode : 'SERVER_ERROR';
      finalMessage = typeof code === 'string' ? code : '';
      finalDetails = errors;
      finalErrors = null;
    }

    super(finalMessage);
    this.statusCode = finalStatusCode;
    this.status = `${finalStatusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = finalCode;
    this.errors = finalErrors;
    this.details = finalDetails;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
