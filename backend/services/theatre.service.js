import mongoose from 'mongoose';
import { Theatre, toTitleCase } from '../models/Theatre.js';
import { AppError } from '../utils/AppError.js';
import { BOOKING_STATUSES } from '../config/constants.js';

export const listTheatres = async ({
  city,
  search,
  page = 1,
  limit = 20,
  isAdmin = false,
}) => {
  const query = {};

  if (!isAdmin) {
    query.isActive = true;
  }

  if (city && city.trim() !== '') {
    query.city = toTitleCase(city);
  }

  if (search && search.trim() !== '') {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Theatre.find(query).sort({ city: 1, name: 1 }).skip(skip).limit(limit),
    Theatre.countDocuments(query),
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

export const getDistinctCities = async () => {
  const cities = await Theatre.distinct('city', { isActive: true });
  return cities.sort((a, b) => a.localeCompare(b));
};

export const getTheatreById = async (id, isAdmin = false) => {
  const query = { _id: id };
  if (!isAdmin) {
    query.isActive = true;
  }

  const theatre = await Theatre.findOne(query);
  if (!theatre) {
    throw new AppError('Theatre not found', 404, 'NOT_FOUND');
  }
  return theatre;
};

export const createTheatre = async (theatreData) => {
  const normalisedCity = toTitleCase(theatreData.city);

  // Check unique(city, name)
  const existing = await Theatre.findOne({
    city: normalisedCity,
    name: theatreData.name.trim(),
  });

  if (existing) {
    throw new AppError(
      `A theatre named '${theatreData.name}' already exists in ${normalisedCity}.`,
      409,
      'DUPLICATE'
    );
  }

  const theatre = await Theatre.create({
    ...theatreData,
    city: normalisedCity,
    name: theatreData.name.trim(),
  });

  return theatre;
};

export const updateTheatre = async (id, theatreData) => {
  const theatre = await Theatre.findById(id);
  if (!theatre) {
    throw new AppError('Theatre not found', 404, 'NOT_FOUND');
  }

  const newCity = theatreData.city ? toTitleCase(theatreData.city) : theatre.city;
  const newName = theatreData.name ? theatreData.name.trim() : theatre.name;

  // Check unique constraint if city or name changed
  if (newCity !== theatre.city || newName !== theatre.name) {
    const existing = await Theatre.findOne({
      _id: { $ne: id },
      city: newCity,
      name: newName,
    });

    if (existing) {
      throw new AppError(
        `A theatre named '${newName}' already exists in ${newCity}.`,
        409,
        'DUPLICATE'
      );
    }
  }

  if (theatreData.name) theatre.name = newName;
  if (theatreData.city) theatre.city = newCity;
  if (theatreData.address) theatre.address = theatreData.address;
  if (theatreData.amenities) theatre.amenities = theatreData.amenities;
  if (theatreData.isActive !== undefined) theatre.isActive = theatreData.isActive;

  await theatre.save();
  return theatre;
};

export const updateTheatreStatus = async (id, isActive) => {
  const theatre = await Theatre.findById(id);
  if (!theatre) {
    throw new AppError('Theatre not found', 404, 'NOT_FOUND');
  }

  // If deactivating, check if future shows have confirmed bookings (Spec B4)
  if (isActive === false) {
    const ShowModel = mongoose.models.Show || mongoose.model('Show');
    const futureShows = await ShowModel.find({
      theatre: id,
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
          'Cannot deactivate theatre with future confirmed bookings.',
          409,
          'THEATRE_HAS_BOOKINGS'
        );
      }
    }
  }

  theatre.isActive = isActive;
  await theatre.save();
  return theatre;
};

export default {
  listTheatres,
  getDistinctCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  updateTheatreStatus,
};
