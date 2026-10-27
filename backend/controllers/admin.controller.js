/**
 * Admin Controller (Spec B4, B6.11)
 * Thin controller: delegates all business logic to services.
 * Handles: stats, admin bookings list/cancel, users list/status.
 */

import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as reportService from '../services/report.service.js';
import * as bookingService from '../services/booking.service.js';
import * as userService from '../services/user.service.js';
import { serializeStats } from '../views/report.view.js';
import { serializeUser } from '../views/user.view.js';
import { CANCEL_REASONS } from '../config/constants.js';

// ----------------------------------------------------------------
// Stats
// ----------------------------------------------------------------

/**
 * GET /api/admin/stats
 * Returns dashboard stats (totals, perDay, topMovies, upcomingOccupancy, activeShows).
 */
export const getStats = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 14;
  const stats = await reportService.getStats(days);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Dashboard stats retrieved.',
    data: serializeStats(stats),
  });
});

// ----------------------------------------------------------------
// Admin Bookings
// ----------------------------------------------------------------

/**
 * GET /api/admin/bookings
 * Lists all bookings with optional filters and pagination.
 */
export const listAdminBookings = catchAsync(async (req, res) => {
  const { movie, status, email, dateFrom, dateTo, page, limit } = req.query;

  const result = await bookingService.listAdminBookings({
    movie,
    status,
    email,
    dateFrom,
    dateTo,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 12,
  });

  return sendList(res, {
    statusCode: 200,
    message: 'Bookings retrieved.',
    items: result.bookings,
    pagination: result.pagination,
  });
});

/**
 * PATCH /api/admin/bookings/:id/cancel
 * Admin cancel of any confirmed booking (issues refund).
 */
export const cancelAdminBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await bookingService.cancelBooking(
    req.user._id,
    id,
    true,             // isAdmin
    CANCEL_REASONS.ADMIN
  );
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Booking cancelled by admin.',
    data: ticket,
  });
});

// ----------------------------------------------------------------
// Admin Users
// ----------------------------------------------------------------

/**
 * GET /api/admin/users
 * Lists users with optional search and pagination.
 */
export const listUsers = catchAsync(async (req, res) => {
  const { search, page, limit } = req.query;

  const result = await userService.listUsers({
    search,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 12,
  });

  const serialized = result.users.map(serializeUser);
  return sendList(res, {
    statusCode: 200,
    message: 'Users retrieved.',
    items: serialized,
    pagination: result.pagination,
  });
});

/**
 * PATCH /api/admin/users/:id/status
 * Activate or deactivate a user. Admin cannot deactivate themselves.
 */
export const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await userService.updateUserStatus(req.user._id, id, isActive);
  return sendSuccess(res, {
    statusCode: 200,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
    data: serializeUser(user),
  });
});

export default {
  getStats,
  listAdminBookings,
  cancelAdminBooking,
  listUsers,
  updateUserStatus,
};
