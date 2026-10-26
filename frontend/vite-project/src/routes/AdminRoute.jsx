import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../components/common/Spinner.jsx';
import { setRedirectTo, openAuthModal } from '../store/slices/authSlice.js';
import AccessDenied from '../pages/AccessDenied.jsx';

export const AdminRoute = ({ children }) => {
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

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Spinner size="lg" className="text-primary mb-4" />
        <p className="text-sm text-muted">Verifying administrator privileges...</p>
      </div>
    );
  }

  if (status === 'guest' || !user) {
    return <Navigate to="/" replace />;
  }

  // Non-admin -> AccessDenied page with Back to Home button (Spec C2)
  if (user.role !== 'admin') {
    return <AccessDenied />;
  }

  return children;
};

export default AdminRoute;
