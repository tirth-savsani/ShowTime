import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import MinimalLayout from '../components/layout/MinimalLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Lazy-loaded pages (Spec C1, C2)
const Home = lazy(() => import('../pages/Home.jsx'));
const Explore = lazy(() => import('../pages/Explore.jsx'));
const MovieDetail = lazy(() => import('../pages/MovieDetail.jsx'));
const Shows = lazy(() => import('../pages/Shows.jsx'));
const SeatSelection = lazy(() => import('../pages/SeatSelection.jsx'));
const Checkout = lazy(() => import('../pages/Checkout.jsx'));
const Confirmation = lazy(() => import('../pages/Confirmation.jsx'));
const MyBookings = lazy(() => import('../pages/MyBookings.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));
import AccessDenied from '../pages/AccessDenied.jsx';
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <Spinner size="lg" className="text-primary mb-3" />
    <span className="text-xs text-muted">Loading page...</span>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore/movies" element={<Explore />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/movies/:id/shows" element={<Shows />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* User Protected Routes with MainLayout */}
          <Route
            path="/booking/:id/confirmation"
            element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Minimal Layout Routes (Seats & Checkout) */}
        <Route element={<MinimalLayout />}>
          <Route
            path="/shows/:showId/seats"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:showId"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
