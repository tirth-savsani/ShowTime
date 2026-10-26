import catchAsync from '../utils/catchAsync.js';
import bookingService from '../services/booking.service.js';
import { sendSuccess, sendList } from '../views/response.js';
import {
  formatCheckout,
  formatTicket,
} from '../views/booking.view.js';
import { USER_ROLES } from '../config/constants.js';

export const checkout = catchAsync(async (req, res) => {
  const data = await bookingService.checkout(req.user._id, req.body.showId);
  return sendSuccess(res, 201, 'Checkout initiated successfully', formatCheckout(data));
});

export const verifyPayment = catchAsync(async (req, res) => {
  const ticket = await bookingService.verifyAndConfirm(req.user._id, req.body);
  return sendSuccess(res, 200, 'Booking confirmed successfully', formatTicket(ticket));
});

export const markFailed = catchAsync(async (req, res) => {
  const data = await bookingService.markFailed(
    req.user._id,
    req.params.id,
    req.body?.reason
  );
  return sendSuccess(res, 200, 'Booking marked as failed', data);
});

export const getMyBookings = catchAsync(async (req, res) => {
  const { tab, page, limit } = req.query;
  const result = await bookingService.getMyBookings(req.user._id, { tab, page, limit });
  return sendList(res, 'Bookings fetched successfully', result.items, result.pagination);
});

export const getBookingById = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const ticket = await bookingService.getBookingById(
    req.user._id,
    req.params.id,
    isAdmin
  );
  return sendSuccess(res, 200, 'Booking fetched successfully', formatTicket(ticket));
});

export const cancelBooking = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === USER_ROLES.ADMIN;
  const ticket = await bookingService.cancelBooking(
    req.user._id,
    req.params.id,
    isAdmin,
    req.body?.reason
  );
  return sendSuccess(res, 200, 'Booking cancelled successfully', formatTicket(ticket));
});

export default {
  checkout,
  verifyPayment,
  markFailed,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
