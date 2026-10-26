/**
 * Response serializers and envelope helpers (Spec B1, Rule 5)
 * Success: { success: true, message, data }
 * List: { success: true, message, data: { items, pagination } }
 * Error: { success: false, message, code, errors?, details? }
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendList = (res, statusCode = 200, message = 'Success', items = [], pagination = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      items,
      pagination,
    },
  });
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', code = 'SERVER_ERROR', errors = null, details = null) => {
  const payload = {
    success: false,
    message,
    code,
  };

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  if (details && Object.keys(details).length > 0) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};
