import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as movieService from '../services/movie.service.js';
import { serializeMovieCard, serializeMovieDetail } from '../views/movie.view.js';

export const listMovies = catchAsync(async (req, res) => {
  const result = await movieService.listMovies(req.query);

  return sendList(res, {
    statusCode: 200,
    message: 'Movies fetched successfully',
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
  const movie = await movieService.getMovieById(req.params.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Movie details fetched successfully',
    data: serializeMovieDetail(movie),
  });
});

export default {
  listMovies,
  getFeatured,
  getMovieById,
};
