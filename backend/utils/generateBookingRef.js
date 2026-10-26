import crypto from 'crypto';
import { BOOKING_REF_PREFIX } from '../config/constants.js';

const CHARACTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generates a human-readable booking reference (e.g. SHT-K7M2QX)
 * Uses crypto.randomInt to select 6 random chars from unambiguous alphabet (Spec B6.9)
 * @returns {string}
 */
export const generateBookingRef = () => {
  let ref = `${BOOKING_REF_PREFIX}-`;
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, CHARACTERS.length);
    ref += CHARACTERS[randomIndex];
  }
  return ref;
};

export default generateBookingRef;
