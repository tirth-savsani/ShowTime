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
  return sendSuccess(res, 200, 'Seat map fetched successfully', formatSeatMap(data));
});

export const holdSeats = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { seatIds } = req.body;
  const data = await seatService.holdSeats(userId, req.params.id, seatIds);
  return sendSuccess(res, 201, 'Seats held successfully', formatHoldResult(data));
});

export const getUserHold = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const data = await seatService.getUserHold(userId, req.params.id);
  return sendSuccess(res, 200, 'User hold fetched successfully', formatUserHold(data));
});

export const releaseHold = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const data = await seatService.releaseHold(userId, req.params.id);
  return sendSuccess(res, 200, 'Seats released successfully', data);
});

export default {
  getSeatMap,
  holdSeats,
  getUserHold,
  releaseHold,
};
