import api from './axios.js';

export const bookingsApi = {
  checkout: (showId) =>
    api.post('/api/bookings/checkout', { showId }),
  verifyPayment: (payload) =>
    api.post('/api/bookings/verify', payload),
  markFailed: (payload) =>
    api.post('/api/bookings/failed', payload),
  getMyBookings: (params = {}) =>
    api.get('/api/bookings/my', { params }),
  getBookingById: (id) =>
    api.get(`/api/bookings/${id}`),
  cancelBooking: (id) =>
    api.patch(`/api/bookings/${id}/cancel`),
};

export default bookingsApi;
