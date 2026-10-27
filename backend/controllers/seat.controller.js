import catchAsync from '../utils/catchAsync.js';
import seatService from '../services/seat.service.js';
import { sendSuccess } from '../views/response.js';
import {
  formatSeatMap,
  formatHoldResult,
  formatUserHold,
} from '../views/seat.view.js';

export const getSeatMap = catchAsync(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const data = await seatService.getSeatMap(req.params.id, userId);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Seat map fetched successfully',
    data: formatSeatMap(data),
  });
});

export const holdSeats = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { seatIds } = req.body;
  const data = await seatService.holdSeats(userId, req.params.id, seatIds);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Seats held successfully',
    data: formatHoldResult(data),
  });
});

export const getUserHold = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const data = await seatService.getUserHold(userId, req.params.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'User hold fetched successfully',
    data: formatUserHold(data),
  });
});

export const releaseHold = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const data = await seatService.releaseHold(userId, req.params.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Seats released successfully',
    data,
  });
});

export default {
  getSeatMap,
  holdSeats,
  getUserHold,
  releaseHold,
};
