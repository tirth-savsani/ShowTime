/**
 * Central Axios Instance (Phase 1.2, Spec C3)
 *
 * Rules:
 * - baseURL from VITE_API_URL (fallback http://localhost:8084)
 * - withCredentials: true
 * - timeout: 20000ms
 * - Unwraps response.data.data
 * - Normalizes errors to { status, code, message } using friendly copy
 * - Raw details logged to console.error only in development
 * - On 401 (except /auth/me and /auth/login), triggers logout and opens AuthModal
 * - On network error, toasts friendly network error with deduplication
 */

import axios from 'axios';
import { toast } from '../utils/toast.js';
import { getFriendlyErrorMessage } from '../utils/errorMessages.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8084';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Reference to Redux store set dynamically to avoid circular import issues
let storeRef = null;

export const injectStore = (store) => {
  storeRef = store;
};

// Response Interceptor (Spec C3, Phase 1.2)
api.interceptors.response.use(
  (response) => {
    // Spec: unwrap response.data.data
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // 1. Network / Timeout Errors
    if (!error.response) {
      const friendlyMsg = getFriendlyErrorMessage('NETWORK_ERROR', 0);
      toast.error(friendlyMsg);

      if (import.meta.env.DEV) {
        console.error('[Network / Timeout Error]', error);
      }

      return Promise.reject({
        status: 0,
        code: 'NETWORK_ERROR',
        message: friendlyMsg,
      });
    }

    const { status, data, config } = error.response;
    const url = config?.url || '';

    // 2. Resolve friendly error message from code or status
    const code = data?.code || (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN');
    const friendlyMessage = getFriendlyErrorMessage(code, status);

    if (import.meta.env.DEV) {
      console.error(`[API Error ${status}] ${config?.method?.toUpperCase()} ${url}:`, {
        rawServerResponse: data,
        code,
        friendlyMessage,
      });
    }

    const normalizedError = {
      status,
      code,
      message: friendlyMessage,
    };

    // 3. 401 Unauthorized handling (Spec C3)
    // Ignore 401 from /api/auth/me (initial boot probe) and /api/auth/login (invalid credentials)
    const isAuthProbe = url.includes('/auth/me') || url.includes('/auth/login');

    if (status === 401 && !isAuthProbe && storeRef) {
      storeRef.dispatch({ type: 'auth/handleUnauthorized' });
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
