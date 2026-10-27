import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as theatreService from '../services/theatre.service.js';
import { serializeTheatre } from '../views/theatre.view.js';

export const listTheatres = catchAsync(async (req, res) => {
  const result = await theatreService.listTheatres({
    ...req.query,
    isAdmin: false,
  });

  return sendList(res, {
    statusCode: 200,
    message: 'Theatres fetched successfully',
    items: result.items.map((t) => serializeTheatre(t)),
    pagination: result.pagination,
  });
});

export const listAdminTheatres = catchAsync(async (req, res) => {
  const result = await theatreService.listTheatres({
    ...req.query,
    isAdmin: true,
  });

  return sendList(res, {
    statusCode: 200,
    message: 'Admin theatres fetched successfully',
    items: result.items.map((t) => serializeTheatre(t)),
    pagination: result.pagination,
  });
});

export const getCities = catchAsync(async (req, res) => {
  const cities = await theatreService.getDistinctCities();

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Cities fetched successfully',
    data: {
      items: cities,
    },
  });
});

export const getTheatreById = catchAsync(async (req, res) => {
  const theatre = await theatreService.getTheatreById(req.params.id, false);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Theatre fetched successfully',
    data: serializeTheatre(theatre),
  });
});

export const createTheatre = catchAsync(async (req, res) => {
  const theatre = await theatreService.createTheatre(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Theatre created successfully',
    data: serializeTheatre(theatre),
  });
});

export const updateTheatre = catchAsync(async (req, res) => {
  const theatre = await theatreService.updateTheatre(req.params.id, req.body);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Theatre updated successfully',
    data: serializeTheatre(theatre),
  });
});

export const updateStatus = catchAsync(async (req, res) => {
  const theatre = await theatreService.updateTheatreStatus(req.params.id, req.body.isActive);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Theatre status updated successfully',
    data: serializeTheatre(theatre),
  });
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
