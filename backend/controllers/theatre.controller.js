import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as theatreService from '../services/theatre.service.js';
import { serializeTheatre } from '../views/theatre.view.js';

export const listTheatres = catchAsync(async (req, res) => {
  const result = await theatreService.listTheatres({
    ...req.query,
    isAdmin: false,
  });

  return sendList(
    res,
    200,
    'Theatres fetched successfully',
    result.items.map((t) => serializeTheatre(t)),
    result.pagination
  );
});

export const listAdminTheatres = catchAsync(async (req, res) => {
  const result = await theatreService.listTheatres({
    ...req.query,
    isAdmin: true,
  });

  return sendList(
    res,
    200,
    'Admin theatres fetched successfully',
    result.items.map((t) => serializeTheatre(t)),
    result.pagination
  );
});

export const getCities = catchAsync(async (req, res) => {
  const cities = await theatreService.getDistinctCities();

  return sendSuccess(res, 200, 'Cities fetched successfully', {
    items: cities,
  });
});

export const getTheatreById = catchAsync(async (req, res) => {
  const theatre = await theatreService.getTheatreById(req.params.id, false);

  return sendSuccess(res, 200, 'Theatre fetched successfully', serializeTheatre(theatre));
});

export const createTheatre = catchAsync(async (req, res) => {
  const theatre = await theatreService.createTheatre(req.body);

  return sendSuccess(res, 201, 'Theatre created successfully', serializeTheatre(theatre));
});

export const updateTheatre = catchAsync(async (req, res) => {
  const theatre = await theatreService.updateTheatre(req.params.id, req.body);

  return sendSuccess(res, 200, 'Theatre updated successfully', serializeTheatre(theatre));
});

export const updateStatus = catchAsync(async (req, res) => {
  const theatre = await theatreService.updateTheatreStatus(req.params.id, req.body.isActive);

  return sendSuccess(res, 200, 'Theatre status updated successfully', serializeTheatre(theatre));
});

export default {
  listTheatres,
  listAdminTheatres,
  getCities,
  getTheatreById,
  createTheatre,
  updateTheatre,
  updateStatus,
};
