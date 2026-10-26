/**
 * Pure formatting utilities (Spec C3)
 */

const TIMEZONE = 'Asia/Kolkata';

/**
 * Format currency with Indian grouping (e.g. 'Rs. 1,250')
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs. 0';
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
};

/**
 * Format full date in Asia/Kolkata: 'Fri, 31 Oct 2026'
 */
export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format short date: '31 Oct'
 */
export const formatShortDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
  }).format(date);
};

/**
 * Format time in 12h format: '07:30 PM'
 */
export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Format date & time combined: 'Fri, 31 Oct | 07:30 PM'
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return `${formatDate(isoString)} | ${formatTime(isoString)}`;
};

/**
 * Format minutes into '2h 15m'
 */
export const formatDuration = (totalMinutes) => {
  if (!totalMinutes || isNaN(totalMinutes)) return '0m';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

/**
 * Convert array of seat IDs to comma-separated text: 'A1, A2'
 */
export const seatsToText = (seatIds = []) => {
  if (!Array.isArray(seatIds)) return '';
  return seatIds.join(', ');
};

/**
 * Normalise certificate label
 */
export const certificateLabel = (cert) => {
  if (!cert) return 'UA';
  const map = { U: 'U', UA: 'UA', A: 'A', S: 'S' };
  return map[cert.toUpperCase()] || cert;
};
