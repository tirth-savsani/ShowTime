import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../components/common/Spinner.jsx';
import { setRedirectTo, openAuthModal } from '../store/slices/authSlice.js';

export const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'guest') {
      const fullPath = location.pathname + location.search;
      dispatch(setRedirectTo(fullPath));
      dispatch(openAuthModal('login'));
    }
  }, [status, location, dispatch]);

  // While auth status is loading, display a full-page spinner (Spec C2)
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Spinner size="lg" className="text-primary mb-4" />
        <p className="text-sm text-muted">Checking authentication...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to home (modal opens automatically via useEffect)
  if (status === 'guest' || !user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
