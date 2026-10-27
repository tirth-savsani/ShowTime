/**
 * User-Friendly Error Messages Map (Phase 1.2)
 * Users must never see technical jargon, stack traces, Mongo/HTTP codes or raw JSON.
 * Maps every backend error code to one short, human sentence and next action.
 */

export const ERROR_MESSAGES = {
  // Network and transport
  NETWORK_ERROR: "We can't reach ShowTime right now. Check your connection and try again.",
  TIMEOUT: "The request took too long. Please try again in a moment.",

  // Authentication & Authorization
  UNAUTHENTICATED: 'Please sign in to continue.',
  UNAUTHORIZED: 'Please sign in to continue.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  EMAIL_EXISTS: 'An account with this email already exists. Try signing in.',
  ACCOUNT_DISABLED: 'Your account has been deactivated. Please contact support.',
  FORBIDDEN: 'You do not have permission to access this page.',

  // Seat hold & concurrency
  SEATS_UNAVAILABLE: 'Those seats were just taken. Please pick different seats.',
  HOLD_EXPIRED: 'Your seats were released because the timer ran out. Please select seats again.',
  HOLD_NOT_FOUND: 'Your seats were released because the timer ran out. Please select seats again.',
  HOLD_LIMIT_EXCEEDED: 'You can select up to 6 seats at a time.',

  // Show & booking lifecycle
  SHOW_IN_PAST: 'This show has already started. Please choose an upcoming showtime.',
  SHOW_CANCELLED: 'This show is no longer scheduled. Please choose another show.',
  CANCEL_WINDOW_CLOSED: 'This booking can no longer be cancelled because the show starts in under 2 hours.',
  ALREADY_CANCELLED: 'This booking has already been cancelled.',
  BOOKING_EXPIRED: 'Your payment session expired. Please reselect your seats.',
  NOT_FOUND: 'The requested item could not be found.',

  // Payment & verification
  INVALID_SIGNATURE: "We couldn't confirm your payment. If money was deducted it will be refunded automatically.",
  PAYMENT_VERIFICATION_FAILED: "We couldn't confirm your payment. If money was deducted it will be refunded automatically.",
  PAYMENT_FAILED: 'Your payment could not be processed. Please try again or use another payment method.',
  ORDER_CREATION_FAILED: 'Could not initialize payment gateway. Please try again.',
  REFUND_FAILED: 'Refund processing encountered an issue. Our support team is reviewing it.',

  // Validation
  VALIDATION_ERROR: 'Please check your inputs and try again.',
  INVALID_ID: 'The requested link is invalid or outdated.',

  // Catch-all
  SERVER_ERROR: 'Something went wrong on our side. Please try again in a moment.',
  UNKNOWN: 'Something went wrong on our side. Please try again in a moment.',
};

/**
 * Resolves a friendly error message from code, HTTP status, or error situation.
 */
export const getFriendlyErrorMessage = (code, status = 500) => {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (status === 401) {
    return ERROR_MESSAGES.UNAUTHENTICATED;
  }
  if (status === 403) {
    return ERROR_MESSAGES.FORBIDDEN;
  }
  if (status === 404) {
    return ERROR_MESSAGES.NOT_FOUND;
  }
  if (status === 409) {
    return 'This action conflicts with current availability. Please refresh and try again.';
  }
  if (status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  return ERROR_MESSAGES.UNKNOWN;
};

export default {
  ERROR_MESSAGES,
  getFriendlyErrorMessage,
};
