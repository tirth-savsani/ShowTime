import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';
import { AppError } from '../utils/AppError.js';
import { toTitleCase } from '../models/Theatre.js';
import { MOVIE_STATUSES } from '../config/constants.js';

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
} = {}) => {
  const query = {
    isDeleted: false,
  };

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

  // Filter movies playing in city (movies that have at least one future scheduled show in that city)
  if (city && city.trim() !== '' && status !== MOVIE_STATUSES.COMING_SOON) {
    const normalisedCity = toTitleCase(city);
    const ShowModel = mongoose.models.Show || mongoose.model('Show');
    const movieIdsInCity = await ShowModel.distinct('movie', {
      city: normalisedCity,
      status: 'scheduled',
      startTime: { $gt: new Date() },
    });

    query._id = { $in: movieIdsInCity };
  }

  // Determine sort order
  let sortOption = { releaseDate: -1, createdAt: -1 };
  if (sort === 'title') {
    sortOption = { title: 1 };
  } else if (sort === 'duration') {
    sortOption = { durationMin: 1 };
  } else if (sort === 'releaseDateDesc') {
    sortOption = { releaseDate: -1 };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (parsedPage - 1) * parsedLimit;

  const [total, items] = await Promise.all([
    Movie.countDocuments(query),
    Movie.find(query).sort(sortOption).skip(skip).limit(parsedLimit),
  ]);

  return {
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit) || 1,
    },
  };
};

export const getFeaturedMovies = async ({ city } = {}) => {
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
    if (movieIdsInCity.length > 0) {
      query._id = { $in: movieIdsInCity };
    }
  }

  const items = await Movie.find(query)
    .sort({ releaseDate: -1, createdAt: -1 })
    .limit(5);

  return items;
};

export const getMovieById = async (id) => {
  const movie = await Movie.findOne({ _id: id, isDeleted: false });
  if (!movie) {
    throw new AppError('Movie not found', 404, 'NOT_FOUND');
  }
  return movie;
};

export const getMovieSections = async ({ city } = {}) => {
  const queryNowShowing = {
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

    if (movieIdsInCity.length > 0) {
      queryNowShowing._id = { $in: movieIdsInCity };
    }
  }

  const [nowShowing, comingSoon, trending] = await Promise.all([
    Movie.find(queryNowShowing)
      .sort({ releaseDate: -1, rating: -1, createdAt: -1 })
      .limit(16),
    Movie.find({ isDeleted: false, status: MOVIE_STATUSES.COMING_SOON })
      .sort({ releaseDate: 1 })
      .limit(12),
    Movie.find({ isDeleted: false, status: MOVIE_STATUSES.NOW_SHOWING })
      .sort({ rating: -1, votes: -1 })
      .limit(10),
  ]);

  return {
    nowShowing,
    comingSoon,
    trending,
  };
};

export const suggestMovies = async ({ q } = {}) => {
  if (!q || typeof q !== 'string' || q.trim() === '') {
    return [];
  }

  const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const movies = await Movie.find({
    isDeleted: false,
    title: { $regex: regex },
  })
    .sort({ rating: -1, releaseDate: -1 })
    .limit(6)
    .select('_id title posterUrl certificate languages genres formats rating status');

  return movies;
};

export default {
  listMovies,
  getFeaturedMovies,
  getMovieById,
  getMovieSections,
  suggestMovies,
};
