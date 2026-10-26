/**
 * Catches asynchronous errors and passes them to the next error middleware.
 * Rule 6: Wrap async handlers with catchAsync.
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
