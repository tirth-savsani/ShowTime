import Razorpay from 'razorpay';
import { env } from './env.js';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID || 'dummy_key_id',
      key_secret: env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
    });
  }
  return razorpayInstance;
};

export default getRazorpayInstance();
