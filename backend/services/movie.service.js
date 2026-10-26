import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';
import * as mediaService from './media.service.js';
import { AppError } from '../utils/AppError.js';
import { toTitleCase } from '../models/Theatre.js';
import { MOVIE_STATUSES, BOOKING_STATUSES } from '../config/constants.js';

export const listMovies = async ({
  search,
  genre,
  language,
  format,
  status = MOVIE_STATUSES.NOW_SHOWING,
  city,
  page = 1,
  limit = 12,
  sort = 'releaseDate',
  isAdmin = false,
}) => {
  const query = {};

  // Admin sees all non-deleted movies or filtered by status; public sees non-deleted only
  if (!isAdmin) {
    query.isDeleted = false;
  } else {
    query.isDeleted = false; // soft-deleted movies are excluded from active list (Spec B4)
  }

  if (status) {
    query.status = status;
  }

  if (search && search.trim() !== '') {
    query.$text = { $search: search.trim() };
  }

  if (genre) {
    query.genres = genre;
  }

  if (language) {
    query.languages = language;
  }

  if (format) {
    query.formats = format;
  }

  // Filter movies playing in city (Spec B4: movies that have at least one future scheduled show in that city)
  if (city && city.trim() !== '' && status !== MOVIE_STATUSES.COMING_SOON) {
    const normalisedCity = toTitleCase(city);
    // Find all movie IDs with future scheduled shows in that city
    const ShowModel = mongoose.models.Show || mongoose.model('Show');
    const movieIdsInCity = await ShowModel.distinct('movie', {
      city: normalisedCity,
      status: 'scheduled',
      startTime: { $gt: new Date() },
    });

    query._id = { $in: movieIdsInCity };
  }

  const sortOptions = {};
  if (sort === 'title') {
    sortOptions.title = 1;
  } else {
    sortOptions.releaseDate = -1;
    sortOptions.createdAt = -1;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Movie.find(query).sort(sortOptions).skip(skip).limit(limit),
    Movie.countDocuments(query),
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

export const getFeaturedMovies = async ({ city }) => {
  const query = {
    isDeleted: false,
    status: MOVIE_STATUSES.NOW_SHOWING,
  };

  if (city && city.trim() !== '') {
    const normalisedCity = toTitleCase(city);
    const ShowModel = mongoose.models.Show || mongoose.model('Show');
    const movieIdsInCity = await ShowModel.distinct('movie', {
      city: normalisedCity,
      status: 'scheduled',
      startTime: { $gt: new Date() },
    });

    query._id = { $in: movieIdsInCity };
  }

  // Return up to 5 newest now_showing movies with backdrop
  const items = await Movie.find(query)
    .sort({ releaseDate: -1, createdAt: -1 })
    .limit(5);

  return items;
};

export const getMovieById = async (id, isAdmin = false) => {
  const query = { _id: id };
  if (!isAdmin) {
    query.isDeleted = false;
  }

  const movie = await Movie.findOne(query);
  if (!movie) {
    throw new AppError('Movie not found', 404, 'NOT_FOUND');
  }
  return movie;
};

export const createMovie = async (movieData, files = {}) => {
  // Poster is required on create (Spec B3, B4)
  if (!files.poster || !files.poster[0]) {
    throw new AppError('Movie poster image is required', 400, 'UPLOAD_ERROR');
  }

  let uploadedPoster = null;
  let uploadedBackdrop = null;

  try {
    // 1. Upload poster
    uploadedPoster = await mediaService.uploadBuffer(
      files.poster[0].buffer,
      'showtime/movies'
    );

    // 2. Upload backdrop if provided
    if (files.backdrop && files.backdrop[0]) {
      uploadedBackdrop = await mediaService.uploadBuffer(
        files.backdrop[0].buffer,
        'showtime/movies'
      );
    }

    // 3. Create movie in DB
    const movie = await Movie.create({
      ...movieData,
      posterUrl: uploadedPoster.url,
      posterPublicId: uploadedPoster.publicId,
      backdropUrl: uploadedBackdrop ? uploadedBackdrop.url : null,
      backdropPublicId: uploadedBackdrop ? uploadedBackdrop.publicId : null,
    });

    return movie;
  } catch (error) {
    // Transactional cleanup: destroy uploaded assets if DB save fails
    if (uploadedPoster && uploadedPoster.publicId) {
      await mediaService.deleteAsset(uploadedPoster.publicId);
    }
    if (uploadedBackdrop && uploadedBackdrop.publicId) {
      await mediaService.deleteAsset(uploadedBackdrop.publicId);
    }
    throw error;
  }
};

export const updateMovie = async (id, movieData, files = {}) => {
  const movie = await Movie.findOne({ _id: id, isDeleted: false });
  if (!movie) {
    throw new AppError('Movie not found', 404, 'NOT_FOUND');
  }

  let newPoster = null;
  let newBackdrop = null;
  const oldPosterId = movie.posterPublicId;
  const oldBackdropId = movie.backdropPublicId;

  try {
    // Upload replacement poster if provided
    if (files.poster && files.poster[0]) {
      newPoster = await mediaService.uploadBuffer(
        files.poster[0].buffer,
        'showtime/movies'
      );
      movie.posterUrl = newPoster.url;
      movie.posterPublicId = newPoster.publicId;
    }

    // Upload replacement backdrop if provided
    if (files.backdrop && files.backdrop[0]) {
      newBackdrop = await mediaService.uploadBuffer(
        files.backdrop[0].buffer,
        'showtime/movies'
      );
      movie.backdropUrl = newBackdrop.url;
      movie.backdropPublicId = newBackdrop.publicId;
    }

    // Apply updated fields
    Object.assign(movie, movieData);
    await movie.save();

    // After DB save succeeds, delete old assets if replaced (Spec B6.12)
    if (newPoster && oldPosterId) {
      await mediaService.deleteAsset(oldPosterId);
    }
    if (newBackdrop && oldBackdropId) {
      await mediaService.deleteAsset(oldBackdropId);
    }

    return movie;
  } catch (error) {
    // If DB write fails, delete newly uploaded assets (no orphans)
    if (newPoster && newPoster.publicId) {
      await mediaService.deleteAsset(newPoster.publicId);
    }
    if (newBackdrop && newBackdrop.publicId) {
      await mediaService.deleteAsset(newBackdrop.publicId);
    }
    throw error;
  }
};

export const deleteMovie = async (id) => {
  const movie = await Movie.findOne({ _id: id, isDeleted: false });
  if (!movie) {
    throw new AppError('Movie not found', 404, 'NOT_FOUND');
  }

  // Check if future shows with confirmed bookings exist (Spec B4)
  const ShowModel = mongoose.models.Show || mongoose.model('Show');
  const futureShows = await ShowModel.find({
    movie: id,
    startTime: { $gt: new Date() },
    status: 'scheduled',
  });

  if (futureShows.length > 0) {
    const showIds = futureShows.map((s) => s._id);
    const BookingModel = mongoose.models.Booking || mongoose.model('Booking');
    const confirmedBooking = await BookingModel.exists({
      show: { $in: showIds },
      status: BOOKING_STATUSES.CONFIRMED,
    });

    if (confirmedBooking) {
      throw new AppError(
        'Cannot delete movie: there are future shows with confirmed bookings.',
        409,
        'MOVIE_HAS_BOOKINGS'
      );
    }
  }

  // Soft delete (Spec B4)
  movie.isDeleted = true;
  movie.status = MOVIE_STATUSES.ARCHIVED;
  await movie.save();

  return movie;
};

export default {
  listMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
