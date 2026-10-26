import { TIMEZONE } from '../config/constants.js';

/**
 * Returns the current date in IST formatted as YYYY-MM-DD
 * @returns {string}
 */
export const getTodayISTString = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
};

/**
 * Checks if a string is a valid YYYY-MM-DD calendar date
 * @param {string} str 
 * @returns {boolean}
 */
export const isValidDateString = (str) => {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return false;
  }
  const [year, month, day] = str.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * Computes start and end of a given calendar date in IST (Asia/Kolkata, UTC+05:30)
 * @param {string} dateString YYYY-MM-DD
 * @returns {{ dayStart: Date, dayEnd: Date }}
 */
export const getISTDayBounds = (dateString) => {
  const dayStart = new Date(`${dateString}T00:00:00+05:30`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  return { dayStart, dayEnd };
};

export default {
  getTodayISTString,
  isValidDateString,
  getISTDayBounds,
};
