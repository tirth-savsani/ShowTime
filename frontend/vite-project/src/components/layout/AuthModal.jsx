import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../common/Modal.jsx';
import AuthForm from './AuthForm.jsx';
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

  const { authModal, status, redirectTo } = useSelector((state) => state.auth);
  const [formServerError, setFormServerError] = useState(null);

  const isLogin = authModal.mode === 'login';
  const isLoading = status === 'loading';

  const handleClose = () => {
    dispatch(closeAuthModal());
    dispatch(clearAuthError());
    setFormServerError(null);
  };

  const handleToggleMode = () => {
    dispatch(clearAuthError());
    setFormServerError(null);
    dispatch(setAuthModalMode(isLogin ? 'register' : 'login'));
  };

  const handleSubmit = async (payload, onServerError) => {
    setFormServerError(null);
    dispatch(clearAuthError());

    const action = isLogin ? loginUser(payload) : registerUser(payload);
    const result = await dispatch(action);

    if (loginUser.fulfilled.match(result) || registerUser.fulfilled.match(result)) {
      const user = result.payload;
      toast.success(`Welcome, ${user?.name || 'User'}!`);
      handleClose();

      // Redirect after login (Spec: redirect-after-login uses authSlice.redirectTo; clear it after use)
      if (redirectTo) {
        const dest = redirectTo;
        dispatch(clearRedirectTo());
        navigate(dest);
      }
    } else if (result.payload) {
      const err = result.payload;
      // Handle form-level error (e.g. INVALID_CREDENTIALS)
      if (err.code === 'INVALID_CREDENTIALS' || err.status === 401) {
        setFormServerError('Invalid email address or password.');
      } else if (err.code !== 'EMAIL_EXISTS' && !err.errors) {
        setFormServerError(err.message || 'Authentication failed. Please try again.');
      }

      // Delegate field-level mapping (including EMAIL_EXISTS) to the form
      if (onServerError) {
        onServerError(err);
      }
    }
  };

  return (
    <Modal
      isOpen={authModal.open}
      onClose={handleClose}
      title={isLogin ? 'Sign in to ShowTime' : 'Create an Account'}
      maxWidth="max-w-[420px]" // Spec C6: Modal 420px
    >
      <AuthForm
        mode={authModal.mode}
        onSubmit={handleSubmit}
        onToggleMode={handleToggleMode}
        isLoading={isLoading}
        serverError={formServerError}
      />
    </Modal>
  );
};

export default AuthModal;
