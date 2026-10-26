import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import {
  closeAuthModal,
  setAuthModalMode,
  loginUser,
  registerUser,
  clearAuthError,
  clearRedirectTo,
} from '../../store/slices/authSlice.js';

export const AuthModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authModal, status, error, redirectTo } = useSelector(
    (state) => state.auth
  );

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const isLogin = authModal.mode === 'login';
  const isLoading = status === 'loading';

  const handleClose = () => {
    dispatch(closeAuthModal());
    dispatch(clearAuthError());
  };

  const handleToggleMode = () => {
    dispatch(clearAuthError());
    dispatch(setAuthModalMode(isLogin ? 'register' : 'login'));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(loginForm));
    if (loginUser.fulfilled.match(result)) {
      if (redirectTo) {
        navigate(redirectTo);
        dispatch(clearRedirectTo());
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(registerForm));
    if (registerUser.fulfilled.match(result)) {
      if (redirectTo) {
        navigate(redirectTo);
        dispatch(clearRedirectTo());
      }
    }
  };

  return (
    <Modal
      isOpen={authModal.open}
      onClose={handleClose}
      title={isLogin ? 'Welcome Back to ShowTime' : 'Create ShowTime Account'}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="p-3 text-xs text-danger bg-red-50 border border-red-200 rounded-xs">
            {error}
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                placeholder="you@example.com"
                className="w-full h-11 px-3 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full h-11 px-3 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
                placeholder="Jane Doe"
                className="w-full h-11 px-3 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                placeholder="you@example.com"
                className="w-full h-11 px-3 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                placeholder="At least 8 characters"
                className="w-full h-11 px-3 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, phone: e.target.value })
                }
                placeholder="10-digit mobile"
                className="w-full h-11 px-3 text-sm bg-white border border-border rounded-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>
        )}

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-muted border-t border-border">
          {isLogin ? (
            <p>
              New to ShowTime?{' '}
              <button
                type="button"
                onClick={handleToggleMode}
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
                onClick={handleToggleMode}
                className="text-primary font-bold hover:underline cursor-pointer ml-1"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
