import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as movieService from '../services/movie.service.js';
import { serializeMovieCard, serializeMovieDetail } from '../views/movie.view.js';

export const listMovies = catchAsync(async (req, res) => {
  const result = await movieService.listMovies({
    ...req.query,
    isAdmin: false,
  });

  return sendList(
    res,
    200,
    'Movies fetched successfully',
    result.items.map(serializeMovieCard),
    result.pagination
  );
});

export const listAdminMovies = catchAsync(async (req, res) => {
  const result = await movieService.listMovies({
    ...req.query,
    isAdmin: true,
  });

  return sendList(
    res,
    200,
    'Admin movies fetched successfully',
    result.items.map(serializeMovieCard),
    result.pagination
  );
});

export const getFeatured = catchAsync(async (req, res) => {
  const items = await movieService.getFeaturedMovies({ city: req.query.city });

  return sendSuccess(res, 200, 'Featured movies fetched successfully', {
    items: items.map(serializeMovieCard),
  });
});

export const getMovieById = catchAsync(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id, false);

  return sendSuccess(res, 200, 'Movie details fetched successfully', serializeMovieDetail(movie));
});

export const getAdminMovieById = catchAsync(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id, true);

  return sendSuccess(res, 200, 'Admin movie details fetched successfully', serializeMovieDetail(movie));
});

export const createMovie = catchAsync(async (req, res) => {
  const movie = await movieService.createMovie(req.body, req.files);

  return sendSuccess(res, 201, 'Movie created successfully', serializeMovieDetail(movie));
});

export const updateMovie = catchAsync(async (req, res) => {
  const movie = await movieService.updateMovie(req.params.id, req.body, req.files);

  return sendSuccess(res, 200, 'Movie updated successfully', serializeMovieDetail(movie));
});

export const deleteMovie = catchAsync(async (req, res) => {
  await movieService.deleteMovie(req.params.id);

  return sendSuccess(res, 200, 'Movie deleted successfully');
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
