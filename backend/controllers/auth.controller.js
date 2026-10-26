import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../views/response.js';
import * as authService from '../services/auth.service.js';
import { serializeUser } from '../views/user.view.js';
import { getAuthCookieOptions, getClearCookieOptions, COOKIE_NAME } from '../utils/cookie.js';

export const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  // Set httpOnly cookie
  res.cookie(COOKIE_NAME, token, getAuthCookieOptions());

  return sendSuccess(res, 201, 'User registered successfully', {
    user: serializeUser(user),
  });
});

export const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  // Set httpOnly cookie
  res.cookie(COOKIE_NAME, token, getAuthCookieOptions());

  return sendSuccess(res, 200, 'Login successful', {
    user: serializeUser(user),
  });
});

export const logout = catchAsync(async (req, res) => {
  // Clear httpOnly cookie with identical options (Spec B8)
  res.clearCookie(COOKIE_NAME, getClearCookieOptions());

  return sendSuccess(res, 200, 'Logged out successfully');
});

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id || req.user.id);

  return sendSuccess(res, 200, 'Current user profile fetched', {
    user: serializeUser(user),
  });
});

export default {
  register,
  login,
  logout,
  getMe,
};
