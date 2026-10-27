import catchAsync from '../utils/catchAsync.js';
import showService from '../services/show.service.js';
import { sendSuccess, sendList } from '../views/response.js';
import { formatShow } from '../views/show.view.js';

export const createShow = catchAsync(async (req, res) => {
  const show = await showService.createShow(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Show scheduled successfully',
    data: formatShow(show),
  });
});

export const updateShow = catchAsync(async (req, res) => {
  const show = await showService.updateShow(req.params.id, req.body);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Show updated successfully',
    data: formatShow(show),
  });
});

export const cancelShow = catchAsync(async (req, res) => {
  const cascade = req.query.cascade === true || req.query.cascade === 'true';
  const show = await showService.cancelShow(req.params.id, cascade);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Show cancelled successfully',
    data: formatShow(show),
  });
});

export const getShowById = catchAsync(async (req, res) => {
  const show = await showService.getShowById(req.params.id);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Show fetched successfully',
    data: formatShow(show),
  });
});

export const getMovieShows = catchAsync(async (req, res) => {
  const { date, city } = req.query;
  const data = await showService.listByMovie(req.params.id, { date, city });
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Shows fetched successfully',
    data,
  });
});

export default {
  createShow,
  updateShow,
  cancelShow,
  getShowById,
  getMovieShows,
};
