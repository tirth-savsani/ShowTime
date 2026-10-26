import catchAsync from '../utils/catchAsync.js';
import bookingService from '../services/booking.service.js';

export const handleWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body;
  const result = await bookingService.handleWebhook(rawBody, signature);
  return res.status(200).json(result);
});

export default {
  handleWebhook,
};
