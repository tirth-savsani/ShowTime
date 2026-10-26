import { COOKIE_NAME } from '../config/constants.js';

/**
 * Shared cookie options for setting and clearing the auth token (Spec B8)
 * httpOnly: true, secure = production, sameSite = production ? none : lax, path: '/'
 */
export const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };
};

export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
};

export { COOKIE_NAME };
