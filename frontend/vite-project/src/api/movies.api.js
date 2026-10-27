import api from './axios.js';

export const moviesApi = {
  getMovies: (params = {}) => api.get('/api/movies', { params }),
  getSections: (params = {}) => api.get('/api/movies/sections', { params }),
  suggest: (q) => api.get('/api/movies/suggest', { params: { q } }),
  getFeaturedMovies: (params = {}) => api.get('/api/movies/featured', { params }),
  getMovieById: (id) => api.get(`/api/movies/${id}`),
  getCities: () => api.get('/api/theatres/cities'),
  getTheatres: (params = {}) => api.get('/api/theatres', { params }),
  getTheatreById: (id) => api.get(`/api/theatres/${id}`),
};

export default moviesApi;
