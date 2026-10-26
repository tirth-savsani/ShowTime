/**
 * Client-Side Validation Rules (Spec C8, mirrors Backend Spec B5)
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

/**
 * Validate user full name (2-60 chars)
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  const len = name.trim().length;
  if (len < 2 || len > 60) {
    return 'Name must be between 2 and 60 characters.';
  }
  return null;
};

/**
 * Validate phone number (optional, but if present must be 10 digits starting 6-9)
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return null; // Optional
  }
  const clean = phone.trim().replace(/[\s-]/g, '');
  if (!PHONE_REGEX.test(clean)) {
    return 'Mobile number must be 10 digits starting with 6, 7, 8, or 9.';
  }
  return null;
};

/**
 * Validate password (8-64 chars with uppercase, lowercase, and digit)
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (password.length > 64) {
    return 'Password cannot exceed 64 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one digit.';
  }
  return null;
};

/**
 * Validate password confirmation
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};

/**
 * Calculate password strength (weak, medium, strong)
 * Returns { label, percent, color, textColor }
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { label: '', percent: 0, color: 'bg-gray-200', textColor: 'text-muted' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      label: 'Weak',
      percent: 33,
      color: 'bg-danger',
      textColor: 'text-danger',
    };
  }
  if (score <= 4) {
    return {
      label: 'Medium',
      percent: 66,
      color: 'bg-orange',
      textColor: 'text-orange',
    };
  }
  return {
    label: 'Strong',
    percent: 100,
    color: 'bg-success',
    textColor: 'text-success',
  };
};

export default {
  validateEmail,
  validateName,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
};
