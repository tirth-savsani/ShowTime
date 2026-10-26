import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { openAuthModal } from '../store/slices/authSlice.js';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate('/');
    } else {
      dispatch(openAuthModal('login'));
    }
  }, [user, status, dispatch, navigate]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-sm text-muted">Opening Sign In dialog...</p>
    </div>
  );
};

export default Login;
