/**
 * Response serializers and envelope helpers (Spec B1, Rule 5)
 * Success: { success: true, message, data }
 * List: { success: true, message, data: { items, pagination } }
 * Error: { success: false, message, code, errors?, details? }
 */

/**
 * Validates that statusCode is an integer between 100 and 599.
 * In development, throws a TypeError if invalid.
 * In production, logs and safely falls back to 500.
 */
export const validateStatusCode = (statusCode) => {
  const isInteger = typeof statusCode === 'number' && Number.isInteger(statusCode);
  if (!isInteger || statusCode < 100 || statusCode > 599) {
    if (process.env.NODE_ENV !== 'production') {
      throw new TypeError(
        `Invalid status code: ${JSON.stringify(statusCode)}. Status code must be an integer between 100 and 599.`
      );
    }
    console.error(`[WARN] Invalid status code ${JSON.stringify(statusCode)} received, falling back to 500 in production.`);
    return 500;
  }
  return statusCode;
};

export const sendSuccess = (res, options = {}, ...rest) => {
  let statusCode = 200;
  let message = 'Success';
  let data = {};

  if (typeof options === 'number') {
    // Positional: sendSuccess(res, 200, 'message', data)
    statusCode = options;
    message = rest[0] ?? 'Success';
    data = rest[1] ?? {};
  } else if (typeof options === 'string') {
    // Positional with swapped arguments: sendSuccess(res, 'message', data)
    message = options;
    data = rest[0] ?? {};
    statusCode = typeof rest[1] === 'number' ? rest[1] : 200;
  } else if (options && typeof options === 'object') {
    // Named arguments: sendSuccess(res, { message, data, statusCode })
    statusCode = options.statusCode ?? 200;
    message = options.message ?? 'Success';
    data = options.data ?? {};
  }

  const validStatus = validateStatusCode(statusCode);
  return res.status(validStatus).json({
    success: true,
    message,
    data,
  });
};

export const sendList = (res, options = {}, ...rest) => {
  let statusCode = 200;
  let message = 'Success';
  let items = [];
  let pagination = {};

  if (typeof options === 'number') {
    // Positional: sendList(res, 200, 'message', items, pagination)
    statusCode = options;
    message = rest[0] ?? 'Success';
    items = rest[1] ?? [];
    pagination = rest[2] ?? {};
  } else if (typeof options === 'string') {
    // Positional with swapped arguments: sendList(res, 'message', items, pagination)
    message = options;
    items = rest[0] ?? [];
    pagination = rest[1] ?? {};
    statusCode = 200;
  } else if (options && typeof options === 'object') {
    // Named arguments: sendList(res, { message, items, pagination, statusCode })
    statusCode = options.statusCode ?? 200;
    message = options.message ?? 'Success';
    items = options.items ?? [];
    pagination = options.pagination ?? {};
  }

  const validStatus = validateStatusCode(statusCode);
  return res.status(validStatus).json({
    success: true,
    message,
    data: {
      items,
      pagination,
    },
  });
};

export const sendError = (res, options = {}, ...rest) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'SERVER_ERROR';
  let errors = null;
  let details = null;

  if (typeof options === 'number') {
    // Positional: sendError(res, 500, 'message', 'CODE', errors, details)
    statusCode = options;
    message = rest[0] ?? 'Internal Server Error';
    code = rest[1] ?? 'SERVER_ERROR';
    errors = rest[2] ?? null;
    details = rest[3] ?? null;
  } else if (typeof options === 'string') {
    message = options;
    statusCode = typeof rest[0] === 'number' ? rest[0] : 500;
    code = rest[1] ?? 'SERVER_ERROR';
  } else if (options && typeof options === 'object') {
    // Named arguments: sendError(res, { message, code, statusCode, errors, details })
    statusCode = options.statusCode ?? 500;
    message = options.message ?? 'Internal Server Error';
    code = options.code ?? 'SERVER_ERROR';
    errors = options.errors ?? null;
    details = options.details ?? null;
  }

  const validStatus = validateStatusCode(statusCode);
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

  return res.status(validStatus).json(payload);
};

export default {
  validateStatusCode,
  sendSuccess,
  sendList,
  sendError,
};
