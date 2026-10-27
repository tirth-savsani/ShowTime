import catchAsync from '../utils/catchAsync.js';
import bookingService from '../services/booking.service.js';
import { sendSuccess, sendList } from '../views/response.js';
import {
  formatCheckout,
  formatTicket,
} from '../views/booking.view.js';

export const checkout = catchAsync(async (req, res) => {
  const data = await bookingService.checkout(req.user._id, req.body.showId);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Checkout initiated successfully',
    data: formatCheckout(data),
  });
});

export const verifyPayment = catchAsync(async (req, res) => {
  const ticket = await bookingService.verifyAndConfirm(req.user._id, req.body);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Booking confirmed successfully',
    data: formatTicket(ticket),
  });
});

export const markFailed = catchAsync(async (req, res) => {
  const data = await bookingService.markFailed(
    req.user._id,
    req.params.id,
    req.body?.reason
  );
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Booking marked as failed',
    data,
  });
});

export const getMyBookings = catchAsync(async (req, res) => {
  const { tab, page, limit } = req.query;
  const result = await bookingService.getMyBookings(req.user._id, { tab, page, limit });
  return sendList(res, {
    statusCode: 200,
    message: 'Bookings fetched successfully',
    items: result.items,
    pagination: result.pagination,
  });
});

export const getBookingById = catchAsync(async (req, res) => {
  const ticket = await bookingService.getBookingById(
    req.user._id,
    req.params.id
  );
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Booking fetched successfully',
    data: formatTicket(ticket),
  });
});

export const cancelBooking = catchAsync(async (req, res) => {
  const ticket = await bookingService.cancelBooking(
    req.user._id,
    req.params.id,
    req.body?.reason
  );
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Booking cancelled successfully',
    data: formatTicket(ticket),
  });
});

export default {
  checkout,
  verifyPayment,
  markFailed,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
