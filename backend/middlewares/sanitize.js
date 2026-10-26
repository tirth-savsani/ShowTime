/**
 * Sanitize middleware to prevent Mongo Operator Injection (Spec B5, B8)
 * Strips any object keys starting with '$' or containing '.' in-place
 */
const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        sanitizeInPlace(item);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    }
  }
};

export const sanitize = (req, res, next) => {
  if (req.body) sanitizeInPlace(req.body);
  if (req.query) sanitizeInPlace(req.query);
  if (req.params) sanitizeInPlace(req.params);
  next();
};

export default sanitize;
