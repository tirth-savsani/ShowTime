/**
 * Toast helper with 3-second deduplication (Phase 1.2)
 * Prevents identical error/success toasts from firing multiple times within 3000ms.
 */

import hotToast from 'react-hot-toast';

const recentMessages = new Map();
const DEDUP_WINDOW_MS = 3000;

const shouldShow = (msg) => {
  if (!msg) return false;
  const str = typeof msg === 'string' ? msg : JSON.stringify(msg);
  const now = Date.now();
  const lastTime = recentMessages.get(str);

  if (lastTime && now - lastTime < DEDUP_WINDOW_MS) {
    return false;
  }

  recentMessages.set(str, now);

  // Prune map if large
  if (recentMessages.size > 50) {
    for (const [key, timestamp] of recentMessages.entries()) {
      if (now - timestamp >= DEDUP_WINDOW_MS) {
        recentMessages.delete(key);
      }
    }
  }

  return true;
};

export const toast = {
  error: (msg, opts) => {
    if (shouldShow(msg)) {
      return hotToast.error(msg, opts);
    }
  },
  success: (msg, opts) => {
    if (shouldShow(msg)) {
      return hotToast.success(msg, opts);
    }
  },
  loading: (msg, opts) => hotToast.loading(msg, opts),
  dismiss: (id) => hotToast.dismiss(id),
  custom: (fn, opts) => hotToast.custom(fn, opts),
};

export default toast;
