import api from './axios.js';

export const adminApi = {
  getStats: (days = 14) => api.get('/api/admin/stats', { params: { days } }),

  // Movies
  getMovies: (params = {}) => api.get('/api/admin/movies', { params }),
  getMovieById: (id) => api.get(`/api/admin/movies/${id}`),
  createMovie: (formData) =>
    api.post('/api/admin/movies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMovie: (id, formData) =>
    api.put(`/api/admin/movies/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteMovie: (id) => api.delete(`/api/admin/movies/${id}`),

  // Theatres
  getTheatres: (params = {}) => api.get('/api/admin/theatres', { params }),
  createTheatre: (payload) => api.post('/api/admin/theatres', payload),
  updateTheatre: (id, payload) => api.put(`/api/admin/theatres/${id}`, payload),
  updateTheatreStatus: (id, isActive) =>
    api.patch(`/api/admin/theatres/${id}/status`, { isActive }),

  // Screens
  getScreens: (params = {}) => api.get('/api/admin/screens', { params }),
  createScreen: (payload) => api.post('/api/admin/screens', payload),
  updateScreen: (id, payload) => api.put(`/api/admin/screens/${id}`, payload),

  // Shows
  getShows: (params = {}) => api.get('/api/admin/shows', { params }),
  createShow: (payload) => api.post('/api/admin/shows', payload),
  updateShow: (id, payload) => api.put(`/api/admin/shows/${id}`, payload),
  cancelShow: (id) => api.delete(`/api/admin/shows/${id}`),

  // Bookings
  getBookings: (params = {}) => api.get('/api/admin/bookings', { params }),
  cancelBooking: (id) => api.patch(`/api/admin/bookings/${id}/cancel`),

  // Users
  getUsers: (params = {}) => api.get('/api/admin/users', { params }),
  updateUserStatus: (id, isActive) =>
    api.patch(`/api/admin/users/${id}/status`, { isActive }),
};

export default adminApi;
