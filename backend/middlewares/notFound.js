import { sendError } from '../views/response.js';

export const notFound = (req, res, next) => {
  return sendError(res, 404, `Cannot find ${req.method} ${req.originalUrl} on this server`, 'NOT_FOUND');
};

export default notFound;
