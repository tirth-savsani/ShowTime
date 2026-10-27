import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { REFUND_STATUSES } from '../config/constants.js';

/**
 * Creates an order in Razorpay (Spec B6.4, B6.9)
 * Amount must be integer in paise
 */
export const createOrder = async (amountInPaise, receipt, notes = {}) => {
  try {
    const options = {
      amount: Math.round(amountInPaise),
      currency: 'INR',
      receipt: String(receipt).slice(0, 40),
      notes,
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (err) {
    throw new AppError(
      'Payment provider error while creating order',
      502,
      'PAYMENT_PROVIDER_ERROR',
      null,
      { originalError: err.message }
    );
  }
};

/**
 * Verifies Razorpay checkout signature using HMAC SHA256 and constant-time comparison (Spec B6.5)
 */
export const verifySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET;
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
};

/**
 * Verifies Razorpay webhook signature (Spec B6.9)
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_WEBHOOK_SECRET;
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
};

/**
 * Refunds a captured payment (Spec B6.6)
 */
export const refund = async (paymentId, amountInPaise, notes = {}) => {
  try {
    const refundRes = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amountInPaise),
      notes,
    });
    return {
      id: refundRes.id,
      amount: refundRes.amount ? Math.round(refundRes.amount / 100) : Math.round(amountInPaise / 100),
      status: refundRes.status ? String(refundRes.status).toUpperCase() : REFUND_STATUSES.PROCESSED,
      at: new Date(),
    };
  } catch (err) {
    return {
      id: null,
      amount: Math.round(amountInPaise / 100),
      status: REFUND_STATUSES.FAILED,
      at: new Date(),
      error: err.message,
    };
  }
};

/**
 * Fetches payment details from Razorpay
 */
export const fetchPayment = async (paymentId) => {
  try {
    return await razorpayInstance.payments.fetch(paymentId);
  } catch (err) {
    throw new AppError('Could not fetch payment from payment provider', 502, 'PAYMENT_FETCH_FAILED', null, { originalError: err.message });
  }
};

/**
 * Captures an authorized payment
 */
export const capturePayment = async (paymentId, amountInPaise, currency = 'INR') => {
  try {
    return await razorpayInstance.payments.capture(paymentId, Math.round(amountInPaise), currency);
  } catch (err) {
    throw new AppError('Failed to capture payment', 502, 'PAYMENT_CAPTURE_FAILED', null, { originalError: err.message });
  }
};

/**
 * Fetches all payments associated with an order
 */
export const fetchOrderPayments = async (orderId) => {
  try {
    return await razorpayInstance.orders.fetchPayments(orderId);
  } catch (err) {
    throw new AppError('Could not fetch order payments from payment provider', 502, 'ORDER_PAYMENTS_FETCH_FAILED', null, { originalError: err.message });
  }
};

export default {
  createOrder,
  verifySignature,
  verifyWebhookSignature,
  refund,
  fetchPayment,
  capturePayment,
  fetchOrderPayments,
};
