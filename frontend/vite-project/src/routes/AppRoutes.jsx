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
const AdminLayout = lazy(() => import('../components/admin/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminMovies = lazy(() => import('../pages/admin/Movies.jsx'));
const AdminTheatres = lazy(() => import('../pages/admin/Theatres.jsx'));
const AdminScreens = lazy(() => import('../pages/admin/Screens.jsx'));
const AdminShows = lazy(() => import('../pages/admin/Shows.jsx'));
const AdminBookings = lazy(() => import('../pages/admin/Bookings.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/Users.jsx'));

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

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Protected Routes with Dedicated AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="theatres" element={<AdminTheatres />} />
          <Route path="screens" element={<AdminScreens />} />
          <Route path="shows" element={<AdminShows />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
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
