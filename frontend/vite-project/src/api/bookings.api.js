import api from './axios.js';

export const bookingsApi = {
  checkout: (showId) =>
    api.post('/api/bookings/checkout', { showId }),
  verifyPayment: (payload) =>
    api.post('/api/bookings/verify', payload),
  markFailed: (id, reason = 'Payment dismissed by user') =>
    api.post(`/api/bookings/${id}/failed`, { reason }),
  getMyBookings: (params = {}) =>
    api.get('/api/bookings/my', { params }),
  getBookingById: (id) =>
    api.get(`/api/bookings/${id}`),
  cancelBooking: (id, reason = 'Customer cancelled') =>
    api.post(`/api/bookings/${id}/cancel`, { reason }),
};

export default bookingsApi;
