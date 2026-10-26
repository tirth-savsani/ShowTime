import mongoose from 'mongoose';
import { Screen } from '../models/Screen.js';
import { Theatre } from '../models/Theatre.js';
import { calculateTotalSeats } from './seatLayout.service.js';
import { AppError } from '../utils/AppError.js';
import { BOOKING_STATUSES } from '../config/constants.js';

export const listScreens = async ({ theatreId, page = 1, limit = 20 }) => {
  const query = {};
  if (theatreId) {
    query.theatre = theatreId;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Screen.find(query)
      .populate('theatre', 'name city')
      .sort({ theatre: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    Screen.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
};

export const getScreenById = async (id) => {
  const screen = await Screen.findById(id).populate('theatre', 'name city');
  if (!screen) {
    throw new AppError('Screen not found', 404, 'NOT_FOUND');
  }
  return screen;
};

export const createScreen = async ({ theatre: theatreId, name, layout }) => {
  // 1. Verify theatre exists (Spec B4)
  const theatre = await Theatre.findById(theatreId);
  if (!theatre) {
    throw new AppError('Theatre not found', 404, 'NOT_FOUND');
  }

  // 2. Check unique(theatre, name)
  const existing = await Screen.findOne({
    theatre: theatreId,
    name: name.trim(),
  });

  if (existing) {
    throw new AppError(
      `A screen named '${name}' already exists in this theatre.`,
      409,
      'DUPLICATE'
    );
  }

  // 3. Calculate totalSeats
  const totalSeats = calculateTotalSeats(layout);

  const screen = await Screen.create({
    theatre: theatreId,
    name: name.trim(),
    layout,
    totalSeats,
    isActive: true,
  });

  return screen;
};

export const updateScreen = async (id, { theatre: theatreId, name, layout, isActive }) => {
  const screen = await Screen.findById(id);
  if (!screen) {
    throw new AppError('Screen not found', 404, 'NOT_FOUND');
  }

  const targetTheatreId = theatreId || screen.theatre;
  const newName = name ? name.trim() : screen.name;

  // Check unique(theatre, name) if theatre or name changed
  if (targetTheatreId.toString() !== screen.theatre.toString() || newName !== screen.name) {
    const existing = await Screen.findOne({
      _id: { $ne: id },
      theatre: targetTheatreId,
      name: newName,
    });

    if (existing) {
      throw new AppError(
        `A screen named '${newName}' already exists in this theatre.`,
        409,
        'DUPLICATE'
      );
    }
  }

  // If layout changes, check if future shows have confirmed bookings (Spec B4)
  if (layout) {
    const ShowModel = mongoose.models.Show || mongoose.model('Show');
    const futureShows = await ShowModel.find({
      screen: id,
      startTime: { $gt: new Date() },
      status: 'scheduled',
    });

    if (futureShows.length > 0) {
      const showIds = futureShows.map((s) => s._id);
      const BookingModel = mongoose.models.Booking || mongoose.model('Booking');
      const hasBookings = await BookingModel.exists({
        show: { $in: showIds },
        status: BOOKING_STATUSES.CONFIRMED,
      });

      if (hasBookings) {
        throw new AppError(
          'Cannot modify screen layout while future shows have confirmed bookings.',
          409,
          'SCREEN_HAS_BOOKINGS'
        );
      }
    }

    screen.layout = layout;
    screen.totalSeats = calculateTotalSeats(layout);
  }

  if (theatreId) screen.theatre = theatreId;
  if (name) screen.name = newName;
  if (isActive !== undefined) screen.isActive = isActive;

  await screen.save();
  return screen;
};

export default {
  listScreens,
  getScreenById,
  createScreen,
  updateScreen,
};
