import catchAsync from '../utils/catchAsync.js';
import showService from '../services/show.service.js';
import { sendSuccess, sendList } from '../views/response.js';
import { formatShow } from '../views/show.view.js';

export const createShow = catchAsync(async (req, res) => {
  const show = await showService.createShow(req.body);
  return sendSuccess(res, 201, 'Show scheduled successfully', formatShow(show));
});

export const updateShow = catchAsync(async (req, res) => {
  const show = await showService.updateShow(req.params.id, req.body);
  return sendSuccess(res, 200, 'Show updated successfully', formatShow(show));
});

export const cancelShow = catchAsync(async (req, res) => {
  const cascade = req.query.cascade === true || req.query.cascade === 'true';
  const show = await showService.cancelShow(req.params.id, cascade);
  return sendSuccess(res, 200, 'Show cancelled successfully', formatShow(show));
});

export const getShowById = catchAsync(async (req, res) => {
  const show = await showService.getShowById(req.params.id);
  return sendSuccess(res, 200, 'Show fetched successfully', formatShow(show));
});

export const getAdminShows = catchAsync(async (req, res) => {
  const result = await showService.listAdminShows(req.query);
  return sendList(res, 'Shows fetched successfully', result.items.map(formatShow), result.pagination);
});

export const getMovieShows = catchAsync(async (req, res) => {
  const { date, city } = req.query;
  const data = await showService.listByMovie(req.params.id, { date, city });
  return sendSuccess(res, 200, 'Shows fetched successfully', data);
});

export default {
  createShow,
  updateShow,
  cancelShow,
  getShowById,
  getAdminShows,
  getMovieShows,
};
