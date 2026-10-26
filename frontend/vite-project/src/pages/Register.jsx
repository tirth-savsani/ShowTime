import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthForm from '../components/layout/AuthForm.jsx';
import {
  registerUser,
  clearAuthError,
  clearRedirectTo,
} from '../store/slices/authSlice.js';

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, status, redirectTo } = useSelector((state) => state.auth);
  const [formServerError, setFormServerError] = useState(null);

  // If already authenticated, redirect to home (Spec C6)
  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate('/', { replace: true });
    }
  }, [user, status, navigate]);

  const handleSubmit = async (payload, onServerError) => {
    setFormServerError(null);
    dispatch(clearAuthError());

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      const newUser = result.payload;
      toast.success(`Welcome, ${newUser?.name || 'User'}!`);

      // Redirect-after-login uses authSlice.redirectTo; clear it after use (Spec C2, Task 10)
      if (redirectTo) {
        const dest = redirectTo;
        dispatch(clearRedirectTo());
        navigate(dest, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else if (result.payload) {
      const err = result.payload;
      if (err.code !== 'EMAIL_EXISTS' && !err.errors) {
        setFormServerError(err.message || 'Registration failed. Please try again.');
      }

      if (onServerError) {
        onServerError(err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-[420px] bg-white rounded-lg shadow-card border border-border p-6 sm:p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block focus:outline-none mb-3">
            <span className="text-2xl font-black text-primary tracking-tight uppercase">
              Show<span className="text-ink">Time</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-ink">Create your account</h1>
          <p className="text-xs text-muted mt-1">
            Join ShowTime for instant movie bookings and personalized offers
          </p>
        </div>

        <AuthForm
          mode="register"
          onSubmit={handleSubmit}
          onToggleMode={() => navigate('/login')}
          isLoading={status === 'loading'}
          serverError={formServerError}
        />
      </div>
    </div>
  );
};

export default Register;
