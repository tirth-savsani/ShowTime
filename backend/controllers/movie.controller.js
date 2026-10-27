import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as movieService from '../services/movie.service.js';
import { serializeMovieCard, serializeMovieDetail } from '../views/movie.view.js';

export const listMovies = catchAsync(async (req, res) => {
  const result = await movieService.listMovies({
    ...req.query,
    isAdmin: false,
  });

  return sendList(res, {
    statusCode: 200,
    message: 'Movies fetched successfully',
    items: result.items.map(serializeMovieCard),
    pagination: result.pagination,
  });
});

export const listAdminMovies = catchAsync(async (req, res) => {
  const result = await movieService.listMovies({
    ...req.query,
    isAdmin: true,
  });

  return sendList(res, {
    statusCode: 200,
    message: 'Admin movies fetched successfully',
    items: result.items.map(serializeMovieCard),
    pagination: result.pagination,
  });
});

export const getFeatured = catchAsync(async (req, res) => {
  const items = await movieService.getFeaturedMovies({ city: req.query.city });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Featured movies fetched successfully',
    data: {
      items: items.map(serializeMovieCard),
    },
  });
});

export const getMovieById = catchAsync(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id, false);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Movie details fetched successfully',
    data: serializeMovieDetail(movie),
  });
});

export const getAdminMovieById = catchAsync(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id, true);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Admin movie details fetched successfully',
    data: serializeMovieDetail(movie),
  });
});

export const createMovie = catchAsync(async (req, res) => {
  const movie = await movieService.createMovie(req.body, req.files);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Movie created successfully',
    data: serializeMovieDetail(movie),
  });
});

export const updateMovie = catchAsync(async (req, res) => {
  const movie = await movieService.updateMovie(req.params.id, req.body, req.files);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Movie updated successfully',
    data: serializeMovieDetail(movie),
  });
});

export const deleteMovie = catchAsync(async (req, res) => {
  await movieService.deleteMovie(req.params.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Movie deleted successfully',
  });
});

export default {
  listMovies,
  listAdminMovies,
  getFeatured,
  getMovieById,
  getAdminMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
