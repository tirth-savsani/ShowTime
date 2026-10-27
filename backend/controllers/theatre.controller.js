import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as theatreService from '../services/theatre.service.js';
import { serializeTheatre } from '../views/theatre.view.js';

export const listTheatres = catchAsync(async (req, res) => {
  const result = await theatreService.listTheatres(req.query);

  return sendList(res, {
    statusCode: 200,
    message: 'Theatres fetched successfully',
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
  const theatre = await theatreService.getTheatreById(req.params.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Theatre fetched successfully',
    data: serializeTheatre(theatre),
  });
});

export default {
  listTheatres,
  getCities,
  getTheatreById,
};
