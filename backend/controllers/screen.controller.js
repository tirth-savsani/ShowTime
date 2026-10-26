import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess, sendList } from '../views/response.js';
import * as screenService from '../services/screen.service.js';
import { serializeScreen } from '../views/screen.view.js';

export const listScreens = catchAsync(async (req, res) => {
  const result = await screenService.listScreens({
    theatreId: req.query.theatre,
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
  });

  return sendList(
    res,
    200,
    'Screens fetched successfully',
    result.items.map(serializeScreen),
    result.pagination
  );
});

export const getScreenById = catchAsync(async (req, res) => {
  const screen = await screenService.getScreenById(req.params.id);

  return sendSuccess(res, 200, 'Screen details fetched successfully', serializeScreen(screen));
});

export const createScreen = catchAsync(async (req, res) => {
  const screen = await screenService.createScreen(req.body);

  return sendSuccess(res, 201, 'Screen created successfully', serializeScreen(screen));
});

export const updateScreen = catchAsync(async (req, res) => {
  const screen = await screenService.updateScreen(req.params.id, req.body);

  return sendSuccess(res, 200, 'Screen updated successfully', serializeScreen(screen));
});

export default {
  listScreens,
  getScreenById,
  createScreen,
  updateScreen,
};
