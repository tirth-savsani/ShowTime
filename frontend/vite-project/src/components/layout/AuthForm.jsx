import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '../common/Button.jsx';
import {
  validateEmail,
  validateName,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
} from '../../utils/validators.js';

export const AuthForm = ({
  mode = 'login', // 'login' | 'register'
  onSubmit,
  onToggleMode,
  isLoading = false,
  serverError = null,
}) => {
  const isLogin = mode === 'login';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Inline Field Errors State
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength meter
  const passwordStrength = getPasswordStrength(formData.password);

  // Validate a single field
  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case 'name':
        if (!isLogin) error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        if (!isLogin) error = validatePhone(value);
        break;
      case 'password':
        if (isLogin) {
          if (!value) error = 'Password is required.';
        } else {
          error = validatePassword(value);
        }
        break;
      case 'confirmPassword':
        if (!isLogin) error = validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change if already touched
    if (touched[field]) {
      const error = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    if (!isLogin) {
      const nameErr = validateName(formData.name);
      if (nameErr) errors.name = nameErr;

      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) errors.phone = phoneErr;

      const confirmErr = validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      );
      if (confirmErr) errors.confirmPassword = confirmErr;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = isLogin
      ? !formData.password
        ? 'Password is required.'
        : null
      : validatePassword(formData.password);
    if (passErr) errors.password = passErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({
        name: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }

    // Pass data to parent onSubmit callback
    if (onSubmit) {
      onSubmit(
        isLogin
          ? { email: formData.email.trim(), password: formData.password }
          : {
              name: formData.name.trim(),
              email: formData.email.trim(),
              password: formData.password,
              phone: formData.phone.trim() || undefined,
            },
        // Error handler to map server errors
        (errorPayload) => {
          // Clear passwords on failure (Spec C6)
          setFormData((prev) => ({
            ...prev,
            password: '',
            confirmPassword: '',
          }));

          // Server error field mapping
          if (errorPayload) {
            const newFieldErrors = {};

            // 1. EMAIL_EXISTS mapping (Spec: EMAIL_EXISTS appears under email field)
            if (
              errorPayload.code === 'EMAIL_EXISTS' ||
              errorPayload.code === 'DUPLICATE'
            ) {
              newFieldErrors.email =
                errorPayload.message || 'An account with this email already exists.';
            }

            // 2. Map server errors[] array (Spec: VALIDATION_ERROR errors[] map to fields)
            if (Array.isArray(errorPayload.errors)) {
              errorPayload.errors.forEach((err) => {
                if (err.field) {
                  newFieldErrors[err.field] = err.message;
                }
              });
            }

            if (Object.keys(newFieldErrors).length > 0) {
              setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
            }
          }
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Form-Level Server Error Banner (e.g. INVALID_CREDENTIALS) */}
      {serverError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xs bg-red-50 border border-red-200 text-danger text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Full Name Field (Register only) */}
      {!isLogin && (
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="John Doe"
            className={`w-full h-11 px-3.5 text-sm bg-white border rounded-xs focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.name
                ? 'border-danger focus:ring-danger/20'
                : 'border-border focus:border-primary focus:ring-primary/20'
            }`}
          />
          {fieldErrors.name && (
            <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>
          )}
        </div>
      )}

      {/* Email Address Field */}
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">
          Email Address <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="you@example.com"
          className={`w-full h-11 px-3.5 text-sm bg-white border rounded-xs focus:outline-none focus:ring-2 transition-all ${
            fieldErrors.email
              ? 'border-danger focus:ring-danger/20'
              : 'border-border focus:border-primary focus:ring-primary/20'
          }`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>
        )}
      </div>

      {/* Mobile Number Field (Register only, optional) */}
      {!isLogin && (
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Mobile Number <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="10-digit mobile (e.g. 9876543210)"
            className={`w-full h-11 px-3.5 text-sm bg-white border rounded-xs focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.phone
                ? 'border-danger focus:ring-danger/20'
                : 'border-border focus:border-primary focus:ring-primary/20'
            }`}
          />
          {fieldErrors.phone && (
            <p className="text-xs text-danger mt-1">{fieldErrors.phone}</p>
          )}
        </div>
      )}

      {/* Password Field with Show/Hide Eye */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-ink">
            Password <span className="text-danger">*</span>
          </label>
        </div>
        <div className="relative flex items-center">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder={isLogin ? 'Enter your password' : 'Min 8 chars, 1 uppercase, 1 digit'}
            className={`w-full h-11 pl-3.5 pr-10 text-sm bg-white border rounded-xs focus:outline-none focus:ring-2 transition-all ${
              fieldErrors.password
                ? 'border-danger focus:ring-danger/20'
                : 'border-border focus:border-primary focus:ring-primary/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted hover:text-ink cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>
        )}

        {/* Password Strength Meter (Register only, Spec C8) */}
        {!isLogin && formData.password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">Password Strength</span>
              <span className={`font-bold ${passwordStrength.textColor}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field (Register only) */}
      {!isLogin && (
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Confirm Password <span className="text-danger">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Re-enter password"
              className={`w-full h-11 pl-3.5 pr-10 text-sm bg-white border rounded-xs focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.confirmPassword
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-border focus:border-primary focus:ring-primary/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-muted hover:text-ink cursor-pointer focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-danger mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        className="w-full h-11 text-sm font-bold mt-2"
      >
        {isLogin ? 'Sign In' : 'Create Account'}
      </Button>

      {/* Toggle Link */}
      <div className="pt-2 text-center text-xs text-muted">
        {isLogin ? (
          <p>
            New to ShowTime?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary font-bold hover:underline cursor-pointer ml-1"
            >
              Create an account
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary font-bold hover:underline cursor-pointer ml-1"
            >
              Sign in here
            </button>
          </p>
        )}
      </div>
    </form>
  );
};

export default AuthForm;
