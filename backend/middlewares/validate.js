import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request parts with sanitized/transformed output from Zod
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      const formattedErrors = issues.map((err) => {
        // Strip the root selector (body/query/params) for clean field names
        const field = err.path.length > 1 ? err.path.slice(1).join('.') : err.path.join('.');
        return {
          field,
          message: err.message,
        };
      });

      return next(
        new AppError('Validation failed', 400, 'VALIDATION_ERROR', formattedErrors)
      );
    }
    next(error);
  }
};

export default validate;
