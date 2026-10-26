/**
 * Central Axios Instance (Spec C3)
 *
 * Rules:
 * - baseURL from VITE_API_URL (fallback http://localhost:8084)
 * - withCredentials: true
 * - timeout: 20000ms
 * - Unwraps response.data.data
 * - Normalizes errors to { status, code, message, details }
 * - On 401 (except /auth/me and /auth/login), triggers logout and opens AuthModal
 * - On network error, toasts 'Network error. Check your connection.'
 */

import axios from 'axios';
import toast from 'react-hot-toast';

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

// Response Interceptor (Spec C3)
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
      toast.error('Network error. Check your connection.');
      return Promise.reject({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Network error. Check your connection.',
        details: null,
      });
    }

    const { status, data, config } = error.response;
    const url = config?.url || '';

    // 2. Normalize server error payload
    const normalizedError = {
      status,
      code: data?.code || 'ERROR',
      message: data?.message || 'An unexpected error occurred.',
      details: data?.details || data?.errors || null,
    };

    // 3. 401 Unauthorized handling (Spec C3)
    // Ignore 401 from /api/auth/me (initial boot probe) and /api/auth/login (invalid credentials)
    const isAuthProbe = url.includes('/auth/me') || url.includes('/auth/login');

    if (status === 401 && !isAuthProbe && storeRef) {
      // Lazy import or call stored dispatch to reset auth state and open AuthModal
      storeRef.dispatch({ type: 'auth/handleUnauthorized' });
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
