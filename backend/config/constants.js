/**
 * Backend Constants (Spec B1)
 * Must never be duplicated as magic numbers across the codebase.
 */

export const HOLD_MINUTES = 5;
export const CHECKOUT_HOLD_EXTENSION_MINUTES = 3; // hold never exceeds 8 minutes from creation
export const MAX_HOLD_LIFETIME_MINUTES = 8;
export const MAX_SEATS_PER_BOOKING = 6;
export const CANCEL_CUTOFF_HOURS = 2;
export const SHOW_BUFFER_MINUTES = 15;
export const SHOW_ADS_MINUTES = 15;
export const PENDING_BOOKING_EXPIRY_MINUTES = 10;
export const FILLING_FAST_THRESHOLD = 0.30;
export const BOOKING_WINDOW_DAYS_PUBLIC = 7;
export const BOOKING_WINDOW_DAYS_ADMIN = 30;
export const JWT_EXPIRES_IN = '7d';
export const COOKIE_NAME = 'token';
export const DEFAULT_PAGE_LIMIT = 12;
export const MAX_PAGE_LIMIT = 50;
export const BOOKING_REF_PREFIX = 'SHT';
export const TIMEZONE = 'Asia/Kolkata';
export const CURRENCY = 'INR';

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const MOVIE_STATUSES = {
  NOW_SHOWING: 'now_showing',
  COMING_SOON: 'coming_soon',
  ARCHIVED: 'archived',
};

export const SHOW_STATUSES = {
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

export const REFUND_STATUSES = {
  NONE: 'NONE',
  PROCESSED: 'PROCESSED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
};

export const CANCEL_REASONS = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SEATS_LOST: 'SEATS_LOST',
  SHOW_CANCELLED: 'SHOW_CANCELLED',
};

export const SEAT_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  HELD: 'HELD',
  BOOKED: 'BOOKED',
  MINE: 'MINE',
};

export const SHOW_AVAILABILITY = {
  AVAILABLE: 'AVAILABLE',
  FILLING_FAST: 'FILLING_FAST',
  SOLD_OUT: 'SOLD_OUT',
};
